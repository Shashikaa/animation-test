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
    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.zIndex = "1";

    container.appendChild(renderer.domElement);

    // ---------------- VIDEO ----------------
    const video = document.createElement("video");

    video.src = "/videos/pool-water-reflect.mp4";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";

    let material: THREE.ShaderMaterial;
    let texture: THREE.VideoTexture;

    const start = async () => {
      try {
        await video.play();
      } catch {}

      texture = new THREE.VideoTexture(video);

      const uniforms = {
        uTexture: { value: texture },
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
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

  color.rgb = mix(color.rgb, tint, 0.70);
  color.rgb *= 0.57;

  gl_FragColor = vec4(color.rgb, 0.3);
}
        `,
      });

      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      scene.add(mesh);

      renderer.domElement.style.opacity = "1";

      const clock = new THREE.Clock();

      const animate = () => {
        material.uniforms.uTime.value = clock.getElapsedTime();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };

      animate();
    };

    video.addEventListener("loadeddata", start, { once: true });
    video.play().catch(() => {});

    const mouseMove = (e: MouseEvent) => {
      if (material) {
        material.uniforms.uMouse.value.set(
          e.clientX / window.innerWidth,
          1 - e.clientY / window.innerHeight
        );
      }
    };

    window.addEventListener("mousemove", mouseMove);

    return () => {
      window.removeEventListener("mousemove", mouseMove);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
      }}
    >
      {/* ONLY RENDER CANVAS — NO GRADIENT HERE */}
    </div>
  );
}