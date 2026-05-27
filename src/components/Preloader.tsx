"use client";
import { useEffect, useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { gsap } from "gsap";

interface PreloaderProps {
  onComplete?: () => void;
}

export const LOGO_FONT_SIZE      = 28;
export const LOGO_LETTER_SPC     = "0.32em";
export const LOGO_FONT_FAMILY    = "'Cormorant Garamond', 'Didot', 'Georgia', serif";
export const LOGO_FONT_WEIGHT    = 300;
export const LOGO_COLOR          = "#F4EEDF";
export const LOGO_ICON_W         = 84;
export const LOGO_ICON_H         = 68;
export const LOGO_GAP            = 8;
export const LOGO_WORD_BOX       = 200;
export const LOGO_ICON_SLOT_FULL = 100;
export const HEADER_LOGO_SCALE   = 0.52;

const PRE_FONT_SIZE      = LOGO_FONT_SIZE;
const PRE_GAP            = LOGO_GAP;
const PRE_WORD_BOX       = LOGO_WORD_BOX;
const PRE_ICON_SLOT_FULL = LOGO_ICON_SLOT_FULL;
const LINE_TEXT_GAP      = 18;

export const IconMark = ({ style }: { style?: React.CSSProperties }) => (
  <img
    src="/icon-center.svg"
    width={LOGO_ICON_W}
    height={LOGO_ICON_H}
    alt=""
    draggable={false}
    style={{
      display: "block",
      flexShrink: 0,
      userSelect: "none",
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      ...style,
    }}
  />
);

// ─── WebGL ripple background ───────────────────────────────────────────────
const VS = `
  attribute vec2 a_pos;
  void main(){ gl_Position = vec4(a_pos, 0., 1.); }
`;

const FS = `
  precision highp float;
  uniform vec2  u_res;
  uniform float u_time;
  uniform vec2  u_ripples[12];
  uniform float u_ages[12];
  uniform int   u_count;

  float ripple(vec2 uv, vec2 center, float age) {
    float d        = length(uv - center);
    float front    = age * 0.35;
    float width    = 0.07 + age * 0.035;
    float envelope = exp(-pow((d - front) / width, 2.0));
    float wave     = sin((d - front) * 38.0 - age * 2.8);
    float fade     = exp(-age * 1.3);
    // subtle: reduced amplitude compared to standalone demo
    return envelope * wave * fade * 0.016;
  }

  vec3 deepWater(vec2 uv, float t) {
    float nx = sin(uv.x * 3.1 + t * 0.22) * 0.5 + 0.5;
    float ny = cos(uv.y * 2.7 + t * 0.18) * 0.5 + 0.5;
    float nz = sin((uv.x + uv.y) * 2.0 + t * 0.14) * 0.5 + 0.5;
    float n  = (nx + ny + nz) / 3.0;
    // darker / more muted than standalone — sits behind logo
    vec3 deep  = vec3(0.075, 0.215, 0.205);
    vec3 mid   = vec3(0.095, 0.260, 0.245);
    vec3 light = vec3(0.120, 0.310, 0.290);
    vec3 col   = mix(deep, mid, n);
    col        = mix(col, light, n * n * 0.4);
    return col;
  }

  void main() {
    vec2  uv     = gl_FragCoord.xy / u_res;
    float aspect = u_res.x / u_res.y;
    vec2  uvA    = vec2(uv.x * aspect, uv.y);

    float disp = 0.0;
    for (int i = 0; i < 12; i++) {
      if (i >= u_count) break;
      vec2 center = vec2(u_ripples[i].x * aspect, u_ripples[i].y);
      disp += ripple(uvA, center, u_ages[i]);
    }

    // gentle ambient shimmer
    float base = sin(uvA.x * 5.1 + u_time * 0.19) * 0.002
               + cos(uvA.y * 4.3 + u_time * 0.15) * 0.002
               + sin((uvA.x + uvA.y) * 3.7 + u_time * 0.12) * 0.0015;

    vec2 dUV = uv + vec2(disp + base, disp * 0.6 + base * 0.6);
    vec3 col = deepWater(dUV, u_time);

    // very subtle specular — teal-tinted, not white
    float spec = pow(max(0.0, disp * 12.0 + base * 4.0), 2.5) * 0.18;
    col += vec3(spec * 0.55, spec * 0.85, spec * 0.80);

    // soft centre vignette keeps edges dark
    float vign = 1.0 - smoothstep(0.25, 1.1, length((uv - 0.5) * vec2(aspect, 1.0)));
    col *= 0.78 + 0.22 * vign;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

function useRippleCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  active: boolean
) {
  const ripplesRef = useRef<{ x: number; y: number; age: number }[]>([]);
  const smoothMouse = useRef({ x: 0.5, y: 0.5 });
  const glRef       = useRef<WebGLRenderingContext | null>(null);
  const uRef        = useRef<Record<string, WebGLUniformLocation | null>>({});
  const rafRef      = useRef<number>(0);
  const startRef    = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: true });
    if (!gl) return;
    glRef.current = gl;

    // compile & link
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER,   VS));
    gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
    const aPOS = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPOS);
    gl.vertexAttribPointer(aPOS, 2, gl.FLOAT, false, 0, 0);

    uRef.current = {
      res:   gl.getUniformLocation(prog, "u_res"),
      time:  gl.getUniformLocation(prog, "u_time"),
      rips:  gl.getUniformLocation(prog, "u_ripples"),
      ages:  gl.getUniformLocation(prog, "u_ages"),
      count: gl.getUniformLocation(prog, "u_count"),
    };

    const MAX = 12;

    function resize() {
      const w = canvas!.offsetWidth, h = canvas!.offsetHeight;
      canvas!.width  = w * devicePixelRatio;
      canvas!.height = h * devicePixelRatio;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }
    resize();
    window.addEventListener("resize", resize);

    function addRipple(x: number, y: number) {
      const arr = ripplesRef.current;
      if (arr.length >= MAX) arr.shift();
      arr.push({ x, y, age: 0 });
    }

    function onMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = 1 - (e.clientY - rect.top) / rect.height;
      const dx = mx - smoothMouse.current.x;
      const dy = my - smoothMouse.current.y;
      if (Math.hypot(dx, dy) > 0.013) {
        addRipple(mx, my);
        smoothMouse.current = { x: mx, y: my };
      }
    }
    function onClick(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = 1 - (e.clientY - rect.top) / rect.height;
      for (let i = 0; i < 3; i++) setTimeout(() => addRipple(mx, my), i * 55);
    }
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("click",     onClick);

    // auto seed on load
    setTimeout(() => addRipple(0.5,  0.5),  300);
    setTimeout(() => addRipple(0.28, 0.38), 1100);
    setTimeout(() => addRipple(0.72, 0.62), 1900);

    function frame(ts: number) {
      if (!startRef.current) startRef.current = ts;
      const t = (ts - startRef.current) / 1000;

      const arr = ripplesRef.current;
      for (const r of arr) r.age += 0.016;
      while (arr.length && arr[0].age > 4.0) arr.shift();

      const posArr = new Float32Array(MAX * 2);
      const ageArr = new Float32Array(MAX);
      for (let i = 0; i < arr.length; i++) {
        posArr[i * 2]     = arr[i].x;
        posArr[i * 2 + 1] = arr[i].y;
        ageArr[i]         = arr[i].age;
      }

      const { res, time, rips, ages, count } = uRef.current;
      gl!.uniform2f(res,   canvas!.width, canvas!.height);
      gl!.uniform1f(time,  t);
      gl!.uniform2fv(rips, posArr);
      gl!.uniform1fv(ages, ageArr);
      gl!.uniform1i(count, arr.length);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);

      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("click",     onClick);
    };
  }, [active, canvasRef]);
}

// ─── Phase types ───────────────────────────────────────────────────────────
type Phase =
  | "idle"
  | "line-appear"
  | "text-reveal"
  | "line-fadeout"
  | "icon-appear"
  | "hold"
  | "fly-out"
  | "done";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Preloader ─────────────────────────────────────────────────────────────
export default function Preloader({ onComplete }: PreloaderProps) {
  const [phase, setPhase]     = useState<Phase>("idle");
  const [mounted, setMounted] = useState(true);
  const [bgFade, setBgFade]   = useState(false);
  const assemblyRef           = useRef<HTMLDivElement>(null);
  const iconRef               = useRef<HTMLDivElement>(null);
  const canvasRef             = useRef<HTMLCanvasElement>(null);

  const [flyTarget, setFlyTarget] = useState<{
    x: number; y: number; scale: number;
  } | null>(null);

  const iconProgress = useMotionValue(0);
  const iconSlotW    = useTransform(iconProgress, [0, 1], [0, PRE_ICON_SLOT_FULL]);
  const iconOpacity  = useTransform(iconProgress, [0, 0.15, 1], [0, 0, 1]);

  // mount WebGL canvas as soon as preloader is shown
  useRippleCanvas(canvasRef, mounted);

  useEffect(() => {
    const run = async () => {
      await wait(400);
      setPhase("line-appear");
      await wait(1800);

      setPhase("text-reveal");
      await wait(1600);

      setPhase("line-fadeout");
      await wait(700);

      setPhase("icon-appear");
      iconProgress.set(0);
      animate(iconProgress, 1, { duration: 2.0, ease: [0.22, 1, 0.36, 1] });

      requestAnimationFrame(() => {
        if (iconRef.current) {
          gsap.fromTo(
            iconRef.current,
            { scale: 0.7, filter: "blur(16px)", transformOrigin: "center center" },
            { scale: 1,   filter: "blur(0px)",  duration: 2.0, ease: "power3.out" }
          );
        }
      });

      await wait(2400);
      setPhase("hold");
      await wait(600);

      const headerEl   = document.getElementById("header-logo-inner");
      const assemblyEl = assemblyRef.current;
      if (headerEl && assemblyEl) {
        const hRect = headerEl.getBoundingClientRect();
        const aRect = assemblyEl.getBoundingClientRect();
        setFlyTarget({
          x:     (hRect.left + hRect.width  / 2) - (aRect.left + aRect.width  / 2),
          y:     (hRect.top  + hRect.height / 2) - (aRect.top  + aRect.height / 2),
          scale: hRect.width / aRect.width,
        });
      }

      setPhase("fly-out");
      await wait(700);

      onComplete?.();
      setBgFade(true);
      await wait(800);

      setPhase("done");
      setMounted(false);
    };

    run();
  }, [onComplete]);

  useEffect(() => {
    return () => { if (iconRef.current) gsap.killTweensOf(iconRef.current); };
  }, []);

  if (!mounted) return null;

  const showLine   = ["line-appear", "text-reveal", "line-fadeout"].includes(phase);
  const lineFading = phase === "line-fadeout";
  const showText   = !["idle", "line-appear"].includes(phase);
  const iconActive = ["icon-appear", "hold", "fly-out", "done"].includes(phase);
  const isFlyOut   = phase === "fly-out" || phase === "done";

  return (
    <motion.div
      animate={bgFade ? { opacity: 0 } : { opacity: 1 }}
      transition={bgFade ? { duration: 0.75, ease: "easeInOut" } : undefined}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        pointerEvents: isFlyOut ? "none" : "auto",
        // no backgroundColor — canvas fills the bg
      }}
    >
      {/* ── WebGL ripple canvas ── */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          display: "block",
        }}
      />

      {/* ── VERTICAL LINE ── */}
      <AnimatePresence>
        {showLine && (
          <motion.div
            key="vline"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              left: "50%", top: "45%",
              transform: "translateX(-50%)",
              width: "1px", height: "10%",
              transformOrigin: "center center",
              pointerEvents: "none",
              overflow: "hidden",
              zIndex: 2,
            }}
          >
            <motion.div
              initial={{ clipPath: "inset(0% 0 0% 0)" }}
              animate={lineFading
                ? { clipPath: "inset(100% 0 0% 0)" }
                : { clipPath: "inset(0% 0 0% 0)" }}
              transition={{ duration: 0.45, ease: "easeIn" }}
              style={{
                width: "100%", height: "100%",
                background: "linear-gradient(180deg, transparent 0%, #F4EEDF 20%, #F4EEDF 80%, transparent 100%)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ASSEMBLED LOGO ── */}
      <motion.div
        ref={assemblyRef}
        animate={
          isFlyOut && flyTarget
            ? { x: flyTarget.x, y: flyTarget.y, scale: flyTarget.scale }
            : { x: 0, y: 0, scale: 1 }
        }
        transition={isFlyOut ? { duration: 0.85, ease: [0.76, 0, 0.24, 1] } : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          transformOrigin: "center center",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* LEFT word slot */}
        <div
          style={{
            width: PRE_WORD_BOX + PRE_GAP,
            flexShrink: 0,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <motion.span
            initial={{ x: PRE_WORD_BOX + PRE_GAP }}
            animate={showText
              ? { x: -(PRE_GAP + LINE_TEXT_GAP) }
              : { x: PRE_WORD_BOX + PRE_GAP }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: LOGO_FONT_FAMILY,
              fontWeight: LOGO_FONT_WEIGHT,
              fontSize: PRE_FONT_SIZE,
              color: LOGO_COLOR,
              letterSpacing: LOGO_LETTER_SPC,
              userSelect: "none",
              whiteSpace: "nowrap",
              display: "inline-block",
              lineHeight: 1,
            }}
          >
            GRAND
          </motion.span>
        </div>

        {/* ICON slot */}
        <motion.div
          style={{
            width: iconSlotW,
            flexShrink: 0,
            overflow: "visible",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            visibility: iconActive ? "visible" : "hidden",
          }}
        >
          <motion.div
            style={{
              opacity: iconOpacity,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div ref={iconRef}>
              <IconMark />
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT word slot */}
        <div
          style={{
            width: PRE_WORD_BOX + PRE_GAP,
            flexShrink: 0,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <motion.span
            initial={{ x: -(PRE_WORD_BOX + PRE_GAP) }}
            animate={showText
              ? { x: PRE_GAP + LINE_TEXT_GAP }
              : { x: -(PRE_WORD_BOX + PRE_GAP) }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: LOGO_FONT_FAMILY,
              fontWeight: LOGO_FONT_WEIGHT,
              fontSize: PRE_FONT_SIZE,
              color: LOGO_COLOR,
              letterSpacing: LOGO_LETTER_SPC,
              userSelect: "none",
              whiteSpace: "nowrap",
              display: "inline-block",
              lineHeight: 1,
            }}
          >
            POOLS
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  );
}
