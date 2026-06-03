"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function WaterBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    // Cap pixel ratio — full Retina on a fullscreen shader is very expensive
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.zIndex = "1";

    container.appendChild(renderer.domElement);

    // Separate target & current mouse — lerp in render loop, not on every event
    const mouseRef     = new THREE.Vector2(0.5, 0.5);
    const targetMouse  = new THREE.Vector2(0.5, 0.5);

    let animationId: number;
    let material: THREE.ShaderMaterial;
    let texture: THREE.VideoTexture;

    // ---------------- VIDEO ----------------
    const video = document.createElement("video");

    video.src        = "/videos/Pool-Water-Reflect-compressed.mp4";
    video.muted      = true;
    video.loop       = true;
    video.playsInline = true;
    video.preload    = "auto";

    const start = async () => {
      try {
        await video.play();
      } catch {}

      texture = new THREE.VideoTexture(video);

      const uniforms = {
        uTexture: { value: texture },
        uTime:    { value: 0 },
        uMouse:   { value: mouseRef },
      };

      material = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,

        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,

        fragmentShader: `
          uniform sampler2D uTexture;
          uniform float uTime;
          uniform vec2 uMouse;
          varying vec2 vUv;

          void main() {
            vec2 uv = vUv;

            float wave1 = sin(uv.y * 20.0 + uTime * 0.6) * 0.012;
            float wave2 = sin(uv.x * 15.0 + uTime * 0.4) * 0.008;

            uv.x += wave1;
            uv.y += wave2;

            vec2 mouseDir = uv - uMouse;
            float dist = length(mouseDir);

            float ripple =
              sin(dist * 30.0 - uTime * 3.0)
              * 0.04
              * exp(-dist * 6.0);

            if (dist > 0.0001) {
              uv += normalize(mouseDir) * ripple;
            }

            vec4 color = texture2D(uTexture, uv);

            vec3 tintA = vec3(0.086, 0.176, 0.141);
            vec3 tintB = vec3(0.035, 0.255, 0.275);
            vec3 tint  = mix(tintA, tintB, vUv.x * 0.6 + vUv.y * 0.4);

            color.rgb = mix(color.rgb, tint, 0.80);
            color.rgb *= 0.5;

            gl_FragColor = vec4(color.rgb, 0.3);
          }
        `,
      });

      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      scene.add(mesh);

      renderer.domElement.style.opacity = "1";

      const clock = new THREE.Clock();

      const animate = () => {
        animationId = requestAnimationFrame(animate);

        // Lerp mouse toward target — smooth AND avoids per-event uniform writes
        mouseRef.lerp(targetMouse, 0.05);

        material.uniforms.uTime.value  = clock.getElapsedTime();
        material.uniforms.uMouse.value = mouseRef;

        // Tell Three.js the video frame may have changed
        texture.needsUpdate = true;

        renderer.render(scene, camera);
      };

      animate();
    };

    video.addEventListener("loadeddata", start, { once: true });
    video.play().catch(() => {});

    // Only update the target — actual uniform update happens in rAF
    const mouseMove = (e: MouseEvent) => {
      targetMouse.set(
        e.clientX / window.innerWidth,
        1 - e.clientY / window.innerHeight
      );
    };

    window.addEventListener("mousemove", mouseMove);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", mouseMove);
      video.pause();
      texture?.dispose();
      material?.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset:    0,
        overflow: "hidden",
      }}
    >
      {/* ONLY RENDER CANVAS — NO GRADIENT HERE */}
    </div>
  );
}