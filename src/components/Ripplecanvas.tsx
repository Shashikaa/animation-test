"use client";
import { useEffect, useRef } from "react";

// ─── Shaders ────────────────────────────────────────────────────────────────

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

  /*
   * Organic, non-circular ripple.
   * The wave front is stretched horizontally (xScale) and slightly
   * rotated over time so it never looks like a perfect ring.
   * Two overlapping sine harmonics give it an uneven, water-like contour.
   */
  float ripple(vec2 uv, vec2 center, float age) {
    vec2  delta  = uv - center;

    // Stretch + gentle drift — more horizontal than vertical, like a real pool
    float xScale = 1.35 + 0.12 * sin(age * 0.9);
    float yScale = 0.78 + 0.08 * cos(age * 1.1);
    // Slow rotation so the ellipse tumbles slightly
    float ang    = age * 0.18;
    float ca = cos(ang), sa = sin(ang);
    vec2  rd = vec2(delta.x * ca - delta.y * sa,
                   delta.x * sa + delta.y * ca);
    float d  = length(vec2(rd.x / xScale, rd.y / yScale));

    float front    = age * 0.32;
    float width    = 0.065 + age * 0.030;
    float envelope = exp(-pow((d - front) / width, 2.0));

    // Two harmonics → uneven crest spacing
    float wave  = sin((d - front) * 36.0 - age * 2.6) * 0.75
                + sin((d - front) * 19.0 - age * 1.4) * 0.25;

    // Azimuthal modulation: makes parts of the ring stronger/weaker
    float theta  = atan(delta.y, delta.x);
    float angMod = 1.0 + 0.22 * sin(theta * 2.5 + age * 0.7)
                       + 0.10 * cos(theta * 4.0 - age * 1.1);

    float fade = exp(-age * 1.25);
    return envelope * wave * angMod * fade * 0.015;
  }

  vec3 deepWater(vec2 uv, float t) {
    float nx = sin(uv.x * 3.1 + t * 0.22) * 0.5 + 0.5;
    float ny = cos(uv.y * 2.7 + t * 0.18) * 0.5 + 0.5;
    float nz = sin((uv.x + uv.y) * 2.0 + t * 0.14) * 0.5 + 0.5;
    float n  = (nx + ny + nz) / 3.0;
    // Grand Pools teal palette
    vec3 deep  = vec3(0.068, 0.198, 0.192);
    vec3 mid   = vec3(0.088, 0.248, 0.236);
    vec3 light = vec3(0.112, 0.298, 0.278);
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

    // Gentle ambient surface movement
    float base = sin(uvA.x * 5.1 + u_time * 0.19) * 0.002
               + cos(uvA.y * 4.3 + u_time * 0.15) * 0.002
               + sin((uvA.x + uvA.y) * 3.7 + u_time * 0.12) * 0.0015;

    // Horizontal displacement slightly stronger — matches pool surface refraction
    vec2 dUV = uv + vec2(disp * 1.15 + base, disp * 0.55 + base * 0.55);
    vec3 col = deepWater(dUV, u_time);

    float spec = pow(max(0.0, disp * 12.0 + base * 4.0), 2.5) * 0.18;
    col += vec3(spec * 0.50, spec * 0.82, spec * 0.78);

    float vign = 1.0 - smoothstep(0.25, 1.1, length((uv - 0.5) * vec2(aspect, 1.0)));
    col *= 0.78 + 0.22 * vign;

    gl_FragColor = vec4(col, 1.0);
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RippleCanvasProps {
  className?: string;
  style?: React.CSSProperties;
  interactive?: boolean;
  seedRipples?: [number, number, number][];
  moveThreshold?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RippleCanvas({
  className,
  style,
  interactive = true,
  seedRipples = [
    [0.5,  0.5,  300],
    [0.28, 0.38, 1100],
    [0.72, 0.62, 1900],
  ],
  moveThreshold = 0.013,
}: RippleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas: HTMLCanvasElement = canvasRef.current;

    const glRaw = canvas.getContext("webgl", { alpha: false, antialias: true });
    if (!glRaw) return;
    const gl: WebGLRenderingContext = glRaw;

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

    const u = {
      res:   gl.getUniformLocation(prog, "u_res"),
      time:  gl.getUniformLocation(prog, "u_time"),
      rips:  gl.getUniformLocation(prog, "u_ripples"),
      ages:  gl.getUniformLocation(prog, "u_ages"),
      count: gl.getUniformLocation(prog, "u_count"),
    };

    const MAX = 12;
    const ripples: { x: number; y: number; age: number }[] = [];
    const smoothMouse = { x: 0.5, y: 0.5 };
    let startTime: number | null = null;
    let raf = 0;

    function addRipple(x: number, y: number) {
      if (ripples.length >= MAX) ripples.shift();
      ripples.push({ x, y, age: 0 });
    }

    (canvas as any).__addRipple = addRipple;

    function resize() {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      canvas.width  = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function onMove(e: MouseEvent) {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = 1 - (e.clientY - rect.top) / rect.height;
      const dx = mx - smoothMouse.x;
      const dy = my - smoothMouse.y;
      if (Math.hypot(dx, dy) > moveThreshold) {
        addRipple(mx, my);
        smoothMouse.x = mx;
        smoothMouse.y = my;
      }
    }
    function onClick(e: MouseEvent) {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = 1 - (e.clientY - rect.top) / rect.height;
      for (let i = 0; i < 3; i++) setTimeout(() => addRipple(mx, my), i * 55);
    }
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("click",     onClick);

    const seedTimers = seedRipples.map(([x, y, delay]) =>
      setTimeout(() => addRipple(x, y), delay)
    );

    function frame(ts: number) {
      if (!startTime) startTime = ts;
      const t = (ts - startTime) / 1000;

      for (const r of ripples) r.age += 0.016;
      while (ripples.length && ripples[0].age > 4.0) ripples.shift();

      const posArr = new Float32Array(MAX * 2);
      const ageArr = new Float32Array(MAX);
      for (let i = 0; i < ripples.length; i++) {
        posArr[i * 2]     = ripples[i].x;
        posArr[i * 2 + 1] = ripples[i].y;
        ageArr[i]         = ripples[i].age;
      }

      gl.uniform2f(u.res,   canvas.width, canvas.height);
      gl.uniform1f(u.time,  t);
      gl.uniform2fv(u.rips, posArr);
      gl.uniform1fv(u.ages, ageArr);
      gl.uniform1i(u.count, ripples.length);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("click",     onClick);
      seedTimers.forEach(clearTimeout);
      delete (canvas as any).__addRipple;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive, moveThreshold]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        ...style,
      }}
    />
  );
}

