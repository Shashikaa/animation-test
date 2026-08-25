"use client";

import Link from "next/link";
import FAQAccordion, { FAQItem } from "../FAQAccordion";

export interface SectionTwoData {
  title: string;
  bgImageUrl: string;
  faqs: FAQItem[];
}

interface FAQSectionProps {
  data: SectionTwoData;
}

export default function SubServiceFAQSection({ data }: FAQSectionProps) {
  // Guard access safely just like the tab indexing fallback in hero pattern
  const faqItems = data?.faqs || [];

  return (
    <div className="w-full h-full relative overflow-hidden !bg-black flex items-stretch justify-center">
      
      {/* BACKGROUND IMAGE LAYER */}
      <img
        src="/placeholder.webp" 
        alt="Grand Pools background scenery"
        className="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none"
      />
      
      {/* Main Container */}
      <div className="faq-content section-container relative z-20 w-full min-h-screen h-full flex flex-col lg:flex-row justify-center lg:justify-between gap-4 md:gap-8 pb-12 lg:pb-24">
        
        {/* LEFT SIDE */}
        <div className="flex flex-col select-none justify-center pt-2 md:!pt-24 lg:!pt-32">
          <h2
            className="!text-[#F4EEDF] font-display !font-[100] max-w-[650px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {data.title}
          </h2>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:max-w-full lg:!max-w-[590px] flex flex-col justify-start lg:justify-center lg:self-center py-2 md:py-6">
          <FAQAccordion items={faqItems} />
        </div>

        {/* Contact Us Button - Relative in flow for mobile (with mt-10 gap), Absolute for Desktop */}
        <div className="!mt-14 mb-6 lg:m-0 lg:absolute lg:bottom-16 lg:left-auto lg:right-18 z-30">
          <Link
            href="/contact"
            className="group btn-underline font-body"
          >
            CONTACT US
          </Link>
        </div>

      </div>
    </div>
  );
}