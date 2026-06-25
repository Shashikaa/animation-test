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
  const [isReady, setIsReady] = useState(false);
  const appInstanceRef = useRef<any>(null);

  // ── HOOK 1: ENGINE INITIALIZATION ──
  useEffect(() => {
    if (!canvasRef.current) return;

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
        appInstance.interaction.onMove = () => {
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
  }, []);

  // ── HOOK 2: HARDWARE ACCELERATED TEXTURE INSTANCING ──
  useEffect(() => {
    let active = true;
    setIsReady(false);

    const checkAndLoad = () => {
      const appInstance = appInstanceRef.current;
      if (!appInstance) {
        requestAnimationFrame(checkAndLoad);
        return;
      }

      // OPTIMIZATION: If image has been uploaded into GPU memory by either panel, grab it immediately
      if (globalTextureCache[imageSrc]) {
        if (appInstance.liquidPlane?.material) {
          appInstance.liquidPlane.material.map = globalTextureCache[imageSrc];
          appInstance.liquidPlane.material.needsUpdate = true;
        }
        appInstance.three.resize();
        setIsReady(true);
        return;
      }

      // Fallback to initial loader if first render cycle
      appInstance.loadImage(imageSrc).then(() => {
        if (!active) return;
        
        // Cache the completed texture data configuration
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
    };
  }, [imageSrc]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`h-full w-full block touch-pan-y transition-opacity duration-300 ease-in-out ${
        isReady ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}