// ─── useRippleCanvas hook ─────────────────────────────────────────────────────

export function useRippleCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  opts: Omit<RippleCanvasProps, "className" | "style"> = {}
) {
  const {
    interactive   = true,
    seedRipples   = [[0.5, 0.5, 300], [0.28, 0.38, 1100], [0.72, 0.62, 1900]],
    moveThreshold = 0.013,
  } = opts;

  const triggerRef = useRef<((x: number, y: number) => void) | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas: HTMLCanvasElement = canvasRef.current;

    const glRaw = canvas.getContext("webgl", { alpha: false, antialias: true });
    if (!glRaw) return;
    const gl: WebGLRenderingContext = glRaw;

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

    const u = {
      res:   gl.getUniformLocation(prog, "u_res"),
      time:  gl.getUniformLocation(prog, "u_time"),
      rips:  gl.getUniformLocation(prog, "u_ripples"),
      ages:  gl.getUniformLocation(prog, "u_ages"),
      count: gl.getUniformLocation(prog, "u_count"),
    };

    const MAX = 12;
    const ripples: { x: number; y: number; age: number }[] = [];
    const smoothMouse = { x: 0.5, y: 0.5 };
    let startTime: number | null = null;
    let raf = 0;

    function addRipple(x: number, y: number) {
      if (ripples.length >= MAX) ripples.shift();
      ripples.push({ x, y, age: 0 });
    }
    triggerRef.current = addRipple;

    function resize() {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      canvas.width  = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function onMove(e: MouseEvent) {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = 1 - (e.clientY - rect.top) / rect.height;
      const dx = mx - smoothMouse.x;
      const dy = my - smoothMouse.y;
      if (Math.hypot(dx, dy) > moveThreshold) {
        addRipple(mx, my);
        smoothMouse.x = mx;
        smoothMouse.y = my;
      }
    }
    function onClick(e: MouseEvent) {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = 1 - (e.clientY - rect.top) / rect.height;
      for (let i = 0; i < 3; i++) setTimeout(() => addRipple(mx, my), i * 55);
    }
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("click",     onClick);

    const seedTimers = seedRipples.map(([x, y, delay]) =>
      setTimeout(() => addRipple(x, y), delay)
    );

    function frame(ts: number) {
      if (!startTime) startTime = ts;
      const t = (ts - startTime) / 1000;

      for (const r of ripples) r.age += 0.016;
      while (ripples.length && ripples[0].age > 4.0) ripples.shift();

      const posArr = new Float32Array(MAX * 2);
      const ageArr = new Float32Array(MAX);
      for (let i = 0; i < ripples.length; i++) {
        posArr[i * 2]     = ripples[i].x;
        posArr[i * 2 + 1] = ripples[i].y;
        ageArr[i]         = ripples[i].age;
      }

      gl.uniform2f(u.res,   canvas.width, canvas.height);
      gl.uniform1f(u.time,  t);
      gl.uniform2fv(u.rips, posArr);
      gl.uniform1fv(u.ages, ageArr);
      gl.uniform1i(u.count, ripples.length);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("click",     onClick);
      seedTimers.forEach(clearTimeout);
      triggerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive, moveThreshold]);

  return (x: number, y: number) => triggerRef.current?.(x, y);
}