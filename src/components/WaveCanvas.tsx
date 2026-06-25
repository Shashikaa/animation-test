"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  AmbientLight,
  VideoTexture,
  TextureLoader,
  LinearFilter,
  NoColorSpace,
  NoToneMapping,
  SRGBColorSpace,
  ShaderMaterial,
  Vector2,
} from "three";
import LiquidBackgroundFn from "../app/utils/liquidBackground";

type WaveCanvasProps = {
  imageSrc: string;
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
  uniform sampler2D bgImage;
  uniform sampler2D displacementMap;
  uniform vec2 uvMapScale;
  uniform vec2 uvImgScale;
  uniform float displacementScale;
  varying vec2 vUv;

  void main() {
    vec4 disp = texture2D(displacementMap, vUv);
    vec3 normal = vec3(disp.b, disp.a, sqrt(max(0.0, 1.0 - dot(disp.ba, disp.ba))));

    vec2 dUv = normal.xy * displacementScale * 0.04;
    
    vec2 videoUv = ((vUv - 0.5) * uvMapScale + 0.5) + dUv;
    vec2 imgUv = ((vUv - 0.5) * uvImgScale + 0.5) + dUv;
    
    float st = smoothstep(0.0, 0.1, length(dUv));
    float redOffset   = 0.01;
    float greenOffset = 0.02;
    float blueOffset  = 0.03;

    // Sample Video
    float videoR = texture2D(map, videoUv + vec2(redOffset   * st, 0.0)).r;
    float videoG = texture2D(map, videoUv + vec2(greenOffset * st, 0.0)).g;
    float videoB = texture2D(map, videoUv + vec2(blueOffset  * st, 0.0)).b;
    vec4 videoColor = vec4(videoR, videoG, videoB, 1.0);

    // Sample Image
    float imgR = texture2D(bgImage, imgUv + vec2(redOffset   * st, 0.0)).r;
    float imgG = texture2D(bgImage, imgUv + vec2(greenOffset * st, 0.0)).g;
    float imgB = texture2D(bgImage, imgUv + vec2(blueOffset  * st, 0.0)).b;
    vec4 imgColor = vec4(imgR, imgG, imgB, 1.0);

    // Screen blend mode directly via GPU
    vec4 mixedVideo = videoColor * 0.15; 
    gl_FragColor = 1.0 - (1.0 - imgColor) * (1.0 - mixedVideo);
  }
`;

export default function WaveCanvas({ imageSrc, onReady }: WaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const appInstanceRef = useRef<any>(null);
  const hasFiredReady = useRef(false);
  const shaderMatRef = useRef<ShaderMaterial | null>(null);

  // Dynamic aspect ratio updater
  const updateAspectRatios = () => {
    if (!appInstanceRef.current || !shaderMatRef.current || !videoRef.current) return;
    
    const uniforms = shaderMatRef.current.uniforms;
    const currentRatio = appInstanceRef.current.three.size.ratio;
    
    const video = videoRef.current;
    const videoRatio = video.videoWidth / video.videoHeight;
    if (videoRatio && currentRatio) {
      if (currentRatio < videoRatio) {
        uniforms.uvMapScale.value.set(currentRatio / videoRatio, 1);
      } else {
        uniforms.uvMapScale.value.set(1, videoRatio / currentRatio);
      }
    }

    const imgTex = uniforms.bgImage.value;
    if (imgTex && imgTex.image) {
      const imgRatio = imgTex.image.width / imgTex.image.height;
      if (imgRatio && currentRatio) {
        if (currentRatio < imgRatio) {
          uniforms.uvImgScale.value.set(currentRatio / imgRatio, 1);
        } else {
          uniforms.uvImgScale.value.set(1, imgRatio / currentRatio);
        }
      }
    }
  };

  // Hot reload changing images
  useEffect(() => {
    if (!shaderMatRef.current) return;
    const loader = new TextureLoader();
    loader.load(imageSrc, (texture) => {
      texture.colorSpace = NoColorSpace;
      if (shaderMatRef.current) {
        shaderMatRef.current.uniforms.bgImage.value = texture;
        updateAspectRatios();
      }
    });
  }, [imageSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!canvasRef.current || !video) return;

    let destroyed = false;
    let animationFrameId: number;
    let rvfcId: number;
    let failSafeTimeout: NodeJS.Timeout;

    let videoTexture: VideoTexture | null = null;
    const flags = { videoReady: false, engineReady: false, textureUploaded: false };

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
        bgImage:           { value: new THREE.Texture() },
        displacementMap:   { value: appInstance.liquidPlane.uniforms.displacementMap.value },
        uvMapScale:        { value: new Vector2(1, 1) },
        uvImgScale:        { value: new Vector2(1, 1) },
        displacementScale: { value: 5.0 },
      },
      vertexShader,
      fragmentShader,
      depthWrite: false,
    });

    shaderMatRef.current = shaderMat;

    appInstance.liquidPlane.material.dispose();
    appInstance.liquidPlane.material = shaderMat;
    appInstance.liquidPlane.uniforms = shaderMat.uniforms;

    // Apply the lingering LiquidCanvas decay characteristics
    if (appInstance.liquidPlane && appInstance.liquidPlane.attenuation !== undefined) {
      appInstance.liquidPlane.attenuation = 0.95; 
    }

    flags.textureUploaded = true;

    if (video.videoWidth > 0) {
      updateAspectRatios();
    } else {
      video.addEventListener("loadedmetadata", updateAspectRatios);
    }

    appInstance.three.onAfterResize = () => {
      updateAspectRatios();
    };

    if (appInstance.three && typeof appInstance.three === "object") {
      appInstance.three.onAfterRender = () => {
        if (!flags.engineReady) {
          flags.engineReady = true;
          checkAndMarkReady();
        }
      };
    }

    // Interactive mouse tracking configurations matching original LiquidCanvas specs
    if (appInstance.interaction) {
      appInstance.interaction.onMove = () => {
        appInstance.liquidPlane.addDrop(
          appInstance.interaction.nPosition.x,
          appInstance.interaction.nPosition.y,
          0.04,  // Matches LiquidCanvas radius
          0.004  // Matches LiquidCanvas strength
        );
      };
    }

    appInstance.setRain(false);
    playVideo();

    const onVideoLoadedData = () => {
      flags.videoReady = true;
      checkAndMarkReady();
    };

    if ((video as any).requestVideoFrameCallback) {
      const onFramePresented = () => {
        if (destroyed) return;
        flags.videoReady = true;
        checkAndMarkReady();
      };
      rvfcId = (video as any).requestVideoFrameCallback(onFramePresented);
    } else {
      video.addEventListener("loadeddata", onVideoLoadedData);
    }

    const renderLoop = () => {
      if (destroyed) return;
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
      // Fixed: uses the scoped `video` element variable directly to avoid TypeScript 'never' errors during unmount lifecycle
      video.removeEventListener("loadedmetadata", updateAspectRatios);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <video
        ref={videoRef}
        src="/videos/pool-waves.mp4"
        loop
        muted
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        className="hidden"
      />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full block transition-opacity duration-500 ease-out ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
        style={{ zIndex: 2 }}
      />
    </div>
  );
}