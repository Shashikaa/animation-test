"use client";

import { useRef, useState, useEffect } from "react";
import WaveCanvas from "../WaveCanvas"; 
import { SectionOneData } from "../../app/services/[slug]/data";

type SubServiceSectionOneProps = {
  data: SectionOneData;
};

export default function SubServiceSectionOne({ data }: SubServiceSectionOneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [offscreen, setOffscreen] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const { IntersectionObserver } = window;
    if (!IntersectionObserver) return;
    
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
      className="s10-section relative w-full h-screen overflow-hidden bg-[#0a0a0a]"
    >
      {/* ── Background WebGL Layer with Dark Overlay ── */}
{/* ── Background WebGL Layer (Desktop) / Static Image Layer (Mobile & Tablet) ── */}
<div className="absolute inset-0 z-[1] pointer-events-auto w-full h-full mix-blend-normal">
  {/* Show WebGL canvas only on desktop (large screens and up) */}
  <div className="hidden lg:block w-full h-full">
    <WaveCanvas imageSrc="/pool-dark-bg.webp" />
  </div>

  {/* Show static background image on mobile and tablet (hidden on desktop) */}
  <div className="block lg:hidden w-full h-full">
    <img 
      src="/pool-dark-bg.webp" 
      alt="Background" 
      className="w-full h-full object-cover"
    />
  </div>
</div>

      {/* ── Foreground Layout Grid ── */}
      <div className="s10-content-initial section-container relative z-10 w-full h-full flex flex-col justify-between max-lg:justify-start max-lg:gap-4 !pt-[100px] lg:!pt-[18vh] pb-[10vh]">
        
        {/* ── TOP: Description Paragraph ── */}
        <div className="w-full s10-top-text-row max-lg:order-2 max-lg:mt-2 !mt-[100px] lg:!mt-[0]">
          <p className="s10-para-top font-body text-[#F4EEDF] pointer-events-none text-sm lg:text-base max-w-[420px]">
            {data.paragraph}
          </p>
        </div>

        {/* ── BOTTOM: Title Row ── */}
        <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 s10-bottom-controls-row max-lg:order-1">
          <h2
            className="s10-title font-[100] text-[#F4EEDF] pointer-events-none whitespace-pre-line"
            style={{
              fontFamily: "var(--font-display)",
              lineHeight: "1.2",
            }}
          >
            {data.title}
          </h2> 

          {/* Spacer block hidden on mobile and tablet layout */}
          <div className="hidden lg:block w-full lg:w-[clamp(450px,40vw,650px)] lg:h-[clamp(300px,28vh,420px)] invisible pointer-events-none"></div>
        </div>

      </div>

      {/* ── THE REAL IMAGE LAYER ── */}
      <div className="s10-img-absolute-container absolute right-[4vw] lg:right-[8vw] bottom-[10vh] z-[11] overflow-hidden w-[calc(100vw-8vw)] lg:w-[clamp(450px,40vw,650px)] h-[220px] sm:h-[320px] lg:h-[clamp(300px,28vh,420px)] origin-bottom-right">
        {/* The Image */}
        <img
          src={data.sideImageUrl} 
          alt={data.title}
          className="s10-img-element w-full   h-full object-cover origin-center relative z-10"
        />
        {/* Image Specific Dark Overlay */}
        <div className="absolute inset-0 bg-black/20 z-20 pointer-events-none mix-blend-multiply" />
      </div>

      {/* ── Overlaid 4 Sequential Paragraphs Layer ── */}
      <div className="s10-seq-container absolute left-0 top-[100vh] w-full z-20 pointer-events-none section-container flex flex-col gap-[250px] pb-[15vh]">
        
        {/* FRAME 1: Left Aligned everywhere */}
        <div className="s10-seq-p s10-seq-p-1 w-full flex justify-start text-left">
          <p className="font-body text-[#F4EEDF] text-base lg:text-lg max-w-[300px] leading-relaxed drop-shadow-lg">
            {data.fourParagraphs?.[0]}
          </p>
        </div>

        {/* FRAME 2: Right Aligned on Mobile/Tab, Left Aligned on Desktop */}
        <div className="s10-seq-p s10-seq-p-2 w-full flex justify-end lg:justify-start text-right lg:text-left lg:!pl-[10%]">
          <p className="font-body text-[#F4EEDF] text-base lg:text-lg max-w-[300px] leading-relaxed drop-shadow-lg">
            {data.fourParagraphs?.[1]}
          </p>
        </div>

        {/* FRAME 3: Left Aligned on Mobile/Tab, Right Aligned on Desktop */}
        <div className="s10-seq-p s10-seq-p-3 w-full flex justify-start lg:justify-end text-left lg:text-right">
          <p className="font-body text-[#F4EEDF] text-base lg:text-lg max-w-[300px] leading-relaxed drop-shadow-lg">
            {data.fourParagraphs?.[2]}
          </p>
        </div>

        {/* FRAME 4: Right Aligned on Mobile/Tab, Center Aligned on Desktop */}
        <div className="s10-seq-p s10-seq-p-4 w-full flex justify-end lg:justify-center text-right">
          <p className="font-body text-[#F4EEDF] text-base lg:text-lg max-w-[300px] leading-relaxed drop-shadow-lg">
            {data.fourParagraphs?.[3]}
          </p>
        </div>

      </div>

      <style>{`
        @media (min-width: 1025px) {
          .s10-title { font-size: clamp(2.5rem, 4vw, 4.5rem); }
        }
        @media (max-width: 1024px) {
          .s10-title { font-size: 2.2rem; }
        }
        @media (min-width: 640px) and (max-width: 1024px) {
          .s10-title { font-size: 3rem; }
        }
      `}</style>
    </section>
  );
}