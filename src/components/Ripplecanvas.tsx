"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// ─────────────────────────────────────────────────────────────
// Shared GSAP ticker
// ─────────────────────────────────────────────────────────────
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
    gsap.ticker.add(sharedTick, false, false);
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

// ─────────────────────────────────────────────────────────────
// Shared video singleton
// ─────────────────────────────────────────────────────────────
let sharedVideo: HTMLVideoElement | null = null;
let videoReady = false;
let videoRefCount = 0;
let sharedBitmap: ImageBitmap | null = null;
let bitmapVideoTime = -1;
let bitmapRafId: number | null = null;

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
  if (bitmapRafId !== null) { cancelAnimationFrame(bitmapRafId); bitmapRafId = null; }
  if (sharedBitmap) { sharedBitmap.close(); sharedBitmap = null; }
  bitmapVideoTime = -1;
}

function getSharedVideo(): HTMLVideoElement {
  if (!sharedVideo) {
    const v = document.createElement("video");
    v.src = "/videos/Pool-Water-Reflect.mp4";
    v.muted = true; v.loop = true; v.playsInline = true;
    v.preload = "auto"; v.crossOrigin = "anonymous";
    const onReady = () => { videoReady = true; startBitmapLoop(); };
    v.addEventListener("canplaythrough", onReady, { once: true });
    v.addEventListener("canplay", onReady, { once: true });
    const p = v.play();
    if (p) p.catch(() => document.addEventListener("pointerdown", () => v.play().catch(() => {}), { once: true }));
    sharedVideo = v;
  }
  videoRefCount++;
  return sharedVideo;
}

function releaseSharedVideo() {
  videoRefCount--;
  if (videoRefCount <= 0 && sharedVideo) {
    sharedVideo.pause(); sharedVideo = null; videoReady = false;
    videoRefCount = 0; stopBitmapLoop();
  }
}

let globalInstanceCounter = 0;
const UPLOAD_STRIDE = 4;

// ─────────────────────────────────────────────────────────────
// Lenis-aware scroll velocity
// Uses Lenis `scroll` event if available, falls back to RAF.
// ─────────────────────────────────────────────────────────────
let scrollVelocity = 0;  // 0–1 normalised Lenis velocity (or px/frame fallback)
let scrollListenerCount = 0;
let lenisVelocityRafId: number | null = null;
let lastRawScrollY = 0;

function onLenisScroll(e: CustomEvent) {
  // Lenis fires a custom 'lenis:scroll' event with { velocity }
  const v = Math.abs((e as CustomEvent & { detail?: { velocity?: number } }).detail?.velocity ?? 0);
  scrollVelocity = v;
}

function startScrollTracker() {
  if (scrollListenerCount > 0) { scrollListenerCount++; return; }
  scrollListenerCount++;

  // Try hooking into Lenis globalInstance
  // Lenis v1+ exposes window.__lenis or emits 'lenis:scroll'
  window.addEventListener("lenis:scroll", onLenisScroll as EventListener, { passive: true });

  // Fallback: raw delta tracking via RAF (used when Lenis not present)
  const track = () => {
    lenisVelocityRafId = requestAnimationFrame(track);
    const delta = Math.abs(window.scrollY - lastRawScrollY);
    lastRawScrollY = window.scrollY;
    // Only overwrite if Lenis event hasn't fired recently
    if (scrollVelocity === 0 && delta > 0) scrollVelocity = Math.min(delta / 10, 1);
    // Decay
    scrollVelocity *= 0.9;
  };
  lenisVelocityRafId = requestAnimationFrame(track);
}

function stopScrollTracker() {
  scrollListenerCount--;
  if (scrollListenerCount <= 0) {
    scrollListenerCount = 0;
    window.removeEventListener("lenis:scroll", onLenisScroll as EventListener);
    if (lenisVelocityRafId !== null) { cancelAnimationFrame(lenisVelocityRafId); lenisVelocityRafId = null; }
  }
}

// ─────────────────────────────────────────────────────────────
// Water-divide pointer trail
// Stores up to N historical touch points that decay over time.
// Each point creates an outward displacement "parting" effect.
// ─────────────────────────────────────────────────────────────
const TRAIL_LEN = 8;

