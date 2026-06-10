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

// ── Shared Video Context Setup ───────────────────────────────
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
const TRAIL_LEN = 8;

interface TouchPoint {
  x: number; y: number;
  vx: number; vy: number;
  age: number;
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
let scrollVelocity = 0;
let scrollListenerCount = 0;
let lenisVelocityRafId: number | null = null;
let lastRawScrollY = 0;

function trackManualScroll() {
  lenisVelocityRafId = requestAnimationFrame(trackManualScroll);
  const currentScrollY = window.scrollY || document.documentElement.scrollTop;
  const delta = Math.abs(currentScrollY - lastRawScrollY);
  lastRawScrollY = currentScrollY;
  
  if (delta > 0) {
    scrollVelocity = Math.min(delta / 8, 2.5);
  } else {
    scrollVelocity *= 0.85; // Faster decay tracking
  }
}

function startScrollTracker() {
  if (scrollListenerCount > 0) { scrollListenerCount++; return; }
  scrollListenerCount++;
  lastRawScrollY = window.scrollY || document.documentElement.scrollTop;
  lenisVelocityRafId = requestAnimationFrame(trackManualScroll);
}

function stopScrollTracker() {
  scrollListenerCount--;
  if (scrollListenerCount <= 0) {
    scrollListenerCount = 0;
    if (lenisVelocityRafId !== null) { cancelAnimationFrame(lenisVelocityRafId); lenisVelocityRafId = null; }
  }
}

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
    window.addEventListener("mousemove",   onSharedMouseMove,   { passive: true });
    window.addEventListener("pointerdown", onSharedPointerDown, { passive: true });
    window.addEventListener("pointerup",   onSharedPointerUp,   { passive: true });
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

export default function WaterBackground({ paused }: { paused?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => { pausedRef.current = paused ?? false; }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const instanceId = globalInstanceCounter++;
    const SCALE_IDLE   = 0.5;
    const SCALE_SCROLL = 0.35;

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
      uniform float uSpeed;
      uniform float uScrollVel;

      #define MAX_TRAIL 8
      uniform vec2  uTrailPos[MAX_TRAIL];
      uniform float uTrailAge[MAX_TRAIL];
      uniform float uTrailStr[MAX_TRAIL];
      uniform int   uTrailCount;
      uniform vec2  uMouse2;

      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;
        float t = uTime * uSpeed;

        uv.x += sin(uv.y * 20.0 + t * 1.0) * 0.018;
        uv.y += sin(uv.x * 15.0 + t * 0.8) * 0.014;
        uv.x += sin(uv.y * 8.0  + t * 1.3) * 0.009;

        float scrollAmp = clamp(uScrollVel * 0.015, 0.0, 0.03);
        uv.y += sin(uv.x * 10.0 + t * 2.5) * scrollAmp;

        for (int i = 0; i < MAX_TRAIL; i++) {
          if (i >= uTrailCount) break;
          float alive = 1.0 - uTrailAge[i];
          if (alive <= 0.0) continue;

          vec2 delta = uv - uTrailPos[i];
          float dist  = length(delta);
          float norm  = dist + 0.0001;

          float part  = exp(-dist * 8.0) * alive * uTrailStr[i] * 0.06;
          uv += (delta / norm) * part;

          float wakeFreq = 30.0;
          float wakeAmp  = exp(-dist * 5.0) * alive * uTrailStr[i] * 0.015;
          float wake     = sin(dist * wakeFreq - t * 6.0) * wakeAmp;
          if (norm > 0.0001) uv += (delta / norm) * wake;

          float ringDist = 0.08 * alive;
          float tension  = exp(-pow(dist - ringDist, 2.0) * 200.0) * alive * 0.012;
          if (norm > 0.0001) uv -= (delta / norm) * tension;
        }

        vec2  md2 = uv - uMouse2;
        float d2  = length(md2);
        float r2  = sin(d2 * 20.0 - t * 2.5) * 0.022 * exp(-d2 * 5.0);
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

        gl_FragColor = vec4(color.rgb, 0.21);
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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime           = gl.getUniformLocation(program, "uTime");
    const uMouse          = gl.getUniformLocation(program, "uMouse");
    const uMouse2         = gl.getUniformLocation(program, "uMouse2");
    const uSpeed          = gl.getUniformLocation(program, "uSpeed");
    const uScrollVel      = gl.getUniformLocation(program, "uScrollVel");
    const uTrailCount     = gl.getUniformLocation(program, "uTrailCount");

    const uTrailPos = Array.from({ length: TRAIL_LEN }, (_, i) => gl.getUniformLocation(program, `uTrailPos[${i}]`));
    const uTrailAge = Array.from({ length: TRAIL_LEN }, (_, i) => gl.getUniformLocation(program, `uTrailAge[${i}]`));
    const uTrailStr = Array.from({ length: TRAIL_LEN }, (_, i) => gl.getUniformLocation(program, `uTrailStr[${i}]`));

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    let lastUploadedBitmap: ImageBitmap | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    // FIX: Fixed the canvas.widt typo to correctly set layout dimensions
    const resize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const scale = scrollVelocity > 0.3 ? SCALE_SCROLL : SCALE_IDLE;
        const w = Math.floor(window.innerWidth * scale);
        const h = Math.floor(window.innerHeight * scale);
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          gl.viewport(0, 0, w, h);
        }
      }, 60);
    };

    window.addEventListener("resize", resize, { passive: true });
    resize();

    const video = getSharedVideo();
    addSharedMouseListener();

    let currentRipple = 0.04;
    let mouse2X = 0.5, mouse2Y = 0.5;
    let localTime = 0;
    let lastFrameTime = performance.now();

    const tick = (now: number) => {
      if (pausedRef.current) return;

      const deltaFrame = now - lastFrameTime;
      lastFrameTime = now;
      localTime += deltaFrame * 0.001;

      if (scrollVelocity > 0.1) {
        resize();
      }

      currentRipple += (sharedMouse.rippleTarget - currentRipple) * 0.1;
      if (performance.now() - sharedMouse.lastMove > 800) {
        sharedMouse.rippleTarget = 0.04;
      }

      const osc = localTime * 0.5;
      mouse2X = sharedMouse.x + Math.cos(osc) * currentRipple;
      mouse2Y = sharedMouse.y + Math.sin(osc) * currentRipple;

      gl.clear(gl.COLOR_BUFFER_BIT);

      if (sharedBitmap && sharedBitmap !== lastUploadedBitmap) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sharedBitmap);
        lastUploadedBitmap = sharedBitmap;
      }

      gl.uniform1f(uTime, localTime);
      gl.uniform2f(uMouse, sharedMouse.x, sharedMouse.y);
      gl.uniform2f(uMouse2, mouse2X, mouse2Y);
      gl.uniform1f(uSpeed, 1.2);
      gl.uniform1f(uScrollVel, scrollVelocity);

      const activeTrail = sharedMouse.trail.filter(pt => pt.age < 1.0);
      gl.uniform1i(uTrailCount, activeTrail.length);

      for (let i = 0; i < TRAIL_LEN; i++) {
        if (i < activeTrail.length) {
          const pt = activeTrail[i];
          pt.age += deltaFrame * 0.0015; // Natural fluid decay rate
          gl.uniform2f(uTrailPos[i], pt.x, pt.y);
          gl.uniform1f(uTrailAge[i], Math.min(pt.age, 1.0));
          gl.uniform1f(uTrailStr[i], pt.strength);
        }
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    registerCallback(tick);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", resize);
      unregisterCallback(tick);
      removeSharedMouseListener();
      releaseSharedVideo();
      
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.deleteTexture(texture);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
    };
  }, [paused]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 h-full w-full opacity-60"
      style={{ mixBlendMode: "normal", zIndex: 1 }}
    />
  );
}