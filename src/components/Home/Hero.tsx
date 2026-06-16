"use client";

import { useEffect, useState } from "react";

export default function Hero() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY < 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="hero relative w-full h-full overflow-hidden">

      {/* Background layer — same position/size as before (inset-0) */}
      <div className="hero-bg absolute inset-0 bg-cover bg-center bg-[url('/hero-mobile.webp')] md:bg-[url('/hero.webp')] will-change-transform" />

      {/* Overlay */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(107.8deg,rgba(25,33,28,0)_50.32%,rgba(25,33,28,0.72)_78.81%)] hidden md:block" />

      {/* Content */}
      <div className="section-continer relative z-10 h-full flex items-end justify-end !pb-[115px] !lg:pb-[85px]">
        <div>
          <p className="text-[#F4EEDF] font-body leading-[1.2] font-normal max-w-[330px] md:max-w-[400px] text-right">
            At Grand Pools, we create custom swimming pools that blend style,
            function, and quality. Every pool is designed to complement your
            outdoor space, adding value and elegance to your home or business.
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none transition-opacity duration-[400ms] ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="text-[#F4EEDF] text-[10px] font-light tracking-[0.2em] uppercase [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">
          Scroll
        </span>

        <div className="w-[22px] h-[34px] rounded-[11px] border-[1.5px] border-[rgba(244,238,223,0.9)] relative flex justify-center pt-[5px] shadow-[0_0_12px_rgba(0,0,0,0.5),inset_0_0_8px_rgba(0,0,0,0.2)] backdrop-blur-sm bg-black/15">
          <div className="w-[3px] h-[6px] rounded-[2px] bg-[#F4EEDF] [animation:scrollDot_1.6s_ease-in-out_infinite]" />
        </div>

        <style>{`
          @keyframes scrollDot {
            0%   { transform: translateY(0);    opacity: 1; }
            60%  { transform: translateY(10px); opacity: 0; }
            61%  { transform: translateY(0);    opacity: 0; }
            100% { transform: translateY(0);    opacity: 1; }
          }
        `}</style>
      </div>
    </section>
  );
}