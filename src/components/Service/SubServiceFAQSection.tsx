"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import FAQAccordion, { FAQItem } from "../FAQAccordion";

export interface SectionTwoData {
  title: string;
  bgImageUrl?: string;
  faqs: FAQItem[];
}

interface FAQSectionProps {
  data: SectionTwoData;
}

export default function SubServiceFAQSection({ data }: FAQSectionProps) {
  const faqItems = data?.faqs || [];

  const sectionRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      if (!sectionRef.current || !bgImageRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight && rect.bottom > 0) {
        const totalDistance = windowHeight + rect.height;
        const currentDistance = windowHeight - rect.top;
        const scrollProgress = Math.min(Math.max(currentDistance / totalDistance, 0), 1);

        // Smoothly translate upward from 0% to -15% as section scrolls down
        const translateY = -scrollProgress * 15;

        // Use translate3d with scale and translateZ for jitter/flicker-free performance
        bgImageRef.current.style.transform = `translate3d(0, ${translateY.toFixed(2)}%, 0) scale(1.05)`;
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="w-full h-full relative overflow-hidden !bg-black flex items-stretch justify-center"
    >
      {/* PARALLAX BACKGROUND IMAGE LAYER */}
      <img
        ref={bgImageRef}
        src="/faq-bg.webp"
        alt="Grand Pools background scenery"
        className="absolute -top-[10%] left-0 w-full h-[135%] object-cover z-0 pointer-events-none transform-gpu will-change-transform backface-hidden"
        style={{ transform: "translate3d(0, 0%, 0) scale(1.05)" }}
        loading="lazy"
      />

      {/* Dark Overlay - Explicit GPU layer to eliminate repaint flickering */}
      <div className="absolute inset-0 bg-black/60 z-10 pointer-events-none transform-gpu backface-hidden" />

      {/* Main Container */}
      <div className="faq-content section-container relative z-20 w-full min-h-screen h-full flex flex-col lg:flex-row justify-center lg:justify-between gap-4 md:gap-8 pb-12 lg:pb-24">
        
        {/* LEFT SIDE */}
        <div className="flex flex-col select-none justify-center pt-2 md:!pt-24 lg:!pt-32">
          <h2
            className="!text-[#F4EEDF] font-display !font-[100] max-w-[650px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {data?.title}
          </h2>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:max-w-full lg:!max-w-[590px] flex flex-col justify-start lg:justify-center lg:self-center py-2 md:py-6">
          <FAQAccordion items={faqItems} />
        </div>

        {/* Contact Us Button */}
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