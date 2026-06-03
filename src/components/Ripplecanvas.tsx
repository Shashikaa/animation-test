"use client";
import { useEffect, useRef } from "react";

export default function WaterBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    const vert = `
      attribute vec2 a_position;
      varying vec2 vUv;
      void main() {
        vUv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const frag = `
      precision mediump float;
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform vec2  uMouse;
      uniform vec2  uMouse2;
      uniform float uSpeed;
      uniform float uRippleStrength;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;
        float t = uTime * uSpeed;

        // Faster, more visible waves
// In the fragment shader — lower wave multipliers
uv.x += sin(uv.y * 20.0 + t * 1.0) * 0.018;
uv.y += sin(uv.x * 15.0 + t * 0.8) * 0.014;
uv.x += sin(uv.y * 8.0  + t * 1.3) * 0.009;

        // Primary mouse ripple — much stronger radius + amplitude
        vec2  md1 = uv - uMouse;
        float d1  = length(md1);
        float r1  = sin(d1 * 25.0 - t * 5.0)
                    * uRippleStrength
                    * exp(-d1 * 4.0);
        if (d1 > 0.0001) uv += normalize(md1) * r1;

        // Secondary wide ripple ring around mouse
        float r1b = sin(d1 * 12.0 - t * 3.5)
                    * (uRippleStrength * 0.4)
                    * exp(-d1 * 2.5);
        if (d1 > 0.0001) uv += normalize(md1) * r1b;

        // Ambient drifting ripple
        vec2  md2 = uv - uMouse2;
        float d2  = length(md2);
        float r2  = sin(d2 * 20.0 - t * 2.5) * 0.025 * exp(-d2 * 5.0);
        if (d2 > 0.0001) uv += normalize(md2) * r2;

        vec4 color = texture2D(uTexture, uv);

        vec3 tintA = vec3(0.04, 0.14, 0.18);
        vec3 tintB = vec3(0.02, 0.30, 0.28);
        vec3 tintC = vec3(0.08, 0.06, 0.20);
        float mx   = vUv.x * 0.6 + vUv.y * 0.4;
        float my   = sin(vUv.y * 3.14159 + t * 0.1) * 0.5 + 0.5;
        vec3 tint  = mix(mix(tintA, tintB, mx), tintC, my * 0.3);
        color.rgb  = mix(color.rgb, tint, 0.75);
        color.rgb *= 0.45;

        gl_FragColor = vec4(color.rgb, 0.1);
      }
    `;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER,   vert));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1,
    ]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime           = gl.getUniformLocation(program, "uTime");
    const uMouse          = gl.getUniformLocation(program, "uMouse");
    const uMouse2         = gl.getUniformLocation(program, "uMouse2");
    const uSpeed          = gl.getUniformLocation(program, "uSpeed");
    const uRippleStrength = gl.getUniformLocation(program, "uRippleStrength");
    const uTexture        = gl.getUniformLocation(program, "uTexture");

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const video = document.createElement("video");
    video.src         = "/videos/Pool-Water-Reflect.mp4";
    video.muted       = true;
    video.loop        = true;
    video.playsInline = true;
    video.preload     = "auto";

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let animId: number;
    let angle         = 0;
    // rippleStrength lerps up when mouse moves, fades when idle
    let rippleCurrent = 0.04;
    let rippleTarget  = 0.04;
    let lastMoveTime  = 0;

    const mouse  = { x: 0.5, y: 0.5 };
    const target = { x: 0.5, y: 0.5 };
    const start  = performance.now();

    const render = () => {
      animId  = requestAnimationFrame(render);
      angle  += 0.008;

      mouse.x += (target.x - mouse.x) * 0.06;
      mouse.y += (target.y - mouse.y) * 0.06;

      // Fade ripple strength back to resting when mouse is idle
      const now = performance.now();
      if (now - lastMoveTime > 300) rippleTarget = 0.04;
      rippleCurrent += (rippleTarget - rippleCurrent) * 0.08;

      const ox = 0.5 + Math.cos(angle)       * 0.3;
      const oy = 0.5 + Math.sin(angle * 0.7) * 0.2;

      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      }

      gl.uniform1f(uTime,           (performance.now() - start) / 1000);
      gl.uniform2f(uMouse,          mouse.x, mouse.y);
      gl.uniform2f(uMouse2,         ox, oy);
      gl.uniform1f(uSpeed,          1.1);
      gl.uniform1f(uRippleStrength, rippleCurrent);
      gl.uniform1i(uTexture,        0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    video.addEventListener("loadeddata", () => {
      video.play().catch(() => {});
      render();
    }, { once: true });

    video.play().catch(() => {});

    const onMouse = (e: MouseEvent) => {
      target.x     = e.clientX / window.innerWidth;
      target.y     = 1 - e.clientY / window.innerHeight;
      rippleTarget = 0.10;   // spike up on movement
      lastMoveTime = performance.now();
    };
    window.addEventListener("mousemove", onMouse);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouse);
      video.pause();
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset:    0,
        width:    "100%",
        height:   "100%",
        zIndex:   1,
      }}
    />
  );
}