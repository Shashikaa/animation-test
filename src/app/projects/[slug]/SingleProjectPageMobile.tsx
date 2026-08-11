"use client";

import { useRef, useEffect, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectScrollHero from "@/src/components/Projects/ProjectScrollHero";
import ProjectInfoSlide from "@/src/components/Projects/ProjectInfoSlide";
import Appsection from "@/src/components/Projects/Appsection";
import FAQSection from "@/src/components/contact/FAQSection";
import Footer from "@/src/components/Footer";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";
import { FullServiceData } from "./data";

gsap.registerPlugin(ScrollTrigger);

type SubServicesMobileProps = {
  pageData: FullServiceData;
};

// Standardized Metrics aligned with AboutMobile
const PX_PER_MAIN_PANEL = 850;
const PX_PER_SUB_STEP = 450;
const PAUSE_PX = 150;
const BASELINE_VH = 800;

export default function SingleProjectPageMobile({ pageData }: SubServicesMobileProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const [isProjectInfoActive, setIsProjectInfoActive] = useState(false);
  const lastInfoIdx = useRef<number>(-1);

  const { introDone } = useHeroIntro(scopeRef, { isMobile: true });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial state for all panels
      gsap.set(".project-hero-master", { yPercent: 0, force3D: true, zIndex: 10 });
      gsap.set(".project-info-wrap", { yPercent: 100, visibility: "visible", force3D: true, zIndex: 50 });
      gsap.set(".project-app-wrap", { yPercent: 100, visibility: "visible", force3D: true, zIndex: 60 });
      gsap.set(".faq-scroll-wrapper", { yPercent: 100, visibility: "visible", force3D: true, zIndex: 70 });
      gsap.set(".faq-content", { opacity: 1, y: 0 });

      gsap.set(".footer-scroll-wrapper", { 
        yPercent: 100, 
        zIndex: 80, 
        visibility: "hidden", 
        force3D: true 
      });

      gsap.set(".hero-text-wrap", { autoAlpha: 1 });
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  // Master Scroll Timeline
  useEffect(() => {
    if (!introDone) return;

    const isAndroid = /Android/i.test(navigator.userAgent);

    const ctx = gsap.context(() => {
      ScrollTrigger.config({ ignoreMobileResize: true });

      if (!isAndroid) {
        ScrollTrigger.normalizeScroll({
          allowNestedScroll: true,
          lockAxis: true,
        });
      }

      const ACTION = 1.4;
      const DEAD_SCROLL = 0.15;
      const UNIFIED_EASE = "power1.inOut";

      const infoSlides = pageData.slides || [];
      const MAIN_PANELS_COUNT = 4;
      const SUB_STEPS_COUNT = Math.max(0, infoSlides.length - 1);
      const PAUSES_COUNT = 5;

      const vh = window.innerHeight || BASELINE_VH;
      const scaleFactor = vh / BASELINE_VH;

      const DYNAMIC_SCROLL_TRACK =
        (MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL +
          SUB_STEPS_COUNT * PX_PER_SUB_STEP +
          PAUSES_COUNT * PAUSE_PX) *
        scaleFactor;

      const triggerInfoHook = (nextIdx: number) => {
        if (nextIdx !== lastInfoIdx.current) {
          lastInfoIdx.current = nextIdx;
          if ((window as any)._projectInfoGoTo) {
            (window as any)._projectInfoGoTo(nextIdx);
          }
        }
      };

      gsap.set(".appsec-phone-wrapper", { y: 30, opacity: 0 });

      const scrollTl = gsap.timeline({
        defaults: { ease: UNIFIED_EASE, lazy: true },
        scrollTrigger: {
          trigger: ".master-viewport",
          start: "top top",
          end: `+=${DYNAMIC_SCROLL_TRACK}`,
          pin: true,
          pinType: "fixed",
          scrub: isAndroid ? 0.2 : 0.6,
          anticipatePin: 1,
          preventOverlaps: true,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
          onUpdate: () => {
            const infoStart = scrollTl.labels["infoFullyRevealed"];
            const appStart = scrollTl.labels["appSectionStart"];

            if (typeof infoStart === "number" && typeof appStart === "number" && infoSlides.length > 1) {
              const currentTime = scrollTl.time();

              if (currentTime >= infoStart && currentTime < appStart) {
                const infoProgress = (currentTime - infoStart) / (appStart - infoStart);
                const step = 1 / infoSlides.length;
                const nextIdx = Math.min(
                  infoSlides.length - 1,
                  Math.floor(infoProgress / step)
                );
                triggerInfoHook(nextIdx);
              } else if (currentTime < infoStart) {
                triggerInfoHook(0);
              }
            }
          },
        },
      });

      // ── STEP A: HERO TRANSITION & INFO SECTION SLIDE UP ──
      scrollTl.addLabel("start", 0);

      scrollTl.to(".hero-text-wrap", {
        autoAlpha: 0,
        y: -30,
        duration: ACTION * 0.75,
        ease: "power2.in"
      }, 0);

      scrollTl.to(".project-info-wrap", {
        yPercent: 0,
        duration: ACTION,
        onStart: () => setIsProjectInfoActive(true),
        onReverseComplete: () => {
          setIsProjectInfoActive(false);
          triggerInfoHook(0);
        }
      }, 0);

      scrollTl.addLabel("infoFullyRevealed", ACTION);
      scrollTl.to({}, { duration: DEAD_SCROLL });

      // ── STEP B: SEQUENTIAL INNER INFO SLIDES ──
      if (infoSlides.length > 0) {
        infoSlides.forEach((_, index) => {
          if (index === 0) return;

          const slideLabel = `info_slide_${index}`;
          scrollTl.addLabel(slideLabel);

          const currentImgLayer = `.info-img-layer-${index}`;
          const innerImage = `${currentImgLayer} .info-image-inner`;

          scrollTl.to(currentImgLayer, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: ACTION,
          }, slideLabel);

          scrollTl.fromTo(innerImage,
            { scale: 1.25 },
            { scale: 1.0, duration: ACTION, ease: "power2.out" },
            slideLabel
          );
        });
      }

      scrollTl.to({}, { duration: DEAD_SCROLL });

      // ── STEP C: APP SECTION SLIDES UP OVER INFO WRAP ──
      scrollTl.addLabel("appSectionStart");

      scrollTl.to(".project-app-wrap", { yPercent: 0, duration: ACTION }, "appSectionStart")
              .to(".project-info-wrap", { yPercent: -15, duration: ACTION }, "appSectionStart");

      scrollTl.to(
        ".appsec-phone-wrapper",
        { y: 0, opacity: 1, duration: ACTION * 0.8, ease: "power2.out" },
        "appSectionStart+=0.4"
      );

      scrollTl.to({}, { duration: DEAD_SCROLL });

      // ── STEP D: FAQ SECTION SLIDES UP OVER APP WRAP ──
      scrollTl.addLabel("faqStart");

      scrollTl.to(".faq-scroll-wrapper", { yPercent: 0, duration: ACTION }, "faqStart")
              .to(".project-app-wrap", { yPercent: -15, duration: ACTION }, "faqStart");

      scrollTl.to({}, { duration: DEAD_SCROLL });

      // ── STEP D.5: FAQ CONTENT FADE OUT ──
      scrollTl.addLabel("ctaFadeOut", ">")
        .to(".faq-content", {
          opacity: 0,
          y: -30,
          duration: ACTION * 0.5,
          ease: "power2.in",
          pointerEvents: "none"
        }, "ctaFadeOut");

      // ── STEP E: FOOTER SLIDE-UP ──
      scrollTl.addLabel("footerStart", ">");

      scrollTl.set(".footer-scroll-wrapper", { visibility: "visible" }, "footerStart")
              .fromTo(
                ".footer-scroll-wrapper",
                { yPercent: 100 },
                { yPercent: 0, duration: ACTION, ease: "power1.out" },
                "footerStart"
              );

    }, scopeRef);

    return () => {
      ctx.revert();
      if (!isAndroid) {
        ScrollTrigger.normalizeScroll(false);
      }
    };
  }, [introDone, pageData.images, pageData.slides, pageData.title]);

  return (
    <div ref={scopeRef} className="w-full relative min-h-[100dvh] bg-black text-white overflow-hidden">
      <div 
        className="master-viewport pin-all relative w-full overflow-hidden h-[100dvh] bg-black" 
        style={{ visibility: "visible" }}
      >
        <div className="project-hero-master gpu-accelerated absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
          <ProjectScrollHero
            title={pageData.title}
            description={pageData.description}
            images={pageData.images || []}
          />
        </div>

        <div
          className="project-info-wrap gpu-accelerated absolute inset-0 w-full h-full"
          style={{ zIndex: 50 }}
        >
          <ProjectInfoSlide
            slides={pageData.slides || []}
            isActive={isProjectInfoActive}
          />
        </div>

        <div
          className="project-app-wrap gpu-accelerated absolute inset-x-0 bottom-0 w-full h-auto min-h-[100dvh]"
          style={{ zIndex: 60 }}
        >
          <Appsection />
        </div>

        <div
          className="faq-scroll-wrapper gpu-accelerated absolute inset-0 w-full h-full overflow-hidden"
          style={{ zIndex: 70 }}
        >
          <FAQSection />
        </div>

        <div
          className="footer-scroll-wrapper gpu-accelerated absolute left-0 bottom-0 w-full z-[80]"
          style={{ pointerEvents: "auto", visibility: "hidden" }}
        >
          <Footer />
        </div>
      </div>
    </div>
  );
}