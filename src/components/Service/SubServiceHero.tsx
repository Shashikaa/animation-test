"use client";

import { useState } from "react";

export interface TabContent {
  label: string;
  type: 'paragraph' | 'points';
  content: string | string[];
}

export interface SubServiceHeroData {
  title: string;
  subtitle: string;
  bgImageUrl: string;
  tabs: TabContent[];
}

interface HeroProps {
  data: SubServiceHeroData;
  hideText?: boolean;
}

export default function SubServiceHero({ data, hideText = false }: HeroProps) {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const activeTab = data.tabs[activeTabIdx] || data.tabs[0];

  return (
    <div className="relative w-full h-full bg-[#142420]">
      
      {/* UNDERNEATH LAYER: Stationary multi-tab interaction stack */}
      <div className="absolute inset-0 w-full h-full flex flex-col justify-between p-12 lg:p-16 z-0 text-[#F4EEDF] pointer-events-auto">
        <div className="flex flex-col gap-4 text-left lg:absolute lg:top-32 lg:right-16 lg:w-[450px]">
          {data.tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTabIdx(idx)}
              className={`text-right font-light text-base md:text-lg lg:text-xl transition-all duration-300 pointer-events-auto cursor-pointer ${
                activeTabIdx === idx 
                  ? "text-[#F4EEDF] opacity-100 translate-x-2" 
                  : "text-[#F4EEDF]/40 hover:opacity-80"
              }`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bottom layout container - Holds only the dynamic tab text content */}
        <div className="w-full lg:max-w-[550px] flex flex-col sm:flex-row items-end justify-between gap-6 text-left lg:absolute lg:bottom-16 lg:right-0">
          <div className="w-full max-w-[420px] min-h-[140px]">
            {activeTab?.type === 'paragraph' ? (
              <p className="text-[#F4EEDF] text-sm md:text-base lg:text-lg leading-relaxed">
                {activeTab.content as string}
              </p>
            ) : (
              <ol className="space-y-3 w-full text-sm md:text-base text-[#fff] font-body list-none p-0 m-0">
                {(activeTab?.content as string[]).map((point, i) => (
                  <li key={i} className="flex items-baseline gap-2 leading-relaxed">
                    <span className="text-[#fff] font-body text-xs select-none shrink-0 min-w-[4px]">
                      {String(i + 1).padStart(2)}.
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>

      {/* TOP LAYER: Explicitly mapping h-[100dvh] and exact percentage styles to align with GSAP parser */}
      <div 
        className="services-hero-top-layer absolute inset-0 w-full h-[100dvh] overflow-hidden z-10 will-change-[clip-path]"
        style={{ 
          clipPath: "inset(0% 0% 0% 0%)",
          WebkitClipPath: "inset(0% 0% 0% 0%)"
        }}
      >
        <section className="relative w-full h-full bg-[#111]">
          <div
            className="service-hero-bg absolute left-0 w-screen bg-cover bg-center will-change-transform"
            style={{
              top: "0%",
              bottom: "0%",
              height: "100%",
              backgroundImage: `url('${data.bgImageUrl}')`,
              transform: "scale(1) translateZ(0)",
              backfaceVisibility: "hidden",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 z-[1]" />
          
          {!hideText && (
            <div className="hero-text-wrap section-container relative z-10 h-full flex flex-col justify-end !pb-22 will-change-[opacity,transform]">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 leading-normal w-full">
                
                {/* Title and Subtitle Block */}
                <div className="flex flex-col !gap-2 lg:!gap-6">
                  <h1
                    className="hero-title text-[#F4EEDF] !font-[100] max-w-[700px]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {data.title}
                  </h1>
                  <p className="hero-desc text-[#F4EEDF] !mt-1 max-w-[300px]">
                    {data.subtitle}
                  </p>
                </div>
                
                {/* Contact Us Button */}
                <a
                  href="/contact-us"
                  style={{
                    position: "relative",
                    display: "inline-block",
                    width: "fit-content",
                    paddingBottom: 4,
                    fontSize: 14,
                    fontWeight: 500,
                    textTransform: "uppercase",
                    color: "#F4EEDF",
                    textDecoration: "none",
                    flexShrink: 0,
                    marginLeft: 40,
                  }}
                  className="hero-btn group transition-opacity duration-200 hover:opacity-70 font-body"
                >
                  CONTACT US
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: 1,
                      background: "#F4EEDF",
                      transition: "transform 0.2s ease",
                    }}
                    className="group-hover:-translate-y-[2px]"
                  />
                </a>

              </div>
            </div>
          )}
        </section>
      </div>

    </div>
  );
}