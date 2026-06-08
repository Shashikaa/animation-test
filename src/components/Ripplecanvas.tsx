"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

type RenderCallback = (now: number) => void;
const renderCallbacks = new Set<RenderCallback>();
let tickerAdded = false;

function sharedTick() {
  const now = performance.now();
  renderCallbacks.forEach((cb) => cb(now));
}

function registerCallback(cb: RenderCallback) {
  renderCallbacks.add(cb);
  if (!tickerAdded) {
    gsap.ticker.add(sharedTick, false, false); // false = not lagSmoothing-aware, runs after GSAP
    tickerAdded = true;
  }
}

function unregisterCallback(cb: RenderCallback) {
  renderCallbacks.delete(cb);
  if (renderCallbacks.size === 0 && tickerAdded) {
    gsap.ticker.remove(sharedTick);
    tickerAdded = false;
  }
}

// ── Shared video singleton ────────────────────────────────────
let sharedVideo: HTMLVideoElement | null = null;
let videoReady    = false;
let videoRefCount = 0;

// ── Shared video texture cache ────────────────────────────────
// Upload video to an offscreen canvas once per frame, share the
// ImageBitmap across all GL contexts instead of uploading raw video.
let sharedBitmap:     ImageBitmap | null = null;
let bitmapVideoTime   = -1;
let bitmapRafId:      number | null = null;

function startBitmapLoop() {
  if (bitmapRafId !== null) return;

  const loop = () => {
    bitmapRafId = requestAnimationFrame(loop);
    const v = sharedVideo;
    if (!v || !videoReady || v.readyState < 2) return;
    if (v.currentTime === bitmapVideoTime) return;

    bitmapVideoTime = v.currentTime;
    createImageBitmap(v, { resizeWidth: 512, resizeHeight: 288 }).then((bm) => {
      if (sharedBitmap) sharedBitmap.close();
      sharedBitmap = bm;
    });
  };
  bitmapRafId = requestAnimationFrame(loop);
}

function stopBitmapLoop() {
  if (bitmapRafId !== null) {
    cancelAnimationFrame(bitmapRafId);
    bitmapRafId = null;
  }
  if (sharedBitmap) {
    sharedBitmap.close();
    sharedBitmap = null;
  }
  bitmapVideoTime = -1;
}

function getSharedVideo(): HTMLVideoElement {
  if (!sharedVideo) {
    const v       = document.createElement("video");
    v.src         = "/videos/Pool-Water-Reflect.mp4";
    v.muted       = true;
    v.loop        = true;
    v.playsInline = true;
    v.preload     = "auto";
    v.crossOrigin = "anonymous";

    const onReady = () => {
      videoReady = true;
      startBitmapLoop();
    };
    v.addEventListener("canplaythrough", onReady, { once: true });
    v.addEventListener("canplay",        onReady, { once: true });

    const playPromise = v.play();
    if (playPromise) {
      playPromise.catch(() => {
        document.addEventListener("pointerdown", () => v.play().catch(() => {}), { once: true });
      });
    }
    sharedVideo = v;
  }
  videoRefCount++;
  return sharedVideo;
}

function releaseSharedVideo() {
  videoRefCount--;
  if (videoRefCount <= 0 && sharedVideo) {
    sharedVideo.pause();
    sharedVideo   = null;
    videoReady    = false;
    videoRefCount = 0;
    stopBitmapLoop();
  }
}

// ── Shared scroll velocity tracker ───────────────────────────
// Reduces canvas resolution while scrolling to save GPU budget.
let scrollVelocity  = 0;
let lastScrollY     = 0;
let scrollRafId:    number | null = null;

function startScrollTracker() {
  if (scrollRafId !== null) return;
  const track = () => {
    scrollRafId   = requestAnimationFrame(track);
    const delta   = Math.abs(window.scrollY - lastScrollY);
    lastScrollY   = window.scrollY;
    scrollVelocity = delta;
  };
  scrollRafId = requestAnimationFrame(track);
}

function stopScrollTracker() {
  if (scrollRafId !== null) {
    cancelAnimationFrame(scrollRafId);
    scrollRafId = null;
  }
}

// ── Shared mouse state ────────────────────────────────────────
const sharedMouse = { x: 0.5, y: 0.5, rippleTarget: 0.04, lastMove: 0 };
let mouseListenerCount = 0;

function onSharedMouseMove(e: MouseEvent) {
  sharedMouse.x            = e.clientX / window.innerWidth;
  sharedMouse.y            = 1 - e.clientY / window.innerHeight;
  sharedMouse.rippleTarget = 0.10;
  sharedMouse.lastMove     = performance.now();
}

function addSharedMouseListener() {
  if (mouseListenerCount === 0) {
    window.addEventListener("mousemove", onSharedMouseMove, { passive: true });
    startScrollTracker();
  }
  mouseListenerCount++;
}

function removeSharedMouseListener() {
  mouseListenerCount--;
  if (mouseListenerCount <= 0) {
    window.removeEventListener("mousemove", onSharedMouseMove);
    mouseListenerCount = 0;
    stopScrollTracker();
  }
}

// ─────────────────────────────────────────────────────────────

