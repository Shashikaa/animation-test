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
      className="relative w-full h-full bg-[#0a0f0c]"
      style={{
        // overflow must be visible on mobile so the video element can sit
        // below the section boundary (y-translated by GSAP) and scroll
        // naturally upward into view without being clipped.
        // The outer pin-all container handles overall clipping.
        overflow: "visible",
      }}
    >
      {/* ── Base dark background ── */}
      <div
        className="s10-static-bg absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/pool-dark-bg.webp')" }}
      />

      <WaterBackground paused={offscreen} />

      {/* ── Rising outdoor bg image ── */}
      <div
        className="s10-bg-img absolute left-0 w-full bg-cover bg-top"
        style={{
          backgroundImage: "url('/pool-new.webp')",
          top:        0,
          height:     "120%",
          zIndex:     5,
          willChange: "transform",
        }}
      />

      {/* ══════════════════════════════════════════
          TITLE — top-left always
      ══════════════════════════════════════════ */}
      <h2
        className="s10-title absolute !font-[100] text-[#FFFFFF] pointer-events-none"
        style={{
          fontFamily: "var(--font-display)",
          zIndex:     10,
        }}
      >
        Built For Quality
      </h2>

      {/* ══════════════════════════════════════════
          SUBTITLE
      ══════════════════════════════════════════ */}
      <p
        className="s10-title-sub absolute font-body text-[#FFFFFF] uppercase pointer-events-none"
        style={{ zIndex: 10 }}
      >
        Designed For You
      </p>

      {/* ══════════════════════════════════════════
          PARA
      ══════════════════════════════════════════ */}
      <p
        className="s10-para-top absolute font-body text-[#FFFFFF] pointer-events-none"
        style={{
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
          CARD — gradient box with text inside
          Desktop: bottom-left, 42vw × 417px
          Tablet/Mobile:  bottom-left, ~80% wide
                   clip-path starts inset(100% 0% 0% 0%)
                   — GSAP reveals bottom→top
      ══════════════════════════════════════════ */}
      <div
        className="s10-card absolute flex flex-col"
        style={{
          background:     "linear-gradient(106.31deg, #19211C 0.85%, #094146 99.15%)",
          clipPath:       "inset(100% 0% 0% 0%)",
          zIndex:         15,
          overflow:       "visible",
          justifyContent: "center",
        }}
      >
        <div
          className="s10-card-body"
          style={{ clipPath: "inset(100% 0% 0% 0%)" }}
        >
          <p className="s10-card-para text-[#FFFFFF] leading-relaxed">
            At Grand Pools, we focus on every detail to deliver exceptional results, combining innovative design, modern technologies, premium materials, and proven construction techniques.   <br /><br />
            Our commitment to quality, durability, clear communication, and a seamless process ensures your pool is built to last and exceeds expectations.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          VIDEO
          Desktop: beside card (left: calc(42vw + 100px))
          Tablet/Mobile:  sits above card. GSAP starts it below
                   its CSS slot via y translation and scrolls
                   it upward naturally — no clipPath on entry.
                   Exits via clipPath wipe after card reveals.
      ══════════════════════════════════════════ */}
      <div
        className="s10-video-wrap absolute overflow-hidden z-1 lg:!z-50"
        style={{
        
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

      {/* ── Responsive layout ── */}
      <style>{`

        /* ════════════════════════════════════════
           DESKTOP  ≥ 1025px  — original, untouched
        ════════════════════════════════════════ */
        @media (min-width: 1025px) {

          .s10-title {
            top:       clamp(280px, 42vh, 300px);
            left:      clamp(40px, 5vw, 80px);
            max-width: 64%;
          }

          .s10-title-sub {
            top:  clamp(380px, 60vh, 400px);
            left: clamp(40px, 5vw, 80px);
          }

          .s10-para-top {
            bottom:    clamp(48px, 8vh, 100px);
            right:     clamp(40px, 5vw, 80px);
            left:      auto;
            top:       auto;
            max-width: 360px;
          }

          .s10-card {
            top:            calc(100% - 417px);
            left:           0;
            bottom:         auto;
            width:          42vw;
            height:         417px;
            padding-top:    clamp(28px, 3vw, 42px);
            padding-bottom: clamp(28px, 3vw, 42px);
            padding-left:   clamp(28px, 3vw, 42px);
            padding-right:  clamp(28px, 3vw, 42px);
          }

          .s10-card-para {
            font-size: 20px;
          }

          .s10-video-wrap {
            top:    calc(100% - 417px);
            left:   calc(42vw + 100px);
            bottom: auto;
            right:  auto;
            width:  clamp(280px, 28vw, 420px);
            height: 203px;
            /* Desktop: GSAP controls clipPath for reveal */
            clip-path: inset(100% 0% 0% 0%);
          }
        }

        /* ════════════════════════════════════════
           TABLET  768px – 1024px  — own independent layout
           (separate from mobile so each can be tuned on its own)

           Layout phases mirror mobile structurally:
           Title + subtitle top-left, para on the right,
           video centred, card pinned bottom full-width
           with clip-path reveal — but sizes/positions are
           tuned for tablet viewport widths.
        ════════════════════════════════════════ */
        @media (min-width: 768px) and (max-width: 1024px) {

          /* Title — top-left */
          .s10-title {
            top:       clamp(80px, 16vh, 140px);
            left:      40px;
            right:     auto;
            bottom:    auto;
            max-width: 60vw;
            font-size: clamp(36px, 6vw, 56px);
          }

          /* Subtitle — just below title */
          .s10-title-sub {
            top:       clamp(160px, 26vh, 210px);
            left:      40px;
            right:     auto;
            bottom:    auto;
            font-size: clamp(12px, 1.6vw, 15px);
          }

          /* Para — right side, vertically ~55% */
          .s10-para-top {
            top:       52%;
            right:     40px;
            left:      auto;
            bottom:    auto;
            max-width: 32vw;
            font-size: clamp(13px, 1.6vw, 16px);
            transform: translateY(-50%);
          }

          /*
           * VIDEO — centred in viewport.
           * GSAP pushes it below viewport on init, scrolls y→0 to land here.
           */
          .s10-video-wrap {
            top:       50%;
            right:     40px;
            left:      auto;
            transform: translateY(-50%);
            width:     46vw;
            height:    30vw;
            z-index:   12;
            overflow:  hidden;
          }

          /*
           * CARD — pinned to bottom, full width.
           * GSAP reveals via clipPath inset(100%→0%) bottom→up.
           */
          .s10-card {
            bottom:         0;
            left:           0px;
            top:            auto;
            transform:      none;
            width:          70%;
            height:         340px;
            min-height:     46vw;
            padding-top:    28px;
            padding-bottom: 28px;
            padding-left:   32px;
            padding-right:  32px;
          }

          .s10-card-para {
            font-size:   16px;
            line-height: 1.4;
          }
        }

        /* ════════════════════════════════════════
           MOBILE  < 768px  — original, untouched
        ════════════════════════════════════════ */
        @media (max-width: 767px) {

  /* Title — top-left */
  .s10-title {
    top:       clamp(80px, 18vh, 140px);
    left:      24px;
    right:     auto;
    bottom:    auto;
    max-width: 68vw;
    font-size: clamp(28px, 8vw, 48px);
  }

  /* Subtitle — just below title */
  .s10-title-sub {
    top:       clamp(128px, 28vh, 190px);
    left:      24px;
    right:     auto;
    bottom:    auto;
    font-size: clamp(10px, 3vw, 13px);
  }

  /* Para — right side, vertically ~55% */
  .s10-para-top {
    top:       55%;
    right:     20px;
    left:      auto;
    bottom:    auto;
    max-width: 46vw;
    font-size: clamp(11px, 3vw, 14px);
    transform: translateY(-50%);
  }

  /*
   * VIDEO — true VP centre.
   * GSAP pushes it below viewport on init, scrolls y→0 to land here.
   */
.s10-video-wrap {
  top:       70%;
  right:     20px;
  left:      auto;
  transform: translateY(-70%);
  width:     70vw;
  height:    45vw;
  z-index:   12;
  overflow:  hidden;
}

  /*
   * CARD — pinned to bottom, full width.
   * GSAP reveals via clipPath inset(100%→0%) bottom→up.
   * No transform centering — starts at bottom, GSAP scrolls it up later.
   */
  .s10-card {
    bottom:         0;
   
    top:            auto;
    transform:      none;
    width:          80%;
    height:         300px;
    min-height:     62vw;
    padding-top:    20px;
    padding-bottom: 20px;
    padding-left:   24px;
    padding-right:  24px;
  }

  .s10-card-para {
    font-size:   14px;
    line-height: 1.2;
  }
}
      `}</style>
    </section>
  );
}