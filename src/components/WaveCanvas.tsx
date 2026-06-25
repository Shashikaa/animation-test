"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  AmbientLight,
  VideoTexture,
  LinearFilter,
  NoColorSpace,
  NoToneMapping,
  SRGBColorSpace,
  ShaderMaterial,
  Vector2,
} from "three";
import LiquidBackgroundFn from "../app/utils/liquidBackground";

type WaveCanvasProps = {
  imageSrc?: string;
  onReady?: () => void;
};

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D map;
  uniform sampler2D displacementMap;
  uniform vec2 uvMapScale;
  uniform float displacementScale;
  varying vec2 vUv;

  void main() {
    vec4 disp = texture2D(displacementMap, vUv);
    vec3 normal = vec3(disp.b, disp.a, sqrt(max(0.0, 1.0 - dot(disp.ba, disp.ba))));

    vec2 dUv = normal.xy * displacementScale * 0.04;
    
    vec2 newUv = ((vUv - 0.5) * uvMapScale) + 0.5 + dUv;
    
    float st = smoothstep(0.0, 0.1, length(dUv));

    float redOffset   = 0.01;
    float greenOffset = 0.02;
    float blueOffset  = 0.03;

    float r = texture2D(map, newUv + vec2(redOffset   * st, 0.0)).r;
    float g = texture2D(map, newUv + vec2(greenOffset  * st, 0.0)).g;
    float b = texture2D(map, newUv + vec2(blueOffset   * st, 0.0)).b;

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

export default function WaveCanvas({ imageSrc, onReady }: WaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const appInstanceRef = useRef<any>(null);
  const hasFiredReady = useRef(false);

  // Check for mobile environment safely on mount
  useEffect(() => {
    const checkMobile = () => {
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      const isSmallScreen = window.innerWidth < 768;
      return isMobileUA || isSmallScreen;
    };

    if (checkMobile()) {
      setIsMobile(true);
      // Immediately clear the ready states for fallback visibility
      setIsReady(true);
      onReady?.();
    }
  }, [onReady]);

  useEffect(() => {
    // If it's a mobile device, completely skip initializing Three.js
    if (isMobile) return;
    if (!canvasRef.current || !videoRef.current) return;

    let destroyed = false;
    let animationFrameId: number;
    let rvfcId: number;
    let failSafeTimeout: NodeJS.Timeout;

    const video = videoRef.current as HTMLVideoElement & {
      requestVideoFrameCallback?: (callback: (now: number, metadata: any) => void) => number;
      cancelVideoFrameCallback?: (id: number) => void;
    };
    let videoTexture: VideoTexture | null = null;

    const flags = {
      videoReady: false,
      engineReady: false,
      textureUploaded: false,
    };

    const checkAndMarkReady = () => {
      if (hasFiredReady.current) return;
      if (flags.videoReady && flags.engineReady && flags.textureUploaded) {
        hasFiredReady.current = true;
        clearTimeout(failSafeTimeout);
        requestAnimationFrame(() => {
          if (destroyed) return;
          requestAnimationFrame(() => {
            if (destroyed) return;
            setIsReady(true);
            onReady?.();
          });
        });
      }
    };

    failSafeTimeout = setTimeout(() => {
      if (!hasFiredReady.current) {
        flags.videoReady = true;
        flags.engineReady = true;
        flags.textureUploaded = true;
        checkAndMarkReady();
      }
    }, 1800);

    const playVideo = () => {
      video.play().catch(() => {
        const startVideo = () => {
          video.play().catch(() => {});
          window.removeEventListener("click", startVideo);
        };
        window.addEventListener("click", startVideo);
      });
    };

    const originalFromScene = THREE.PMREMGenerator.prototype.fromScene;
    THREE.PMREMGenerator.prototype.fromScene = function () {
      return { texture: null } as any;
    };

    const appInstance = (LiquidBackgroundFn as any)(canvasRef.current);
    appInstanceRef.current = appInstance;

    THREE.PMREMGenerator.prototype.fromScene = originalFromScene;
    appInstance.three.resize();

    const renderer = appInstance.three.renderer;
    renderer.toneMapping = NoToneMapping;
    renderer.outputColorSpace = SRGBColorSpace;

    const matteLight = new AmbientLight(0xffffff, 1.0);
    appInstance.three.scene.add(matteLight);

    videoTexture = new VideoTexture(video);
    videoTexture.colorSpace = NoColorSpace;
    videoTexture.minFilter = LinearFilter;
    videoTexture.magFilter = LinearFilter;

    const shaderMat = new ShaderMaterial({
      uniforms: {
        map:               { value: videoTexture },
        displacementMap:   { value: appInstance.liquidPlane.uniforms.displacementMap.value },
        uvMapScale:        { value: new Vector2(1, 1) },
        displacementScale: { value: 5.0 },
      },
      vertexShader,
      fragmentShader,
      depthWrite: false,
    });

    appInstance.liquidPlane.material.dispose();
    appInstance.liquidPlane.material = shaderMat;
    appInstance.liquidPlane.uniforms = shaderMat.uniforms;

    flags.textureUploaded = true;

    // OPTIMIZATION: Cache values to prevent Layout Thrashing during layout checks
    let lastCanvasWidth = 0;
    let lastCanvasHeight = 0;

    const updateVideoAspect = () => {
      if (!appInstanceRef.current || !canvasRef.current) return;
      
      const canvasWidth = canvasRef.current.clientWidth;
      const canvasHeight = canvasRef.current.clientHeight;
      
      // Stop execution if dimensions haven't actual shifted
      if (canvasWidth === lastCanvasWidth && canvasHeight === lastCanvasHeight) return;
      
      lastCanvasWidth = canvasWidth;
      lastCanvasHeight = canvasHeight;

      const uniforms = appInstanceRef.current.liquidPlane.uniforms;
      const currentRatio = canvasWidth / canvasHeight;
      const videoRatio = video.videoWidth / video.videoHeight;

      if (videoRatio && currentRatio) {
        if (currentRatio < videoRatio) {
          uniforms.uvMapScale.value.set(currentRatio / videoRatio, 1.0);
        } else {
          uniforms.uvMapScale.value.set(1.0, videoRatio / currentRatio);
        }
      }
    };

    if (appInstance.three && typeof appInstance.three === "object") {
      appInstance.three.onAfterRender = () => {
        if (!flags.engineReady) {
          flags.engineReady = true;
          checkAndMarkReady();
        }
      };
    }

    // Liquid look tweaks
    if (appInstance.liquidPlane.attenuation !== undefined) {
      appInstance.liquidPlane.attenuation = 0.86;
    }

    if (appInstance.interaction) {
      let lastDropTime = 0;
      appInstance.interaction.onMove = () => {
        const now = performance.now();
        if (now - lastDropTime < 35) return; 
        lastDropTime = now;

        appInstance.liquidPlane.addDrop(
          appInstance.interaction.nPosition.x,
          appInstance.interaction.nPosition.y,
          0.06,  // Broader wave profile
          0.0015 // Softer intensity
        );
      };
    }

    appInstance.setRain(false);
    playVideo();

    if (typeof (video as any).requestVideoFrameCallback === "function") {
      const onFramePresented = () => {
        if (destroyed) return;
        flags.videoReady = true;
        checkAndMarkReady();
      };
      rvfcId = (video as any).requestVideoFrameCallback(onFramePresented);
    } else {
      video.addEventListener("loadeddata", () => {
        flags.videoReady = true;
        checkAndMarkReady();
      });
    }

    const renderLoop = () => {
      if (destroyed) return;
      
      updateVideoAspect();

      if (videoTexture && video.readyState >= video.HAVE_CURRENT_DATA) {
        videoTexture.needsUpdate = true;
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    window.dispatchEvent(new Event("resize"));

    return () => {
      destroyed = true;
      clearTimeout(failSafeTimeout);
      cancelAnimationFrame(animationFrameId);
      if (rvfcId && "cancelVideoFrameCallback" in video) {
        (video as any).cancelVideoFrameCallback(rvfcId);
      }
      if (videoTexture) videoTexture.dispose();
      shaderMat.dispose();
      if (appInstanceRef.current && typeof appInstanceRef.current.dispose === "function") {
        appInstanceRef.current.dispose();
        appInstanceRef.current = null;
      }
    };
  }, [isMobile]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <video
        ref={videoRef}
        src="/videos/pool-waves.mp4"
        poster={imageSrc}
        loop
        muted
        playsInline
        autoPlay={isMobile}
        preload="auto"
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ zIndex: 1 }}
      />
      
      {!isMobile && (
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full block transition-opacity duration-500 ease-out ${
            isReady ? "opacity-100" : "opacity-0"
          }`}
          style={{ zIndex: 2 }}
        />
      )}
    </div>
  );
}