export default function WaterBackground({ paused }: { paused?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = paused ?? false;
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha:                 true,
      premultipliedAlpha:    false,
      antialias:             false,
      powerPreference:       "high-performance",
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const SCALE_IDLE    = 0.5;
    const SCALE_SCROLL  = 0.3; // drop res while scrolling

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

        uv.x += sin(uv.y * 20.0 + t * 1.0) * 0.018;
        uv.y += sin(uv.x * 15.0 + t * 0.8) * 0.014;
        uv.x += sin(uv.y * 8.0  + t * 1.3) * 0.009;

        vec2  md1 = uv - uMouse;
        float d1  = length(md1);
        float r1  = sin(d1 * 25.0 - t * 5.0) * uRippleStrength * exp(-d1 * 4.0);
        if (d1 > 0.0001) uv += normalize(md1) * r1;

        float r1b = sin(d1 * 12.0 - t * 3.5) * (uRippleStrength * 0.4) * exp(-d1 * 2.5);
        if (d1 > 0.0001) uv += normalize(md1) * r1b;

        vec2  md2 = uv - uMouse2;
        float d2  = length(md2);
        float r2  = sin(d2 * 20.0 - t * 2.5) * 0.025 * exp(-d2 * 5.0);
        if (d2 > 0.0001) uv += normalize(md2) * r2;

        vec4 color = texture2D(uTexture, uv);

        vec3 tintA = vec3(0.10, 0.45, 0.50);
        vec3 tintB = vec3(0.15, 0.60, 0.55);
        vec3 tintC = vec3(0.05, 0.25, 0.40);
        float mx   = vUv.x * 0.6 + vUv.y * 0.4;
        float my   = sin(vUv.y * 3.14159 + t * 0.1) * 0.5 + 0.5;
        vec3 tint  = mix(mix(tintA, tintB, mx), tintC, my * 0.3);
        color.rgb  = mix(color.rgb, tint, 0.55);
        color.rgb *= 0.4;

        gl_FragColor = vec4(color.rgb, 0.15);
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

    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime           = gl.getUniformLocation(program, "uTime");
    const uMouse          = gl.getUniformLocation(program, "uMouse");
    const uMouse2         = gl.getUniformLocation(program, "uMouse2");
    const uSpeed          = gl.getUniformLocation(program, "uSpeed");
    const uRippleStrength = gl.getUniformLocation(program, "uRippleStrength");
    const uTexture        = gl.getUniformLocation(program, "uTexture");

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
      gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([13, 90, 80, 255])
    );

    let lastUploadedBitmap: ImageBitmap | null = null;

    const resize = () => {
      const scale  = scrollVelocity > 3 ? SCALE_SCROLL : SCALE_IDLE;
      canvas.width  = Math.floor(window.innerWidth  * scale);
      canvas.height = Math.floor(window.innerHeight * scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    getSharedVideo();
    addSharedMouseListener();

    const mouseSmooth = { x: 0.5, y: 0.5 };
    const start       = performance.now();
    let angle         = 0;
    let rippleCurrent = 0.04;
    let lastFrameTime = 0;

    // Drop to 20fps while scrolling fast, 30fps otherwise
    const render = (now: number) => {
      if (pausedRef.current) return;

      const isScrolling = scrollVelocity > 3;
      const FRAME_MS    = isScrolling ? 50 : 33; // 20fps vs 30fps

      const elapsed = now - lastFrameTime;
      if (elapsed < FRAME_MS) return;
      lastFrameTime = now - (elapsed % FRAME_MS);

      // Resize canvas if scroll state changed
      const scale       = isScrolling ? SCALE_SCROLL : SCALE_IDLE;
      const targetW     = Math.floor(window.innerWidth  * scale);
      const targetH     = Math.floor(window.innerHeight * scale);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width  = targetW;
        canvas.height = targetH;
        gl.viewport(0, 0, targetW, targetH);
      }

      // Upload shared bitmap if new frame available — much cheaper than raw video
      if (sharedBitmap && sharedBitmap !== lastUploadedBitmap) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sharedBitmap);
        lastUploadedBitmap = sharedBitmap;
      }

      angle += 0.008 * (elapsed / 33);
      mouseSmooth.x += (sharedMouse.x - mouseSmooth.x) * 0.06;
      mouseSmooth.y += (sharedMouse.y - mouseSmooth.y) * 0.06;

      if (now - sharedMouse.lastMove > 300) sharedMouse.rippleTarget = 0.04;
      rippleCurrent += (sharedMouse.rippleTarget - rippleCurrent) * 0.08;

      const ox = 0.5 + Math.cos(angle)       * 0.3;
      const oy = 0.5 + Math.sin(angle * 0.7) * 0.2;

      gl.uniform1f(uTime,           (now - start) / 1000);
      gl.uniform2f(uMouse,          mouseSmooth.x, mouseSmooth.y);
      gl.uniform2f(uMouse2,         ox, oy);
      gl.uniform1f(uSpeed,          1.1);
      gl.uniform1f(uRippleStrength, rippleCurrent);
      gl.uniform1i(uTexture,        0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    registerCallback(render);

    return () => {
      unregisterCallback(render);
      window.removeEventListener("resize", resize);
      releaseSharedVideo();
      removeSharedMouseListener();
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
        opacity:  1,
      }}
    />
  );
}