interface TouchPoint {
  x: number; y: number;
  vx: number; vy: number;  // velocity for direction of parting
  age: number;             // 0 = fresh, 1 = dead
  strength: number;
}

interface SharedMouseState {
  x: number; y: number;
  vx: number; vy: number;
  rippleTarget: number;
  lastMove: number;
  down: boolean;
  trail: TouchPoint[];
}

const sharedMouse: SharedMouseState = {
  x: 0.5, y: 0.5, vx: 0, vy: 0,
  rippleTarget: 0.04, lastMove: 0,
  down: false, trail: [],
};

let mouseListenerCount = 0;
let prevMouseX = 0.5, prevMouseY = 0.5;

function pushTrail(x: number, y: number) {
  const vx = x - prevMouseX;
  const vy = y - prevMouseY;
  prevMouseX = x; prevMouseY = y;
  const strength = Math.min(Math.sqrt(vx * vx + vy * vy) * 40, 1.0);
  sharedMouse.trail.push({ x, y, vx, vy, age: 0, strength });
  if (sharedMouse.trail.length > TRAIL_LEN) sharedMouse.trail.shift();
}

function onSharedMouseMove(e: MouseEvent) {
  const nx = e.clientX / window.innerWidth;
  const ny = 1 - e.clientY / window.innerHeight;
  sharedMouse.vx = nx - sharedMouse.x;
  sharedMouse.vy = ny - sharedMouse.y;
  sharedMouse.x = nx; sharedMouse.y = ny;
  sharedMouse.rippleTarget = 0.12;
  sharedMouse.lastMove = performance.now();
  pushTrail(nx, ny);
}

function onSharedPointerDown() { sharedMouse.down = true; sharedMouse.rippleTarget = 0.18; }
function onSharedPointerUp()   { sharedMouse.down = false; }

function addSharedMouseListener() {
  if (mouseListenerCount === 0) {
    window.addEventListener("mousemove",   onSharedMouseMove,    { passive: true });
    window.addEventListener("pointerdown", onSharedPointerDown,  { passive: true });
    window.addEventListener("pointerup",   onSharedPointerUp,    { passive: true });
    startScrollTracker();
  }
  mouseListenerCount++;
}

