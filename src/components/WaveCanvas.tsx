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
  preloaderDone?: boolean;
};

// --- Shaders ---
const vertexShader = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const fragmentShader = `
  uniform sampler2D map;             
  uniform sampler2D videoMap;        
  uniform sampler2D displacementMap; 
  uniform vec2 uvMapScale;
  uniform float displacementScale;
  varying vec2 vUv;
  void main() {
    vec4 disp = texture2D(displacementMap, vUv);
    vec3 normal = vec3(disp.b, disp.a, sqrt(max(0.0, 1.0 - dot(disp.ba, disp.ba))));
    
    vec2 dUv = normal.xy * displacementScale * 0.04;
    vec2 newUv = ((vUv - 0.5) * uvMapScale) + 0.5 + dUv;
    
    vec4 baseColor = texture2D(map, newUv);
    vec4 videoColor = texture2D(videoMap, newUv);
    float videoLuminance = dot(videoColor.rgb, vec3(0.299, 0.587, 0.114));
    float causticsStrength = 0.08; 
    vec3 finalColor = baseColor.rgb + (videoColor.rgb * videoLuminance * causticsStrength);
    
    gl_FragColor = vec4(finalColor, baseColor.a);
  }
`;

// --- Utility: Off-Main-Thread Texture Decoding ---
const loadTextureOffThread = async (url: string): Promise<THREE.Texture> => {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob, { 
        premultiplyAlpha: 'none',
        imageOrientation: 'flipY' 
    });
    const texture = new THREE.Texture(bitmap);
    texture.colorSpace = LinearSRGBColorSpace;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    return texture;
  } catch (e) {
    const loader = new TextureLoader();
    loader.setCrossOrigin("anonymous");
    const tex = await loader.loadAsync(url);
    tex.colorSpace = LinearSRGBColorSpace;
    tex.minFilter = LinearFilter;
    tex.magFilter = LinearFilter;
    tex.generateMipmaps = false;
    return tex;
  }
};

const yieldToMain = () => new Promise((resolve) => setTimeout(resolve, 30));

