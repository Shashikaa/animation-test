"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
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

const vertexShader = `
  varying vec2 vUv;
  void main() { 
    vUv = uv; 
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); 
  }
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

export default function WaveCanvas({ imageSrc, onReady, preloaderDone = true }: WaveCanvasProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isMobileOrTablet, setIsMobileOrTablet] = useState<boolean | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const appInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!isHome) return;
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobileOrTablet(isMobileUA || window.innerWidth <= 1024);
  }, [isHome]);

  useEffect(() => {
    if (!isHome || isMobileOrTablet === null || isMobileOrTablet) return;

    let destroyed = false;
    let bgTexture: THREE.Texture | null = null;
    let videoTexture: THREE.VideoTexture | null = null;
    let shaderMat: THREE.ShaderMaterial | null = null;
    let animationFrameId: number;

    const setupEngine = async () => {
      if (!canvasRef.current || appInstanceRef.current) return;

      try {
        // High-performance async texture load without offscreen bitmap duplication
        if (imageSrc) {
          const loader = new TextureLoader();
          loader.setCrossOrigin("anonymous");
          bgTexture = await loader.loadAsync(imageSrc);
          bgTexture.colorSpace = LinearSRGBColorSpace;
          bgTexture.minFilter = LinearFilter;
          bgTexture.magFilter = LinearFilter;
          bgTexture.generateMipmaps = false;
        }

        if (destroyed) return;

        // Bypasses heavy PMREM environment generation
        const originalFromScene = THREE.PMREMGenerator.prototype.fromScene;
        THREE.PMREMGenerator.prototype.fromScene = function () { return { texture: null } as any; };
        
        const appInstance = (LiquidBackgroundFn as any)(canvasRef.current);
        appInstanceRef.current = appInstance;
        THREE.PMREMGenerator.prototype.fromScene = originalFromScene;

        // Cap pixel ratio strictly to avoid rendering bottlenecks on 4K/Retina displays
        appInstance.three.maxPixelRatio = Math.min(window.devicePixelRatio, 1.15);
        
        const initialWidth = canvasRef.current.clientWidth || window.innerWidth;
        const initialHeight = canvasRef.current.clientHeight || window.innerHeight;
        appInstance.three.renderer.setSize(initialWidth, initialHeight);

        const renderer = appInstance.three.renderer;
        renderer.toneMapping = NoToneMapping;
        renderer.outputColorSpace = LinearSRGBColorSpace; 
        appInstance.three.scene.add(new AmbientLight(0xffffff, 1.0));

        if (videoRef.current) {
          videoTexture = new VideoTexture(videoRef.current);
          videoTexture.colorSpace = LinearSRGBColorSpace;
          videoTexture.minFilter = LinearFilter;
          videoTexture.magFilter = LinearFilter;
          videoTexture.generateMipmaps = false; 
        }

        shaderMat = new ShaderMaterial({
          uniforms: {
            map: { value: bgTexture },
            videoMap: { value: videoTexture },
            displacementMap: { value: appInstance.liquidPlane.uniforms.displacementMap.value },
            uvMapScale: { value: new Vector2(1, 1) },
            displacementScale: { value: 5.0 },
          },
          vertexShader,
          fragmentShader,
          depthWrite: false,
          transparent: false,
          blending: THREE.NoBlending,
        });

        if (appInstance.liquidPlane.material) {
          appInstance.liquidPlane.material.dispose();
        }
        
        appInstance.liquidPlane.material = shaderMat;
        appInstance.liquidPlane.uniforms = shaderMat.uniforms;
        
        if (appInstance.liquidPlane.attenuation !== undefined) {
          appInstance.liquidPlane.attenuation = 0.9;
        }

        appInstance.setRain(false);

        const updateAspect = () => {
          if (!appInstanceRef.current || !canvasRef.current) return;
          const cw = canvasRef.current.clientWidth || window.innerWidth;
          const ch = canvasRef.current.clientHeight || window.innerHeight;
          const uniforms = appInstanceRef.current.liquidPlane.uniforms;
          
          if (bgTexture?.image) {
            const cRatio = cw / ch;
            const img = bgTexture.image as HTMLImageElement;
            const iRatio = img.width && img.height ? img.width / img.height : 1;
            
            if (cRatio < iRatio) uniforms.uvMapScale.value.set(cRatio / iRatio, 1.0);
            else uniforms.uvMapScale.value.set(1.0, iRatio / cRatio);
          }

          appInstanceRef.current.three.renderer.setSize(cw, ch);
        };
        
        updateAspect();
        window.addEventListener("resize", updateAspect, { passive: true });

        renderer.render(appInstance.three.scene, appInstance.three.camera);

        if (videoRef.current) {
          videoRef.current.playbackRate = 0.7;
          videoRef.current.play().catch(() => {});
        }

        setEngineReady(true);
        onReady?.();
      } catch (err) {
        console.error("WebGL Setup Error:", err);
      }
    };

    animationFrameId = requestAnimationFrame(() => {
      setupEngine();
    });

    return () => {
      destroyed = true;
      cancelAnimationFrame(animationFrameId);
      if (bgTexture) bgTexture.dispose();
      if (videoTexture) videoTexture.dispose();
      if (shaderMat) shaderMat.dispose();
      if (appInstanceRef.current?.dispose) appInstanceRef.current.dispose();
      appInstanceRef.current = null;
    };
  }, [isHome, isMobileOrTablet, imageSrc]);

  if (!isHome) {
    return (
      <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-black">
        {imageSrc && (
          <img
            src={imageSrc}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-black">
      {!isMobileOrTablet && (
        <video
          ref={videoRef}
          src="/videos/Pool-Water-Reflect.mp4"
          loop
          muted
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          className="hidden"
        />
      )}

      {imageSrc && (
        <img
          src={imageSrc}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ opacity: 1 }}
        />
      )}
      
      {!isMobileOrTablet && (
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full block transition-opacity duration-500 ease-out ${
            engineReady ? "opacity-100" : "opacity-0"
          }`}
          style={{ zIndex: 1, willChange: "transform" }}
        />
      )}
    </div>
  );
}