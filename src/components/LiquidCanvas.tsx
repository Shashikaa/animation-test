"use client";

import { useEffect, useRef, useState } from "react";
import { AmbientLight } from "three";

interface LiquidCanvasProps {
  imageSrc: string;
}

// Global engine & texture cache to prevent multi-panel lag
let cachedLiquidBackgroundFn: any = null;
const globalTextureCache: Record<string, any> = {};

export default function LiquidCanvas({ imageSrc }: LiquidCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);
  const appInstanceRef = useRef<any>(null);

  // 🌟 NEW: Prevents any asset fetching or engine creation until the browser is completely quiet
  const [shouldInitialize, setShouldInitialize] = useState(false);

  // ── STEP 1: MOBILE & TABLET DETECTION ──
  useEffect(() => {
    const handleResize = () => {
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      const isSmallScreen = window.innerWidth <= 1024;
      setIsMobileOrTablet(isMobileUA || isSmallScreen);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── 🌟 NEW STEP: LAZY DEFERRAL WINDOW ──
  // Keeps the desktop WebGL engine entirely locked until the main preloader animation completes
  useEffect(() => {
    if (isMobileOrTablet === null || isMobileOrTablet) return;

    let idleId: any;
    let timeoutId: any;

    const activateEngine = () => {
      setShouldInitialize(true);
    };

    if ("requestIdleCallback" in window) {
      // Defer asset setup to an idle browser window, max timeout 2 seconds safety buffer
      idleId = (window as any).requestIdleCallback(activateEngine, { timeout: 2000 });
    } else {
      timeoutId = setTimeout(activateEngine, 1500);
    }

    return () => {
      if (idleId && "cancelIdleCallback" in window) (window as any).cancelIdleCallback(idleId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isMobileOrTablet]);

  // ── HOOK 1: ENGINE INITIALIZATION (Now gated behind shouldInitialize) ──
  useEffect(() => {
    // 🌟 Added shouldInitialize gate guard
    if (isMobileOrTablet === null || isMobileOrTablet || !shouldInitialize || !canvasRef.current) return;

    let destroyed = false;

    const initEngine = (LiquidBackgroundFn: any) => {
      if (destroyed || !canvasRef.current) return;

      const appInstance = LiquidBackgroundFn(canvasRef.current) as any;
      appInstanceRef.current = appInstance;
      
      appInstance.three.resize();
      
      const matteLight = new AmbientLight(0xffffff, 1.5);
      appInstance.three.scene.add(matteLight);

      appInstance.liquidPlane.material.envMap = null; 
      appInstance.liquidPlane.material.metalness = 0.0;
      appInstance.liquidPlane.material.roughness = 1.0;
      
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

      if (appInstance.interaction) {
        let lastDropTime = 0;
        appInstance.interaction.onMove = () => {
          const now = performance.now();
          if (now - lastDropTime < 16) return;
          lastDropTime = now;

          appInstance.liquidPlane.addDrop(
            appInstance.interaction.nPosition.x, 
            appInstance.interaction.nPosition.y, 
            0.04, 
            0.004
          );
        };
      }

      appInstance.setRain(false);
      window.dispatchEvent(new Event('resize'));
    };

    if (cachedLiquidBackgroundFn) {
      initEngine(cachedLiquidBackgroundFn);
    } else {
      import("../app/utils/liquidBackground")
        .then((module) => {
          cachedLiquidBackgroundFn = module.default;
          initEngine(cachedLiquidBackgroundFn);
        })
        .catch((err) => {
          console.error("Failed to load LiquidBackground: ", err);
        });
    }

    return () => {
      destroyed = true;
      if (appInstanceRef.current && typeof appInstanceRef.current.dispose === "function") {
        appInstanceRef.current.dispose();
        appInstanceRef.current = null;
      }
    };
  }, [isMobileOrTablet, shouldInitialize]); // 🌟 Added shouldInitialize dependency

  // ── HOOK 2: HARDWARE ACCELERATED TEXTURE INSTANCING ──
  useEffect(() => {
    // 🌟 Added shouldInitialize gate guard
    if (isMobileOrTablet === null || isMobileOrTablet || !shouldInitialize) return;
    
    let active = true;
    let rafId: number;
    setIsReady(false);

    const checkAndLoad = () => {
      if (!active) return;
      
      const appInstance = appInstanceRef.current;
      if (!appInstance) {
        rafId = requestAnimationFrame(checkAndLoad);
        return;
      }

      if (globalTextureCache[imageSrc]) {
        if (appInstance.liquidPlane?.material) {
          appInstance.liquidPlane.material.map = globalTextureCache[imageSrc];
          appInstance.liquidPlane.material.needsUpdate = true;
        }
        appInstance.three.resize();
        setIsReady(true);
        return;
      }

      appInstance.loadImage(imageSrc).then(() => {
        if (!active) return;
        
        if (appInstance.liquidPlane?.material?.map) {
          globalTextureCache[imageSrc] = appInstance.liquidPlane.material.map;
        }

        appInstance.three.resize();
        setIsReady(true);
      });
    };

    checkAndLoad();

    return () => {
      active = false;
      cancelAnimationFrame(rafId);
    };
  }, [imageSrc, isMobileOrTablet, shouldInitialize]); // 🌟 Added shouldInitialize dependency

  // ── STEP 3: CLEAN RENDERING STRATEGY ──
  if (isMobileOrTablet === null) return null;

  if (isMobileOrTablet) {
    return (
      <div 
        style={{ backgroundImage: `url(${imageSrc})` }}
        className="h-full w-full bg-cover bg-center bg-no-repeat select-none pointer-events-none"
      />
    );
  }

  return (
    <canvas 
      ref={canvasRef} 
      // 🌟 Clean performance upgrade: Keep the static asset behind it visible 
      // so the UI looks complete while WebGL prepares silently in the idle layout layer
      style={{ backgroundImage: `url(${imageSrc})` }}
      className={`h-full w-full block bg-cover bg-center bg-no-repeat transition-opacity duration-500 ease-in-out ${
        isReady ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}