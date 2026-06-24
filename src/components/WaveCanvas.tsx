"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AmbientLight, VideoTexture, SRGBColorSpace, LinearFilter } from "three";
import LiquidBackgroundFn from "../app/utils/liquidBackground";

export default function WaveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const appInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;

    let destroyed = false;
    let animationFrameId: number;
    const video = videoRef.current;
    let videoTexture: VideoTexture | null = null;

    // Playback logic matching readiness parameters
    const playVideo = () => {
      video.play().catch((err) => {
        console.log("Autoplay blocked, waiting for interaction.", err);
        const startVideo = () => {
          video.play().catch(() => {});
          window.removeEventListener("click", startVideo);
        };
        window.addEventListener("click", startVideo);
      });
    };

    // --- OPTIMIZATION: BYPASS UNUSED HEAVY CUBEMAP GENERATION ---
    const originalFromScene = THREE.PMREMGenerator.prototype.fromScene;
    THREE.PMREMGenerator.prototype.fromScene = function () {
      return { texture: null } as any;
    };

    const appInstance = (LiquidBackgroundFn as any)(canvasRef.current);
    appInstanceRef.current = appInstance;

    THREE.PMREMGenerator.prototype.fromScene = originalFromScene;
    // -------------------------------------------------------------

    appInstance.three.resize();

    const matteLight = new AmbientLight(0xffffff, 1.5);
    appInstance.three.scene.add(matteLight);

    appInstance.liquidPlane.material.envMap = null;
    appInstance.liquidPlane.material.metalness = 0.0;
    appInstance.liquidPlane.material.roughness = 1.0;

    videoTexture = new VideoTexture(video);
    videoTexture.colorSpace = SRGBColorSpace;
    videoTexture.minFilter = LinearFilter;
    appInstance.liquidPlane.material.map = videoTexture;

    appInstance.liquidPlane.material.onBeforeCompile = (shader: any) => {
      Object.assign(shader.uniforms, appInstance.liquidPlane.uniforms);
      shader.fragmentShader = `
        uniform vec2 uvMapScale;
        uniform sampler2D displacementMap;
        uniform float displacementScale;
        float redOffset   = 0.0;
        float greenOffset = 0.0;
        float blueOffset  = 0.0;
      ` + shader.fragmentShader;

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `
        vec4 disp = texture2D(displacementMap, vUv);
        vec3 transformedNormal = vec3(disp.b, disp.a, sqrt(1.0 - dot(disp.ba, disp.ba)));
        #ifdef USE_MAP
          vec2 dUv = transformedNormal.xy * displacementScale * 0.04;
          vec2 newUv = ((vUv - 0.5) * uvMapScale + 0.5) + dUv;
          float st = smoothstep(0.0, 0.1, length(dUv));
          diffuseColor.r *= texture2D(map, newUv + redOffset * st).r;
          diffuseColor.g *= texture2D(map, newUv + greenOffset * st).g;
          diffuseColor.b *= texture2D(map, newUv + blueOffset * st).b;
        #endif
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <normal_fragment_maps>",
        "\n normal = transformedNormal;\n "
      );
    };

    appInstance.liquidPlane.material.needsUpdate = true;
    appInstance.liquidPlane.uniforms.displacementScale.value = 5.0;

    if (appInstance.liquidPlane.attenuation !== undefined) {
      appInstance.liquidPlane.attenuation = 0.95;
    }

    const updateVideoAspect = () => {
      if (!videoTexture || !appInstanceRef.current) return;
      const plane = appInstanceRef.current.liquidPlane;
      const currentRatio = appInstanceRef.current.three.size.ratio;
      const videoRatio = video.videoWidth / video.videoHeight;

      if (videoRatio && currentRatio) {
        if (currentRatio < videoRatio) {
          plane.uniforms.uvMapScale.value.set(currentRatio / videoRatio, 1);
        } else {
          plane.uniforms.uvMapScale.value.set(1, videoRatio / currentRatio);
        }
      }
    };

    if (video.videoWidth > 0) {
      updateVideoAspect();
    } else {
      video.addEventListener("loadedmetadata", updateVideoAspect);
    }

    appInstance.three.onAfterResize = () => {
      updateVideoAspect();
    };

    if (appInstance.interaction) {
      appInstance.interaction.onMove = () => {
        appInstance.liquidPlane.addDrop(
          appInstance.interaction.nPosition.x,
          appInstance.interaction.nPosition.y,
          0.035,
          0.005
        );
      };
    }

    appInstance.setRain(false);
    playVideo();

    // Render loop and state tracking
    const renderLoop = () => {
      if (destroyed) return;
      if (videoTexture) {
        videoTexture.needsUpdate = true;
      }

      // CRITICAL: Only set isReady true when video pixel buffer contains current frame data
      if (!isReady && video.readyState >= 3) {
        setIsReady(true);
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    window.dispatchEvent(new Event("resize"));

    return () => {
      destroyed = true;
      cancelAnimationFrame(animationFrameId);
      if (videoTexture) videoTexture.dispose();
      if (appInstanceRef.current && typeof appInstanceRef.current.dispose === "function") {
        appInstanceRef.current.dispose();
        appInstanceRef.current = null;
      }
      video.removeEventListener("loadedmetadata", updateVideoAspect);
    };
  }, [isReady]);

return (
  <div className="relative w-full h-full bg-transparent">
    <video
      ref={videoRef}
      src="/videos/pool.mp4"
      loop
      muted
      playsInline
      preload="auto"
      crossOrigin="anonymous"
      className="hidden"
    />
    
    <canvas
      ref={canvasRef}
      className={`h-full w-full block touch-pan-y transition-opacity duration-300 ease-in-out ${
        isReady ? "opacity-100" : "opacity-0"
      }`}
    />

    {/* Linear Gradient Overlay */}
    <div 
      className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ease-in-out ${
        isReady ? "opacity-100" : "opacity-0"
      }`}
      style={{
        background: "linear-gradient(135deg, #162D24 0%, #094146 100%)",
        mixBlendMode: "multiply" // Optional: Use 'multiply' or 'overlay' if you want the video details to pop through, or remove it for a flat backdrop look
      }}
    />
  </div>
);
}