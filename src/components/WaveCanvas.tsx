"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  AmbientLight,
  VideoTexture,
  TextureLoader,
  LinearFilter,
  NoToneMapping,
  LinearSRGBColorSpace,
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

// UNTOUCHED: Keeping your exact original shader and color blending math
const fragmentShader = `
  uniform sampler2D map;             // Pure, Untouched Background Image Texture
  uniform sampler2D videoMap;        // Caustics Video Texture
  uniform sampler2D displacementMap; // Fluid Sim Layer
  uniform vec2 uvMapScale;
  uniform float displacementScale;
  varying vec2 vUv;

  void main() {
    // 1. Sample displacement map for the fluid ripple geometry
    vec4 disp = texture2D(displacementMap, vUv);
    vec3 normal = vec3(disp.b, disp.a, sqrt(max(0.0, 1.0 - dot(disp.ba, disp.ba))));

    // 2. Map coordinates safely using aspect correction and wave displacement
    vec2 dUv = normal.xy * displacementScale * 0.04;
    vec2 newUv = ((vUv - 0.5) * uvMapScale) + 0.5 + dUv;

    // 3. Sample Base Image (Pure, unaltered original pixel values)
    vec4 baseColor = texture2D(map, newUv);

    // 4. Sample Caustics Video 
    vec4 videoColor = texture2D(videoMap, newUv);

    // Calculate light luminance of the video overlay
    float videoLuminance = dot(videoColor.rgb, vec3(0.299, 0.587, 0.114));

    // Define overlay opacity (Adjust this value up or down to change water intensity)
    float causticsStrength = 0.08; 

    // 5. Pure additive overlay: Only reflects light, never dulls or darkens background values
    vec3 finalColor = baseColor.rgb + (videoColor.rgb * videoLuminance * causticsStrength);

    gl_FragColor = vec4(finalColor, baseColor.a);
  }
`;

export default function WaveCanvas({ imageSrc, onReady }: WaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const appInstanceRef = useRef<any>(null);
  const hasFiredReady = useRef(false);

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
      setIsReady(true);
      onReady?.();
    }
  }, [onReady]);

  useEffect(() => {
    if (isMobile) return;
    if (!canvasRef.current || !videoRef.current) return;

    let destroyed = false;
    let animationFrameId: number;
    let failSafeTimeout: NodeJS.Timeout;

    const video = videoRef.current as HTMLVideoElement;
    let bgTexture: THREE.Texture | null = null;
    let videoTexture: THREE.VideoTexture | null = null;

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
          setIsReady(true);
          onReady?.();
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

    // UNTOUCHED: Keeping your exact working color rendering properties
    const renderer = appInstance.three.renderer;
    renderer.toneMapping = NoToneMapping;
    renderer.outputColorSpace = LinearSRGBColorSpace; 
    if (renderer.toneMappingExposure) {
      renderer.toneMappingExposure = 1.0;
    }

    const matteLight = new AmbientLight(0xffffff, 1.0);
    appInstance.three.scene.add(matteLight);

    if (imageSrc) {
      const loader = new TextureLoader();
      loader.setCrossOrigin("anonymous");
      bgTexture = loader.load(
        imageSrc,
        () => {
          flags.textureUploaded = true;
          checkAndMarkReady();
        },
        undefined,
        () => {
          flags.textureUploaded = true;
          checkAndMarkReady();
        }
      );
      
      bgTexture.colorSpace = LinearSRGBColorSpace;
      bgTexture.minFilter = LinearFilter;
      bgTexture.magFilter = LinearFilter;
      bgTexture.generateMipmaps = false; 
    } else {
      flags.textureUploaded = true;
    }

    videoTexture = new VideoTexture(video);
    videoTexture.colorSpace = LinearSRGBColorSpace;
    videoTexture.minFilter = LinearFilter;
    videoTexture.magFilter = LinearFilter;

    const shaderMat = new ShaderMaterial({
      uniforms: {
        map:               { value: bgTexture },
        videoMap:          { value: videoTexture },
        displacementMap:   { value: appInstance.liquidPlane.uniforms.displacementMap.value },
        uvMapScale:        { value: new Vector2(1, 1) },
        displacementScale: { value: 5.0 },
      },
      vertexShader,
      fragmentShader,
      depthWrite: false,
      transparent: false,
      blending: THREE.NoBlending,
      premultipliedAlpha: false,
    });

    appInstance.liquidPlane.material.dispose();
    appInstance.liquidPlane.material = shaderMat;
    appInstance.liquidPlane.uniforms = shaderMat.uniforms;

    let lastCanvasWidth = 0;
    let lastCanvasHeight = 0;

    const updateVideoAspect = () => {
      if (!appInstanceRef.current || !canvasRef.current || !bgTexture?.image) return;
      
      const canvasWidth = canvasRef.current.clientWidth;
      const canvasHeight = canvasRef.current.clientHeight;
      
      if (canvasWidth === lastCanvasWidth && canvasHeight === lastCanvasHeight) return;
      
      lastCanvasWidth = canvasWidth;
      lastCanvasHeight = canvasHeight;

      const uniforms = appInstanceRef.current.liquidPlane.uniforms;
      const currentRatio = canvasWidth / canvasHeight;
      const imgRatio = (bgTexture.image as HTMLImageElement).width / (bgTexture.image as HTMLImageElement).height;

      if (imgRatio && currentRatio) {
        if (currentRatio < imgRatio) {
          uniforms.uvMapScale.value.set(currentRatio / imgRatio, 1.0);
        } else {
          uniforms.uvMapScale.value.set(1.0, imgRatio / currentRatio);
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

    // ── STEP 1: Update attenuation to match your LiquidCanvas wave physics decay
    if (appInstance.liquidPlane.attenuation !== undefined) {
      appInstance.liquidPlane.attenuation = 0.95; 
    }

    // ── STEP 2: Update interaction settings to match your LiquidCanvas tracking properties
    if (appInstance.interaction) {
      let lastDropTime = 0;
      appInstance.interaction.onMove = () => {
        const now = performance.now();
        // Lower interval constraint (from 35ms down to 16ms) for smoother interactive trails
        if (now - lastDropTime < 16) return; 
        lastDropTime = now;

        appInstance.liquidPlane.addDrop(
          appInstance.interaction.nPosition.x,
          appInstance.interaction.nPosition.y,
          0.04, // Updated drop radius size
          0.004 // Updated splash wave force weight
        );
      };
    }

    appInstance.setRain(false);
    playVideo();

    video.addEventListener("loadeddata", () => {
      flags.videoReady = true;
      checkAndMarkReady();
    });

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
      if (bgTexture) bgTexture.dispose();
      if (videoTexture) videoTexture.dispose();
      shaderMat.dispose();
      if (appInstanceRef.current && typeof appInstanceRef.current.dispose === "function") {
        appInstanceRef.current.dispose();
        appInstanceRef.current = null;
      }
    };
  }, [isMobile, imageSrc]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        src="/videos/Pool-Water-Reflect.mp4"
        loop
        muted
        playsInline
        autoPlay
        preload="auto"
        crossOrigin="anonymous"
        className="hidden"
      />

      {isMobile && imageSrc && (
        <img
          src={imageSrc}
          alt="Static Mobile Fallback Background"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}
      
      {!isMobile && (
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full block transition-opacity duration-500 ease-out ${
            isReady ? "opacity-100" : "opacity-0"
          }`}
          style={{ zIndex: 1 }}
        />
      )}
    </div>
  );
}