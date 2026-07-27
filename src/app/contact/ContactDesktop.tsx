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

// Dedicated Desktop Scroll Metrics
const PX_PER_MAIN_PANEL = 1250;
const PX_PER_SUB_STEP = 550;
const PAUSE_PX = 150;

export default function ContactDesktop() {
  const { setPreloaderDone, preloaderDone } = useSite();
  const [introDone, setIntroDone] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    document.body.classList.remove("preloading");
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  // Lock body overflow strictly during hero intro sequence
  useEffect(() => {
    const locked = !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [introDone]);

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
          requestAnimationFrame(() => {
            window.dispatchEvent(new Event("resize"));
            setTimeout(() => ScrollTrigger.refresh(), 50);
          });
        },
      });

      // Smooth background image zoom-out
      introTl.to(
        ".contact-hero-bg",
        {
          scale: 1.0,
          duration: 1.4,
          ease: "power2.out",
        },
        0
      );

      // Hero text fade and slide in
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
    if (!introDone) return;

    if (isTouchOnly()) {
      ScrollTrigger.normalizeScroll(true);
    }

    let vvCleanup: (() => void) | null = null;

    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(0);

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

      const buildTimeline = () => {
        ScrollTrigger.refresh();

        const vv = typeof visualViewport !== "undefined" ? visualViewport : null;
        if (vv) {
          const onVVResize = () => ScrollTrigger.refresh(true);
          vv.addEventListener("resize", onVVResize);
          vvCleanup = () => vv.removeEventListener("resize", onVVResize);
        }

        const MAIN_PANELS_COUNT = 5;
        const SUB_STEPS_COUNT = 2;
        const PAUSES_COUNT = 3;

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
            snap: {
              directional: false,
              snapTo: (value, self) => {
                const totalDur = tl.totalDuration();
                if (!totalDur) return value;

                const labelTimes = Array.from(
                  new Set(
                    Object.keys(tl.labels).map((name) =>
                      Number((tl.labels[name] / totalDur).toFixed(5))
                    )
                  )
                ).sort((a, b) => a - b);

                if (labelTimes.length < 2) return value;

                const curProgress = self ? self.progress : value;
                const isScrollingDown = value >= curProgress;

                for (let i = 0; i < labelTimes.length - 1; i++) {
                  const start = labelTimes[i];
                  const end = labelTimes[i + 1];

                  if (curProgress >= start - 0.0001 && curProgress <= end + 0.0001) {
                    const gap = end - start;
                    if (gap <= 0.00001) continue;

                    const localProgress = (curProgress - start) / gap;

                    if (isScrollingDown) {
                      return localProgress >= 0.35 ? end : start;
                    } else {
                      return localProgress <= 0.50 ? start : end;
                    }
                  }
                }

                return value;
              },
              duration: { min: 0.4, max: 0.8 },
              delay: 0.05,
              ease: "power3.inOut",
            },
          },
        });

        tl.addLabel("start", 0);

        // ── PHASE 1: Hero transition to CTA ──
        tl.to(".contact-hero-bg", { y: -100, duration: 1.0 })
          .to(".cta-scroll-wrapper", { yPercent: -100, ease: "power2.inOut", duration: 1.0 }, "<")
          .addLabel("heroOut");

        // ── PHASE 2: Section One slides in ──
        tl.set(".section-one-scroll-wrapper", { visibility: "visible" })
          .to(".section-one-scroll-wrapper", { y: "0vh", ease: "power2.inOut", duration: 1.0 })
          .addLabel("sec1Start");

        // ── PHASE 3: Section One Cards scroll track ──
        tl.to(".contact-one-bg", { yPercent: -35, duration: 1.0 })
          .to(".contact-right-scroll-track", { y: -scrollDistance, ease: "power1.inOut", duration: 1.0 }, "<")
          .addLabel("sec1Scroll");

        // ── PHASE 4: FAQ Section glides in ──
        tl.set(".faq-scroll-wrapper", { visibility: "visible" })
          .to(".faq-scroll-wrapper", { y: "0vh", ease: "power2.inOut", duration: 1.0 })
          .addLabel("faqStart");

        // ── PHASE 5: Footer slide up ──
        tl.set(".footer-scroll-wrapper", { visibility: "visible" })
          .to(".faq-content", { opacity: 0, y: -30, duration: 0.7, ease: "power1.out" })
          .to(".footer-scroll-wrapper", { y: "0vh", ease: "power2.out", duration: 1.0 }, "<")
          .addLabel("footerStart");
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
  }, [introDone]);

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