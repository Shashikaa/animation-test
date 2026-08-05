"use client";

import ContactHero from "@/src/components/contact/Hero";
import SectionOne from "@/src/components/contact/SectionOne";
import SectionCTA from "@/src/components/contact/SectionCTA";
import FAQSection from "@/src/components/contact/FAQSection";
import Footer from "@/src/components/Footer";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal";

gsap.registerPlugin(ScrollTrigger);

const isTouchOnly = () => ScrollTrigger.isTouch === 1;

// Standardized Desktop Metrics (Matched to Home Setup)
const PX_PER_MAIN_PANEL = 1000;
const PX_PER_SUB_STEP = 600;
const PAUSE_PX = 350;

export default function ContactDesktop() {
  const { setPreloaderDone, preloaderDone } = useSite();
  const [introDone, setIntroDone] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);

  // Setup initial scroll state and preloader signals
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }

    const isFullyReady = preloaderDone && introDone;

    if (!isFullyReady) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }

    document.body.classList.remove("preloading");
    setPreloaderDone(true);

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [setPreloaderDone, preloaderDone, introDone]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "DOMContentLoaded,load,visibilitychange,resize",
      });

      // Initial state setup with hardware acceleration
      gsap.set(".contact-hero-bg", { scale: 1.25, force3D: true, transformOrigin: "center center" });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30, force3D: true });

      // Staging CTA wrapper cleanly so WebGL Canvas computes non-zero dimensions
      gsap.set(".cta-scroll-wrapper", { yPercent: 0, visibility: "visible", force3D: true });
      gsap.set(".section-one-scroll-wrapper", { visibility: "hidden", y: "100vh", force3D: true });
      gsap.set(".faq-scroll-wrapper", { visibility: "hidden", y: "100vh", force3D: true });
      gsap.set(".footer-scroll-wrapper", { visibility: "hidden", y: "100vh", force3D: true });

      gsap.set([".faq-content", ".cta-inner-desktop", ".cta-inner-mobile"], { opacity: 1, force3D: true });
      gsap.set(".contact-one-bg", { scale: 1, yPercent: 0, force3D: true });
      gsap.set(".contact-right-scroll-track", { y: 0, force3D: true });

      // Force initial Canvas resize calculation on layout staging
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("resize"));
      });
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  // Hero Intro Sequence with Zoom-out (1.25 to 1.0)
  useEffect(() => {
    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({
        onComplete: () => {
          setIntroDone(true);
        },
      });

      introTl.to(
        ".contact-hero-bg",
        {
          scale: 1.0,
          duration: 1.4,
          ease: "power2.out",
        },
        0
      );

      introTl.to(
        [".hero-title", ".hero-desc"],
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          stagger: 0.15,
          ease: "power2.out",
        },
        0.2
      );
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  // Master Scroll Timeline
  useEffect(() => {
    if (!introDone || !preloaderDone) return;

    if (isTouchOnly()) {
      ScrollTrigger.normalizeScroll(true);
    }

    let vvCleanup: (() => void) | null = null;

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
          willChange: "transform, clip-path, opacity",
        });
      });

      useTextReveal(scopeRef, ".faq-scroll-wrapper .reveal-text");

      gsap.set(".faq-scroll-wrapper .reveal-text", { visibility: "visible", opacity: 1 });
      gsap.set([
        ".faq-scroll-wrapper .gs-line-inner",
        ".faq-scroll-wrapper .custom-line-inner",
        ".faq-scroll-wrapper .reveal-text > *"
      ], { y: 45, opacity: 0 });

      const buildTimeline = () => {
        ScrollTrigger.refresh();

        const vv = typeof visualViewport !== "undefined" ? visualViewport : null;
        if (vv) {
          const onVVResize = () => ScrollTrigger.refresh(true);
          vv.addEventListener("resize", onVVResize);
          vvCleanup = () => vv.removeEventListener("resize", onVVResize);
        }

        const revealedElements = new Set<string>();

        // Uniform Duration Metrics (Matched to Home Setup)
        const PANEL_ACTION = 2.0;
        const SUB_ACTION = 1.8;
        const PAUSE_ACTION = 0.4;

        const MAIN_PANELS_COUNT = 5;
        const SUB_STEPS_COUNT = 2;
        const PAUSES_COUNT = 4;

        const DYNAMIC_SCROLL_TRACK =
          MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL +
          SUB_STEPS_COUNT * PX_PER_SUB_STEP +
          PAUSES_COUNT * PAUSE_PX;

        const cardContainer = document.querySelector(".contact-cards-container");
        const scrollDistance = cardContainer
          ? cardContainer.getBoundingClientRect().height + 96
          : window.innerHeight;

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

        // Original Text Reveal logic preserved exact offsets (-0.65) and duration (0.8)
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

        // ── PHASE 1: Hero transition to CTA ──
        tl.to(".contact-hero-bg", { y: -100, duration: PANEL_ACTION, ease: "power2.inOut" })
          .to(".cta-scroll-wrapper", { yPercent: -100, ease: "power2.inOut", duration: PANEL_ACTION }, "<")
          .addLabel("heroOut");

        tl.to({}, { duration: PAUSE_ACTION });

        // ── PHASE 2: Section One slides in ──
        tl.addLabel("sec1Start", ">")
          .set(".section-one-scroll-wrapper", { visibility: "visible" }, "sec1Start")
          .to(".section-one-scroll-wrapper", { y: "0vh", ease: "power2.inOut", duration: PANEL_ACTION }, "sec1Start");

        tl.to({}, { duration: PAUSE_ACTION });

        // ── PHASE 3: Section One Cards scroll track ──
        tl.addLabel("sec1Scroll", ">")
          .to(".contact-one-bg", { yPercent: -35, duration: SUB_ACTION, ease: "power2.inOut" }, "sec1Scroll")
          .to(".contact-right-scroll-track", { y: -scrollDistance, ease: "power2.inOut", duration: SUB_ACTION }, "<");

        tl.to({}, { duration: PAUSE_ACTION });

        // ── PHASE 4: FAQ Section glides in ──
        tl.addLabel("faqStart", ">")
          .set(".faq-scroll-wrapper", { visibility: "visible" }, "faqStart")
          .to(".faq-scroll-wrapper", { y: "0vh", ease: "power2.inOut", duration: PANEL_ACTION }, "faqStart");

        addPlayOnceTextReveal("faqStart", -0.65, ".faq-scroll-wrapper .gs-line-inner, .faq-scroll-wrapper .custom-line-inner, .faq-scroll-wrapper .reveal-text > *");

        tl.to({}, { duration: PAUSE_ACTION });

        // ── PHASE 4.5: FAQ / CTA Content Fade Out First (MATCHING HOME) ──
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
          )
          .to({}, { duration: 0 });

        // ── PHASE 5: Footer slide up ──
        tl.addLabel("footerStart", ">")
          .set(".footer-scroll-wrapper", { visibility: "visible" }, "footerStart")
          .to(".footer-scroll-wrapper", { y: "0vh", ease: "power2.out", duration: PANEL_ACTION }, "footerStart");
      };

      requestAnimationFrame(buildTimeline);
    }, scopeRef);

    return () => {
      vvCleanup?.();
      if (isTouchOnly()) {
        ScrollTrigger.normalizeScroll(false);
      }
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".faq-scroll-wrapper .reveal-text");
      }
      ctx.revert();
    };
  }, [introDone, preloaderDone]);

  return (
    <div ref={scopeRef}>
      <div
        className="contact-hero-master relative h-screen w-screen overflow-hidden bg-black"
        style={{ visibility: "visible" }}
      >
        <div className="w-full h-full relative z-10">
          <ContactHero />
        </div>

        <div className="cta-scroll-wrapper absolute top-full left-0 w-full h-screen z-20 pointer-events-auto">
          <SectionCTA preloaderDone={preloaderDone} />
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