export default function WaveCanvas({ imageSrc, onReady, preloaderDone = true }: WaveCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isMobileOrTablet, setIsMobileOrTablet] = useState<boolean | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  const appInstanceRef = useRef<any>(null);

  // 1. Device Detection
  useEffect(() => {
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobileOrTablet(isMobileUA || window.innerWidth <= 1024);
  }, []);

  // 2. Preloader & Interaction-Triggered WebGL Setup
  useEffect(() => {
    // 🌟 Hold back WebGL initialization while the preloader is running to prevent UI stutter
    if (!preloaderDone) return;
    if (isMobileOrTablet === null || isMobileOrTablet || !canvasRef.current || !videoRef.current) return;

    let destroyed = false;
    let setupInitiated = false;
    let fallbackTimeout: NodeJS.Timeout;
    
    let bgTexture: THREE.Texture | null = null;
    let videoTexture: THREE.VideoTexture | null = null;
    let shaderMat: THREE.ShaderMaterial | null = null;

    const setupEngine = async () => {
      try {
        await yieldToMain();
        if (destroyed) return;

        if (imageSrc) {
          bgTexture = await loadTextureOffThread(imageSrc);
        }
        await yieldToMain();
        if (destroyed) return;

        const originalFromScene = THREE.PMREMGenerator.prototype.fromScene;
        THREE.PMREMGenerator.prototype.fromScene = function () { return { texture: null } as any; };
        
        const appInstance = (LiquidBackgroundFn as any)(canvasRef.current);
        appInstanceRef.current = appInstance;
        THREE.PMREMGenerator.prototype.fromScene = originalFromScene;

        appInstance.three.maxPixelRatio = Math.min(window.devicePixelRatio, 1.5);
        appInstance.three.resize();
        
        const renderer = appInstance.three.renderer;
        renderer.toneMapping = NoToneMapping;
        renderer.outputColorSpace = LinearSRGBColorSpace; 
        appInstance.three.scene.add(new AmbientLight(0xffffff, 1.0));

        await yieldToMain();
        if (destroyed) return;

        videoTexture = new VideoTexture(videoRef.current as HTMLVideoElement);
        videoTexture.colorSpace = LinearSRGBColorSpace;
        videoTexture.minFilter = LinearFilter;
        videoTexture.magFilter = LinearFilter;
        videoTexture.generateMipmaps = false; 

        shaderMat = new ShaderMaterial({
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
        });

        appInstance.liquidPlane.material.dispose();
        appInstance.liquidPlane.material = shaderMat;
        appInstance.liquidPlane.uniforms = shaderMat.uniforms;
        
        if (appInstance.liquidPlane.attenuation !== undefined) {
          appInstance.liquidPlane.attenuation = 0.9;
        }

        if (appInstance.interaction) {
          let lastDropTime = 0;
          appInstance.interaction.onMove = () => {
            const now = performance.now();
            if (now - lastDropTime < 16) return; 
            lastDropTime = now;
            
            appInstance.liquidPlane.addDrop(
              appInstance.interaction.nPosition.x,
              appInstance.interaction.nPosition.y,
              0.015,
              0.0015
            );
          };
        }

        appInstance.setRain(false);
        await yieldToMain();
        if (destroyed) return;

        renderer.compile(appInstance.three.scene, appInstance.three.camera);
        
        const updateAspect = () => {
          if (!appInstanceRef.current || !canvasRef.current || !bgTexture?.image) return;
          const cw = canvasRef.current.clientWidth;
          const ch = canvasRef.current.clientHeight;
          const uniforms = appInstanceRef.current.liquidPlane.uniforms;
          const cRatio = cw / ch;
          const img = bgTexture.image as HTMLImageElement | ImageBitmap;
          const iRatio = img.width && img.height ? img.width / img.height : 1;
          
          if (cRatio < iRatio) uniforms.uvMapScale.value.set(cRatio / iRatio, 1.0);
          else uniforms.uvMapScale.value.set(1.0, iRatio / cRatio);
        };
        
        updateAspect();
        window.addEventListener("resize", updateAspect);
        setEngineReady(true);

      } catch (err) {
        console.error("WebGL Setup Error:", err);
      }
    };

    const triggerSetup = () => {
      if (setupInitiated) return;
      setupInitiated = true;
      
      window.removeEventListener("mousemove", triggerSetup);
      window.removeEventListener("touchstart", triggerSetup);
      window.removeEventListener("scroll", triggerSetup);
      clearTimeout(fallbackTimeout);

      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(() => setupEngine(), { timeout: 1000 });
      } else {
        setTimeout(() => setupEngine(), 200);
      }
    };

    window.addEventListener("mousemove", triggerSetup, { once: true, passive: true });
    window.addEventListener("touchstart", triggerSetup, { once: true, passive: true });
    window.addEventListener("scroll", triggerSetup, { once: true, passive: true });
    fallbackTimeout = setTimeout(triggerSetup, 1000);

    return () => {
      destroyed = true;
      clearTimeout(fallbackTimeout);
      window.removeEventListener("mousemove", triggerSetup);
      window.removeEventListener("touchstart", triggerSetup);
      window.removeEventListener("scroll", triggerSetup);
      
      if (bgTexture) bgTexture.dispose();
      if (videoTexture) videoTexture.dispose();
      if (shaderMat) shaderMat.dispose();
      if (appInstanceRef.current?.dispose) appInstanceRef.current.dispose();
    };
  }, [isMobileOrTablet, imageSrc, preloaderDone]);

  // 3. Viewport Observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInViewport(entry.isIntersecting),
      { rootMargin: "1000px" }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 4. Playback Controller
  useEffect(() => {
    if (!engineReady || !isInViewport || !appInstanceRef.current || !videoRef.current) return;

    const video = videoRef.current;
    video.playbackRate = 0.7;

    let startVideoFn: () => void;

    const handlePlaying = () => {
      setIsVideoPlaying(true);
      onReady?.();
    };
    video.addEventListener("playing", handlePlaying);

    video.play().catch(() => {
      startVideoFn = () => {
        video.play().catch(() => {});
        window.removeEventListener("click", startVideoFn);
      };
      window.addEventListener("click", startVideoFn);
    });

    return () => {
      if (startVideoFn) window.removeEventListener("click", startVideoFn);
      video.removeEventListener("playing", handlePlaying);
      video.pause();
    };
  }, [engineReady, isInViewport, onReady]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-black">
      {!isMobileOrTablet && (
        <video
          ref={videoRef}
          src="/videos/Pool-Water-Reflect.mp4"
          loop
          muted
          playsInline
          preload="none"
          crossOrigin="anonymous"
          className="hidden"
        />
      )}

      {imageSrc && (
        <img
          src={imageSrc}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}
      
      {!isMobileOrTablet && (
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full block transition-opacity duration-1000 ease-out ${
            engineReady && isInViewport && isVideoPlaying ? "opacity-100" : "opacity-0"
          }`}
          style={{ zIndex: 1 }}
        />
      )}
    </div>
  );
}