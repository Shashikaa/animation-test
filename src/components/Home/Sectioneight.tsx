"use client";

import { useRef, useState, useEffect } from "react";
import WaterBackground from "../Ripplecanvas";

export default function SectionEight() {
  const sectionRef   = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const personRef    = useRef<HTMLDivElement>(null);

  const [offscreen, setOffscreen] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOffscreen(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let mx = 0, my = 0;
    let pX = 0, pY = 0;
    let rafId: number;
    let running = false;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMouseMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mx = (e.clientX - r.left)  / r.width  - 0.5;
      my = (e.clientY - r.top)   / r.height - 0.5;
      if (!running) { running = true; rafId = requestAnimationFrame(tick); }
    };

    const onMouseLeave = () => { mx = 0; my = 0; };

    const tick = () => {
      pX = lerp(pX, mx * 28, 0.08);
      pY = lerp(pY, my * 16, 0.08);

      if (personRef.current) {
        personRef.current.style.transform = `translate(${pX}px, ${pY}px)`;
      }

      const settled =
        Math.abs(pX - mx * 28) < 0.05 &&
        Math.abs(pY - my * 16) < 0.05;

      if (settled) { running = false; }
      else { rafId = requestAnimationFrame(tick); }
    };

    el.addEventListener("mousemove",  onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);
    return () => {
      el.removeEventListener("mousemove",  onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative w-full h-full overflow-hidden"
      style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
    >
      <div ref={containerRef} className="absolute inset-0" style={{ overflow: "hidden" }}>

        {/* ══ LEFT panel ══════════════════════════════════════════════ */}
        <div
          className="s8-panel-left absolute inset-0"
          style={{ clipPath: "inset(0% 50% 0% 0%)" }}
        >
          {/* s8-bg-img — no inline top offset, GSAP owns the transform */}
          <div
            className="s8-bg-img absolute bg-cover bg-center"
            style={{
              backgroundImage: "url('/Forest.webp')",
              top:    0,
              left:   0,
              width:  "100%",
              height: "120%",
              willChange: "transform",
            }}
          />

          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(94.35deg, #162D24 -1.26%, #094146 100%)",
              opacity: 0.10,
            }}
          />

          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{ background: "#0000007A" }}
          />

          <div className="absolute inset-0 z-10">
            <WaterBackground paused={offscreen} />
          </div>

          {/* Person — only this moves with mouse */}
          <div
            ref={personRef}
            className="absolute z-20"
            style={{
              bottom:        -20,
              left:          "-2%",
              width:         "75%",
              height:        "100%",
              willChange:    "transform",
              pointerEvents: "none",
            }}
          >
            <img
              src="/person.png"
              alt=""
              style={{
                width:          "100%",
                height:         "100%",
                objectFit:      "contain",
                objectPosition: "bottom left",
                mixBlendMode:   "screen",
                display:        "block",
                transform:      "scaleX(-1)",
                opacity:        0.9,
              }}
            />
          </div>
        </div>

        {/* ══ RIGHT panel ═════════════════════════════════════════════ */}
        <div
          className="s8-panel-right absolute inset-0"
          style={{ clipPath: "inset(0% 0% 0% 50%)" }}
        >
          {/* s8-bg-img — same class, animates in sync with left panel */}
          <div
            className="s8-bg-img absolute bg-cover bg-center"
            style={{
              backgroundImage: "url('/Forest.webp')",
              top:    0,
              left:   0,
              width:  "100%",
              height: "120%",
              willChange: "transform",
            }}
          />

          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(94.35deg, #162D24 -1.26%, #094146 100%)",
              opacity: 0.10,
            }}
          />

          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{ background: "#0000007A" }}
          />

          <div className="absolute inset-0 z-10">
            <WaterBackground paused={offscreen} />
          </div>

          {/* Text — static, no movement */}
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              right:          "2rem",
              top:            0,
              height:         "100%",
              width:          "100%",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "flex-end",
              paddingRight:   "4rem",
            }}
          >
            <div className="flex flex-col gap-5">
              <h2 className="s8-heading text-[#F4EEDF] font-display">
                Water as Sanctuary.
              </h2>
              <p className="s8-para text-[#F4EEDF] max-w-[300px] font-body">
                Designed to disappear into the landscape, not announce itself.
                The result isn't a pool. It's a quiet room you walk outside to find.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}