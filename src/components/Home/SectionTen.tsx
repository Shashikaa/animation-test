"use client";

import { useRef, useState, useEffect } from "react";
import WaveCanvas from "../WaveCanvas"; 

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
      className="relative w-full h-full "
      style={{ overflow: "visible" }}
    >
      {/* ── Background Layer 1: Static Image ── */}
      <div
        className="s10-static-bg absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/pool-dark-bg.webp')" }}
      />

      {/* ── Rising Layer Container ── */}
      {/* Moving the WaveCanvas inside here guarantees it matches the 120% height and any GSAP translations applied to .s10-bg-img */}
      <div
        className="s10-bg-img absolute left-0 w-full bg-cover bg-top"
        style={{
          backgroundImage: "url('/pool-new.webp')",
          top: 0,
          height: "120%",
          zIndex: 5,
          willChange: "transform",
        }}
      >
        {/* ── Background Layer 2: Wave Canvas synced perfectly inside the moving container ── */}
        <div className="absolute inset-0 z-[1] opacity-10 pointer-events-none w-full h-full">
          <WaveCanvas imageSrc="/pool-new.webp" />
        </div>
      </div>

      {/* ── FIRST STAGE ELEMENTS (FADES FIRST) ── */}
      <h2
        className="s10-title absolute !font-[100] text-[#FFFFFF] pointer-events-none"
        style={{
          fontFamily: "var(--font-display)",
          zIndex: 10,
        }}
      >
        Built for Quality
      </h2>

      <p
        className="s10-title-sub absolute font-body text-[#FFFFFF] pointer-events-none !mt-3"
        style={{ zIndex: 10 }}
      >
        Designed For You
      </p>

      <p
        className="s10-para-top absolute font-body text-[#FFFFFF] pointer-events-none"
        style={{
          textAlign: "left",
          zIndex: 10,
          willChange: "transform, opacity",
        }}
      >
        At Grand Pools, we create exceptional pools built
        for lasting enjoyment. Combining quality
        craftsmanship, durability, and innovation, we
        deliver beautiful, functional spaces.
      </p>

      {/* ── SECOND STAGE ELEMENTS ── */}
      <div
        className="s10-content-wrap absolute flex flex-col justify-center"
        style={{
          zIndex: 15,
          overflow: "visible",
          opacity: 0,
          willChange: "transform, opacity",
        }}
      >
        <p className="s10-card-para text-[#FFFFFF]">
          At Grand Pools, we focus on every detail to deliver exceptional results, combining innovative design, modern technologies, premium materials, and proven construction techniques. <br /><br />
          Our commitment to quality, durability, clear communication, and a seamless process ensures your pool is built to last and exceeds expectations.
        </p>
      </div>

      <div 
        className="s10-img-right-wrap absolute overflow-hidden z-1 lg:!z-50"
        style={{
          opacity: 0,
          willChange: "transform, opacity",
        }}
      >
        <img
          src="/Craftsmanship.webp" 
          alt="Grand Pools Craftsmanship"
          className="w-full h-full object-cover"
        />
      </div>

      {/* ── Layout Breakpoints ── */}
      <style>{`
        /* ════════════════════════════════════════
           DESKTOP  ≥ 1025px (STEADY ANCHOR BASES)
        ════════════════════════════════════════ */
        @media (min-width: 1025px) {
          .s10-title {
            top: clamp(180px, 25vh, 240px);
            left: clamp(40px, 6vw, 80px);
            font-size: clamp(48px, 5.5vw, 82px);
            max-width: 60%;
          }

          .s10-title-sub {
            top: clamp(280px, 37vh, 340px);
            left: clamp(40px, 6vw, 80px);
            font-size: 14px;
            letter-spacing: 0.15em;
          }

          .s10-para-top {
            bottom: clamp(180px, 25vh, 240px);
            right: clamp(40px, 6vw, 80px);
            max-width: 380px;
            font-size: 18px;
          }

          .s10-content-wrap {
            bottom: clamp(180px, 25vh, 240px); 
            left: clamp(40px, 6vw, 80px);
            width: 35vw;
            height: auto;
          }

          .s10-card-para {
            font-size: 16px;
          }

          .s10-img-right-wrap {
            bottom: clamp(180px, 25vh, 240px);
            right: clamp(40px, 6vw, 80px);
            width: 540px;
            height: 360px;
          }
        }

        /* ════════════════════════════════════════
           TABLET  768px – 1024px
        ════════════════════════════════════════ */
        @media (min-width: 768px) and (max-width: 1024px) {
          .s10-title {
            top: 100px;
            left: 40px;
            font-size: 46px;
          }

          .s10-title-sub {
            top: 160px;
            left: 40px;
            font-size: 13px;
          }

          .s10-para-top {
            top: 220px;
            left: 40px;
            max-width: 80%;
            font-size: 16px;
          }

          .s10-content-wrap {
            bottom: 120px;
            left: 40px;
            width: 45%;
          }

          .s10-img-right-wrap {
            bottom: 120px;
            right: 40px;
            width: 44%;
            height: 300px;
          }

          .s10-card-para {
            font-size: 15px;
          }
        }

        /* ════════════════════════════════════════
           MOBILE  < 768px
        ════════════════════════════════════════ */
        @media (max-width: 767px) {
          .s10-title {
            top: 60px;
            left: 20px;
            font-size: 32px;
          }

          .s10-title-sub {
            top: 105px;
            left: 20px;
            font-size: 11px;
          }

          .s10-para-top {
            top: 140px;
            left: 20px;
            right: 20px;
            font-size: 14px;
          }

          .s10-content-wrap {
            bottom: 250px;
            left: 20px;
            right: 20px;
          }

          .s10-img-right-wrap {
            bottom: 40px;
            left: 20px;
            right: 20px;
            height: 190px;
          }

          .s10-card-para {
            font-size: 13px;
          }
        }
      `}</style>
    </section>
  );
}