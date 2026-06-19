"use client";

import { useEffect, useRef, useState } from "react";
import { AmbientLight } from "three";

interface LiquidCanvasProps {
  imageSrc: string;
}

export default function LiquidCanvas({ imageSrc }: LiquidCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const appInstanceRef = useRef<any>(null);

  // ── HOOK 1: INITIALIZE WEBGL ENGINE IMMEDIATELY ON MOUNT ──
  useEffect(() => {
    if (!canvasRef.current) return;

    let destroyed = false;

    // Load the foundational script layout instantly as the thread starts
    import("../app/utils/liquidBackground")
      .then((module) => {
        if (destroyed || !canvasRef.current) return;

        const LiquidBackgroundFn = module.default;
        const appInstance = LiquidBackgroundFn(canvasRef.current) as any;
        appInstanceRef.current = appInstance;
        
        // Setup base WebGL scene configurations
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

        // Force an immediate layout redraw event to populate the canvas layer
        window.dispatchEvent(new Event('resize'));
      })
      .catch((err) => {
        console.error("Failed to load LiquidBackground: ", err);
      });

    return () => {
      destroyed = true;
      if (appInstanceRef.current && typeof appInstanceRef.current.dispose === "function") {
        appInstanceRef.current.dispose();
        appInstanceRef.current = null;
      }
    };
  }, []);

  // ── HOOK 2: DETACHED HOT-LOADER FOR DYNAMIC IMAGE PROP CHANGES ──
  useEffect(() => {
    let active = true;
    setIsReady(false);

    const checkAndLoad = () => {
      const appInstance = appInstanceRef.current;
      if (!appInstance) {
        // If engine isn't ready yet, defer loop execution by 10ms frame ticks
        setTimeout(checkAndLoad, 10);
        return;
      }

      appInstance.loadImage(imageSrc).then(() => {
        if (!active) return;
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