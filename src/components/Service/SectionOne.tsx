"use client";

import { useRef } from "react";
import LiquidCanvas from "../LiquidCanvas"; // Adjust the import path as needed

export default function SectionOne() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden"
      style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
    >
      {/* 
        LiquidCanvas renders the image as a background fallback on mobile 
        and updates seamlessly to the WebGL canvas on desktop.
      */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <LiquidCanvas imageSrc="/Service1.webp" />
      </div>

      <div className="section-container relative z-[2] h-full flex flex-col justify-between pb-10 md:pb-14 lg:pb-16">
        
        {/* TOP CONTENT */}
        <div className="flex flex-col !mt-34 w-[450px]">
          <h2 className="s1-reveal-top font-display text-[#F4EEDF] leading-[1.2] !font-[100] reveal-text  w-sm lg:w-lg  ">
            Tailored Pool Solutions
          </h2>
          <p className="s1-reveal-top font-body text-[#F4EEDF] text-sm md:text-base !mt-4 lg:!mt-8 reveal-text">
            For Every Need
          </p>
        </div>

        {/* BOTTOM RIGHT CONTENT */}
        <div className="flex justify-end">
          <p className="s1-reveal-bottom reveal-text font-body text-[#F4EEDF] text-right max-w-[220px] md:max-w-[280px] lg:max-w-[280px] !mb-33 md:!mb-80 lg:!mb-20">
            From renovations to new builds, we deliver high-quality pools with expert craftsmanship and precision.
          </p>
        </div>
      </div>
    </section>
  );
}