function removeSharedMouseListener() {
  mouseListenerCount--;
  if (mouseListenerCount <= 0) {
    mouseListenerCount = 0;
    window.removeEventListener("mousemove",   onSharedMouseMove);
    window.removeEventListener("pointerdown", onSharedPointerDown);
    window.removeEventListener("pointerup",   onSharedPointerUp);
    stopScrollTracker();
  }
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export default function WaterBackground({ paused }: { paused?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => { pausedRef.current = paused ?? false; }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true, premultipliedAlpha: false,
      antialias: false, powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const instanceId = globalInstanceCounter++;
    const SCALE_IDLE   = 0.5;
    const SCALE_SCROLL = 0.3;

    // ── Vertex shader ────────────────────────────────────────
    const vert = `
      attribute vec2 a_position;
      varying vec2 vUv;
      void main() {
        vUv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // ── Fragment shader with water-divide trail ───────────────
    // MAX_TRAIL must match TRAIL_LEN above (passed as uniforms)
    const frag = `
      precision mediump float;
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform vec2  uMouse;
      uniform float uMouseVx;
      uniform float uMouseVy;
      uniform float uSpeed;
      uniform float uRippleStrength;
      uniform float uScrollVel;

      // Water-divide trail points
      #define MAX_TRAIL 8
      uniform vec2  uTrailPos[MAX_TRAIL];
      uniform float uTrailAge[MAX_TRAIL];
      uniform float uTrailVx[MAX_TRAIL];
      uniform float uTrailVy[MAX_TRAIL];
      uniform float uTrailStr[MAX_TRAIL];
      uniform int   uTrailCount;

      // Orbital secondary ripple
      uniform vec2  uMouse2;

      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;
        float t = uTime * uSpeed;

        // ── Base water undulation ──────────────────────────
        uv.x += sin(uv.y * 20.0 + t * 1.0) * 0.018;
        uv.y += sin(uv.x * 15.0 + t * 0.8) * 0.014;
        uv.x += sin(uv.y * 8.0  + t * 1.3) * 0.009;

        // ── Scroll warp: ripple from bottom on fast scroll ──
        float scrollAmp = clamp(uScrollVel * 0.08, 0.0, 0.025);
        uv.y += sin(uv.x * 12.0 + t * 3.0) * scrollAmp;

        // ── Water divide: trail points ──────────────────────
        // Each trail point pushes UV outward (parting water),
        // perpendicular to movement direction (surface tension).
        for (int i = 0; i < MAX_TRAIL; i++) {
          if (i >= uTrailCount) break;
          float alive = 1.0 - uTrailAge[i];
          if (alive <= 0.0) continue;

          vec2 delta = uv - uTrailPos[i];
          float dist  = length(delta);
          float norm  = dist + 0.0001;

          // Outward parting force — stronger close to finger
          float part  = exp(-dist * 8.0) * alive * uTrailStr[i] * 0.06;
          uv += (delta / norm) * part;

          // Along-trail wake ripple
          float wakeFreq = 30.0;
          float wakeAmp  = exp(-dist * 5.0) * alive * uTrailStr[i] * 0.015;
          float wake     = sin(dist * wakeFreq - t * 6.0) * wakeAmp;
          if (norm > 0.0001) uv += (delta / norm) * wake;

          // Surface tension recovery: inward pull at ring edge
          float ringDist = 0.08 * alive;
          float tension  = exp(-pow(dist - ringDist, 2.0) * 200.0) * alive * 0.012;
          if (norm > 0.0001) uv -= (delta / norm) * tension;
        }

        // ── Orbital secondary ripple ────────────────────────
        vec2  md2 = uv - uMouse2;
        float d2  = length(md2);
        float r2  = sin(d2 * 20.0 - t * 2.5) * 0.022 * exp(-d2 * 5.0);
        if (d2 > 0.0001) uv += normalize(md2) * r2;

        // ── Sample texture ──────────────────────────────────
        vec4 color = texture2D(uTexture, uv);

        // ── Tinting ─────────────────────────────────────────
        vec3 tintA = vec3(0.10, 0.45, 0.50);
        vec3 tintB = vec3(0.15, 0.60, 0.55);
        vec3 tintC = vec3(0.05, 0.25, 0.40);
        float mx   = vUv.x * 0.6 + vUv.y * 0.4;
        float my   = sin(vUv.y * 3.14159 + t * 0.1) * 0.5 + 0.5;
        vec3 tint  = mix(mix(tintA, tintB, mx), tintC, my * 0.3);
        color.rgb  = mix(color.rgb, tint, 0.55);
        color.rgb *= 0.4;

        gl_FragColor = vec4(color.rgb, 0.21);
      }
    `;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("Shader error:", gl.getShaderInfoLog(s));
      }
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
      -1,-1,  1,-1, -1,1,
      -1, 1,  1,-1,  1,1,
    ]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uTime           = gl.getUniformLocation(program, "uTime");
    const uMouse          = gl.getUniformLocation(program, "uMouse");
    const uMouseVx        = gl.getUniformLocation(program, "uMouseVx");
    const uMouseVy        = gl.getUniformLocation(program, "uMouseVy");
    const uMouse2         = gl.getUniformLocation(program, "uMouse2");
    const uSpeed          = gl.getUniformLocation(program, "uSpeed");
    const uRippleStrength = gl.getUniformLocation(program, "uRippleStrength");
    const uScrollVel      = gl.getUniformLocation(program, "uScrollVel");
    const uTrailCount     = gl.getUniformLocation(program, "uTrailCount");

    // Trail uniform arrays
    const uTrailPos = Array.from({ length: TRAIL_LEN }, (_, i) =>
      gl.getUniformLocation(program, `uTrailPos[${i}]`));
    const uTrailAge = Array.from({ length: TRAIL_LEN }, (_, i) =>
      gl.getUniformLocation(program, `uTrailAge[${i}]`));
    const uTrailVx  = Array.from({ length: TRAIL_LEN }, (_, i) =>
      gl.getUniformLocation(program, `uTrailVx[${i}]`));
    const uTrailVy  = Array.from({ length: TRAIL_LEN }, (_, i) =>
      gl.getUniformLocation(program, `uTrailVy[${i}]`));
    const uTrailStr = Array.from({ length: TRAIL_LEN }, (_, i) =>
      gl.getUniformLocation(program, `uTrailStr[${i}]`));

    // Texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([13, 90, 80, 255]));

    let lastUploadedBitmap: ImageBitmap | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    const resize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const scale  = scrollVelocity > 0.3 ? SCALE_SCROLL : SCALE_IDLE;
        canvas.width  = Math.floor(window.innerWidth  * scale);
        canvas.height = Math.floor(window.innerHeight * scale);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }, 100);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    getSharedVideo();
    addSharedMouseListener();

    const mouseSmooth = { x: 0.5, y: 0.5 };
    const start = performance.now();
    let angle = 0;
    let rippleCurrent = 0.04;
    let lastFrameTime = 0;
    let frameCount = instanceId;

    // Trail age decay speed (per frame at 60fps)
    const TRAIL_DECAY = 0.018;

    const render = (now: number) => {
      if (pausedRef.current) return;

      // Adaptive frame throttle: faster during scroll, normal idle
      const isScrolling = scrollVelocity > 0.3;
      const FRAME_MS = isScrolling ? 50 : 33;
      const elapsed = now - lastFrameTime;
      if (elapsed < FRAME_MS) return;
      lastFrameTime = now - (elapsed % FRAME_MS);

      // Dynamic resolution
      const scale   = isScrolling ? SCALE_SCROLL : SCALE_IDLE;
      const targetW = Math.floor(window.innerWidth  * scale);
      const targetH = Math.floor(window.innerHeight * scale);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width  = targetW;
        canvas.height = targetH;
        gl.viewport(0, 0, targetW, targetH);
      }

      // Staggered texture upload
      frameCount++;
      if (
        sharedBitmap && sharedBitmap !== lastUploadedBitmap &&
        (frameCount % UPLOAD_STRIDE === instanceId % UPLOAD_STRIDE)
      ) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sharedBitmap);
        lastUploadedBitmap = sharedBitmap;
      }

      // Age trail points
      for (const pt of sharedMouse.trail) {
        pt.age = Math.min(pt.age + TRAIL_DECAY * (elapsed / 16.67), 1);
      }

      angle += 0.008 * (elapsed / 33);
      mouseSmooth.x += (sharedMouse.x - mouseSmooth.x) * 0.06;
      mouseSmooth.y += (sharedMouse.y - mouseSmooth.y) * 0.06;

      if (now - sharedMouse.lastMove > 300) sharedMouse.rippleTarget = 0.04;
      rippleCurrent += (sharedMouse.rippleTarget - rippleCurrent) * 0.08;

      const ox = 0.5 + Math.cos(angle)       * 0.3;
      const oy = 0.5 + Math.sin(angle * 0.7) * 0.2;

      // Upload uniforms
      gl.uniform1f(uTime,           (now - start) / 1000);
      gl.uniform2f(uMouse,          mouseSmooth.x, mouseSmooth.y);
      gl.uniform1f(uMouseVx,        sharedMouse.vx);
      gl.uniform1f(uMouseVy,        sharedMouse.vy);
      gl.uniform2f(uMouse2,         ox, oy);
      gl.uniform1f(uSpeed,          1.1);
      gl.uniform1f(uRippleStrength, rippleCurrent);
      gl.uniform1f(uScrollVel,      scrollVelocity * 10);

      // Trail uniforms
      const trail = sharedMouse.trail;
      const count = trail.length;
      gl.uniform1i(uTrailCount, count);
      for (let i = 0; i < TRAIL_LEN; i++) {
        const pt = trail[i];
        if (pt) {
          gl.uniform2f(uTrailPos[i], pt.x, pt.y);
          gl.uniform1f(uTrailAge[i], pt.age);
          gl.uniform1f(uTrailVx[i],  pt.vx);
          gl.uniform1f(uTrailVy[i],  pt.vy);
          gl.uniform1f(uTrailStr[i], pt.strength);
        } else {
          gl.uniform2f(uTrailPos[i], 0, 0);
          gl.uniform1f(uTrailAge[i], 1);
          gl.uniform1f(uTrailVx[i],  0);
          gl.uniform1f(uTrailVy[i],  0);
          gl.uniform1f(uTrailStr[i], 0);
        }
      }

      gl.uniform1i(gl.getUniformLocation(program, "uTexture"), 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    registerCallback(render);

    return () => {
      clearTimeout(resizeTimer);
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
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        opacity: 1,
      }}
    />
  );
}