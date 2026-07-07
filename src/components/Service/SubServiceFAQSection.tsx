"use client";

import { useState } from "react";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SectionTwoData {
  title: string;
  bgImageUrl: string;
  faqs: FAQItem[];
}

interface FAQSectionProps {
  data: SectionTwoData;
}

export default function SubServiceFAQSection({ data }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  // Guard access safely just like the tab indexing fallback in hero pattern
  const faqItems = data?.faqs || [];

  return (
    <div className="w-full h-full relative overflow-hidden !bg-black flex items-stretch justify-center">
      
      {/* BACKGROUND IMAGE LAYER */}
      <img
        src="/faqbg.webp" 
        alt="Grand Pools background scenery"
        className="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none"
      />
      
      {/* Main Container */}
      <div className="faq-content section-container relative z-20 w-full h-full flex flex-col lg:flex-row justify-center lg:justify-between gap-16 md:gap-8 pb-16 lg:pb-24">
        
        {/* LEFT SIDE */}
        <div className="flex flex-col select-none justify-start pt-12 md:!pt-24 lg:!pt-32">
          <h2
            className="!text-[#F4EEDF] font-display !font-[100] max-w-[650px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {data.title}
          </h2>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:max-w-full lg:max-w-[500px] flex flex-col justify-start lg:justify-center lg:self-center py-2 md:py-6">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="w-full !border-b !border-[#F4EEDF]"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full !py-5 flex items-center justify-between text-left group focus:outline-none !cursor-pointer"
                >
                  {/* Question Text */}
                  <span className="!text-[#F4EEDF] font-body !font-[400] !text-[16px] transition-opacity duration-300 group-hover:opacity-80">
                    {item.question}
                  </span>
                  
                  {/* Chevron Icon */}
                  <span className={`!text-[#F4EEDF] transition-transform duration-300 ml-4 transform ${isOpen ? "rotate-180" : "rotate-0"}`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.2"
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </button>

                {/* Animated Answer Container */}
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen 
                      ? "grid-rows-[1fr] opacity-100" 
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  {/* Inner element handles overflow and smooth internal padding expansion */}
                  <div className="overflow-hidden">
                    <div className="pb-6">
                      <p className="!text-[#F4EEDF] font-body !pb-3">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Us Button - Anchored to the exact bottom-right corner of the section block */}
        <div className="absolute bottom-12 left-6 md:left-10 lg:bottom-16 lg:left-auto lg:right-18 z-30">
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
    </div>
  );
}