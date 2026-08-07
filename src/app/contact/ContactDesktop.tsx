"use client";

import ContactHero from "@/src/components/contact/Hero";
import SectionOne from "@/src/components/contact/SectionOne";
import SectionCTA from "@/src/components/contact/SectionCTA";
import FAQSection from "@/src/components/contact/FAQSection";
import Footer from "@/src/components/Footer";
import { useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal";

gsap.registerPlugin(ScrollTrigger);

const isTouchOnly = () => ScrollTrigger.isTouch === 1;

const PX_PER_MAIN_PANEL = 1000;
const PX_PER_SUB_STEP = 600;
const PAUSE_PX = 350;

export default function ContactDesktop() {
  const scopeRef = useRef<HTMLDivElement>(null);

  // Single unified hook (Desktop mode by default)
  const { introDone } = useHeroIntro(scopeRef);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".cta-scroll-wrapper", { yPercent: 0, visibility: "visible", force3D: true });
      gsap.set(".section-one-scroll-wrapper", { visibility: "hidden", y: "100vh", force3D: true });
      gsap.set(".faq-scroll-wrapper", { visibility: "hidden", y: "100vh", force3D: true });
      gsap.set(".footer-scroll-wrapper", { visibility: "hidden", y: "100vh", force3D: true });

      gsap.set([".faq-content", ".cta-inner-desktop", ".cta-inner-mobile"], { opacity: 1, force3D: true });
      gsap.set(".contact-one-bg", { scale: 1, yPercent: 0, force3D: true });
      gsap.set(".contact-right-scroll-track", { y: 0, force3D: true });
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!introDone) return;

    if (isTouchOnly()) {
      ScrollTrigger.normalizeScroll(true);
    }

    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(500, 33);

      const performanceTargets = [
        ".contact-hero-master",
        ".contact-hero-bg",
        ".cta-scroll-wrapper",
        ".section-one-scroll-wrapper",
        ".contact-one-bg",
        ".contact-right-scroll-track",
        ".faq-scroll-wrapper",
        ".faq-content",
        ".footer-scroll-wrapper",
      ];

      performanceTargets.forEach((selector) => {
        gsap.set(selector, {
          force3D: true,
          willChange: "transform, opacity",
        });
      });

      useTextReveal(scopeRef, ".faq-scroll-wrapper .reveal-text");

      gsap.set(".faq-scroll-wrapper .reveal-text", { visibility: "visible", opacity: 1 });
      gsap.set([
        ".faq-scroll-wrapper .gs-line-inner",
        ".faq-scroll-wrapper .custom-line-inner",
        ".faq-scroll-wrapper .reveal-text > *"
      ], { y: 45, opacity: 0 });

      const cardContainer = document.querySelector(".contact-cards-container");
      const scrollDistance = cardContainer
        ? cardContainer.getBoundingClientRect().height + 96
        : window.innerHeight;

      const PANEL_ACTION = 2.0;
      const SUB_ACTION = 1.8;
      const PAUSE_ACTION = 0.4;

      const DYNAMIC_SCROLL_TRACK =
        5 * PX_PER_MAIN_PANEL +
        2 * PX_PER_SUB_STEP +
        4 * PAUSE_PX;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ".contact-hero-master",
          start: "top top",
          end: `+=${DYNAMIC_SCROLL_TRACK}`,
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          preventOverlaps: true,
          invalidateOnRefresh: true,
        },
      });

      const revealedElements = new Set<string>();

      const addPlayOnceTextReveal = (labelName: string, timeOffset: number, selector: string) => {
        const absoluteTime = tl.labels[labelName] + timeOffset;

        tl.call(() => {
          const isForward = tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true;
          if (isForward && !revealedElements.has(selector)) {
            revealedElements.add(selector);

            gsap.to(selector, {
              y: 0,
              opacity: 1,
              stagger: 0.05,
              duration: 0.8,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        }, [], absoluteTime);
      };

      tl.addLabel("start", 0);

      // PHASE 1
      tl.to(".contact-hero-bg", { y: -100, duration: PANEL_ACTION, ease: "power2.inOut" })
        .to(".cta-scroll-wrapper", { yPercent: -100, ease: "power2.inOut", duration: PANEL_ACTION }, "<")
        .addLabel("heroOut");

      tl.to({}, { duration: PAUSE_ACTION });

      // PHASE 2
      tl.addLabel("sec1Start", ">")
        .set(".section-one-scroll-wrapper", { visibility: "visible" }, "sec1Start")
        .to(".section-one-scroll-wrapper", { y: "0vh", ease: "power2.inOut", duration: PANEL_ACTION }, "sec1Start");

      tl.to({}, { duration: PAUSE_ACTION });

      // PHASE 3
      tl.addLabel("sec1Scroll", ">")
        .to(".contact-one-bg", { yPercent: -35, duration: SUB_ACTION, ease: "power2.inOut" }, "sec1Scroll")
        .to(".contact-right-scroll-track", { y: -scrollDistance, ease: "power2.inOut", duration: SUB_ACTION }, "<");

      tl.to({}, { duration: PAUSE_ACTION });

      // PHASE 4
      tl.addLabel("faqStart", ">")
        .set(".faq-scroll-wrapper", { visibility: "visible" }, "faqStart")
        .to(".faq-scroll-wrapper", { y: "0vh", ease: "power2.inOut", duration: PANEL_ACTION }, "faqStart");

      addPlayOnceTextReveal("faqStart", -0.65, ".faq-scroll-wrapper .gs-line-inner, .faq-scroll-wrapper .custom-line-inner, .faq-scroll-wrapper .reveal-text > *");

      tl.to({}, { duration: PAUSE_ACTION });

      // PHASE 4.5
      tl.addLabel("ctaFadeOut", ">")
        .to(
          [".faq-content", ".cta-scroll-wrapper .cta-inner-desktop", ".cta-scroll-wrapper .cta-inner-mobile"],
          {
            opacity: 0,
            y: -40,
            duration: PANEL_ACTION * 0.5,
            ease: "power2.in",
          },
          "ctaFadeOut"
        );

      // PHASE 5
      tl.addLabel("footerStart", ">")
        .set(".footer-scroll-wrapper", { visibility: "visible" }, "footerStart")
        .to(".footer-scroll-wrapper", { y: "0vh", ease: "power2.out", duration: PANEL_ACTION }, "footerStart");

      ScrollTrigger.refresh();
    }, scopeRef);

    return () => {
      if (isTouchOnly()) {
        ScrollTrigger.normalizeScroll(false);
      }
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".faq-scroll-wrapper .reveal-text");
      }
      ctx.revert();
    };
  }, [introDone]);

  return (
    <div ref={scopeRef}>
      <div className="contact-hero-master relative h-screen w-screen overflow-hidden bg-black">
        <div className="w-full h-full relative z-10">
          <ContactHero />
        </div>

        <div className="cta-scroll-wrapper absolute top-full left-0 w-full h-screen z-20 pointer-events-auto">
          <SectionCTA />
        </div>

        <div className="section-one-scroll-wrapper absolute top-0 left-0 w-full h-screen z-30">
          <SectionOne />
        </div>

        <div className="faq-scroll-wrapper absolute top-0 left-0 w-full h-screen z-40">
          <FAQSection />
        </div>

        <div className="footer-scroll-wrapper absolute top-0 left-0 w-full h-screen z-50 flex flex-col justify-end pointer-events-none">
          <div className="w-full pointer-events-auto">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}