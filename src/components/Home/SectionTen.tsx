"use client";

import { useRef, useState, useEffect } from "react";
import WaterBackground from "../Ripplecanvas";

export default function SectionTen() {
  const sectionRef = useRef<HTMLElement>(null);
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

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-full overflow-hidden bg-[#0a0f0c]"
    >

      {/* ── Base dark background ── */}
      <div
        className="s10-static-bg absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/pool-dark-bg.webp')" }}
      />

      <WaterBackground paused={offscreen} />

      {/* ── Rising outdoor bg image — GSAP owns transform via yPercent:20→0 ── */}
      <div
        className="s10-bg-img absolute left-0 w-full bg-cover bg-top"
        style={{
          backgroundImage: "url('/pool-new.webp')",
          top:    0,
          height: "120%",
          zIndex: 5,
          willChange: "transform",
        }}
      />

      {/* ══════════════════════════════════════════
          PHASE 1 — Title + para (fade in, then scroll away)
      ══════════════════════════════════════════ */}
      <h2
        className="s10-title absolute !font-[100] text-[#FFFFFF] pointer-events-none"
        style={{
          fontFamily: "var(--font-display)",
          top:      "clamp(280px, 42vh, 300px)",
          left:     "clamp(40px, 5vw, 80px)",
          maxWidth: "64%",
          zIndex:   10,
        }}
      >
        Built For Quality
      </h2>

      <p
        className="s10-title-sub absolute font-body text-[#FFFFFF] uppercase pointer-events-none"
        style={{
          top:   "clamp(380px, 60vh, 400px)",
          left:  "clamp(40px, 5vw, 80px)",
          zIndex: 10,
        }}
      >
        Designed For You
      </p>

      <p
        className="s10-para-top absolute font-body text-[#FFFFFF] pointer-events-none"
        style={{
          bottom:    "clamp(48px, 8vh, 100px)",
          right:     "clamp(40px, 5vw, 80px)",
          maxWidth:  "360px",
          textAlign: "left",
          zIndex:    10,
        }}
      >
        At Grand Pools, we create exceptional pools built
        for lasting enjoyment. Combining quality
        craftsmanship, durability, and innovation, we deliver
        beautiful, functional spaces.
      </p>

      {/* ══════════════════════════════════════════
          PHASE 2 — Gradient card
      ══════════════════════════════════════════ */}
      <div
        className="s10-card absolute flex flex-col"
        style={{
          top:        "calc(100% - 417px)",
          left:       0,
          width:      "42vw",
          height:     "417px",
          background: "linear-gradient(106.31deg, #19211C 0.85%, #094146 99.15%)",
          clipPath:   "inset(100% 0% 0% 0%)",
          zIndex:     15,
          overflow:   "visible",
          justifyContent:  "center",
          paddingTop:      "clamp(28px, 3vw, 42px)",
          paddingBottom:   "clamp(28px, 3vw, 42px)",
          paddingLeft:     "clamp(28px, 3vw, 42px)",
          paddingRight:    "clamp(28px, 3vw, 42px)",
        }}
      >
        <div
          className="s10-card-body"
          style={{ clipPath: "inset(100% 0% 0% 0%)" }}
        >
          <p className="s10-card-para text-[#FFFFFF] !text-[20px] leading-relaxed">
            At Grand Pools, we focus on every detail to deliver exceptional results, combining innovative design,
            modern technologies, premium materials, and proven construction techniques.   <br /><br />
            Our commitment to quality, durability, clear communication, and a seamless process ensures your
            pool is built to last and exceeds expectations.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          PHASE 3 — Video
      ══════════════════════════════════════════ */}
      <div
        className="s10-video-wrap absolute overflow-hidden"
        style={{
          top:      "calc(100% - 417px)",
          left:     "calc(42vw + 100px)",
          width:    "clamp(280px, 28vw, 420px)",
          height:   "203px",
          clipPath: "inset(0% 0% 100% 0%)",
          zIndex:   16,
        }}
      >
        <video
          src="/videos/Grand-Pools-Hero-Video.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

    </section>
  );
}