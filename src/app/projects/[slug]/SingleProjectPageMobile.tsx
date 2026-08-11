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
const PX_PER_SUB_STEP = 350;
const PAUSE_PX = 150;
const BASELINE_VH = 800;

export default function SingleProjectPageMobile({ pageData }: SubServicesMobileProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const [isProjectInfoActive, setIsProjectInfoActive] = useState(false);
  const lastInfoIdx = useRef<number>(-1);

  // Hero intro hook trigger
  const { introDone } = useHeroIntro(scopeRef, { isMobile: true });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Direct GSAP state setups matching standard panel layout
      gsap.set(".project-hero-master", { yPercent: 0, force3D: true });
      gsap.set(".project-info-wrap", { yPercent: 100, zIndex: 20, visibility: "visible", force3D: true });
      gsap.set(".project-app-wrap", { yPercent: 100, zIndex: 30, visibility: "visible", force3D: true });
      gsap.set(".faq-scroll-wrapper", { yPercent: 100, zIndex: 40, visibility: "visible", force3D: true });
      gsap.set(".footer-scroll-wrapper", { yPercent: 100, zIndex: 50, visibility: "hidden", force3D: true });

      gsap.set(".appsec-phone-wrapper", { y: 30, opacity: 0, force3D: true });
      gsap.set(".faq-content", { opacity: 1, y: 0 });
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

      const tl = gsap.timeline({
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
            // Smoothly evaluate slide hook in onUpdate instead of timeline callbacks
            const infoTime = tl.labels["infoStart"];
            const appTime = tl.labels["appSectionStart"];

            if (typeof infoTime === "number" && typeof appTime === "number") {
              const currentTime = tl.time();
              if (currentTime >= infoTime && currentTime < appTime) {
                if (!isProjectInfoActive) setIsProjectInfoActive(true);

                if (infoSlides.length > 1) {
                  const progress = (currentTime - infoTime) / (appTime - infoTime);
                  const stepIndex = Math.min(
                    infoSlides.length - 1,
                    Math.floor(progress * infoSlides.length)
                  );
                  triggerInfoHook(stepIndex);
                } else {
                  triggerInfoHook(0);
                }
              } else if (currentTime < infoTime) {
                if (isProjectInfoActive) setIsProjectInfoActive(false);
                triggerInfoHook(0);
              }
            }
          },
        },
      });

      // --- TRANSITION 1: Hero -> Project Info Slide ---
      tl.addLabel("infoStart")
        .to(".project-info-wrap", { yPercent: 0, duration: ACTION }, "infoStart")
        .to(".project-hero-bg", { scale: 1.0, yPercent: -15, duration: ACTION }, "infoStart");

      tl.to({}, { duration: DEAD_SCROLL });

      // --- TRANSITION 2: Sequential Inner Info Slides ---
      if (infoSlides.length > 0) {
        infoSlides.forEach((_, index) => {
          if (index === 0) return;

          const slideLabel = `info_slide_${index}`;
          tl.addLabel(slideLabel);

          const currentImgLayer = `.info-img-layer-${index}`;
          const innerImage = `${currentImgLayer} .info-image-inner`;

          tl.to(
            currentImgLayer,
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              duration: ACTION,
              force3D: true,
            },
            slideLabel
          );

          tl.fromTo(
            innerImage,
            { scale: 1.25 },
            { scale: 1.0, duration: ACTION, force3D: true },
            slideLabel
          );
        });
      }

      tl.to({}, { duration: DEAD_SCROLL });

      // --- TRANSITION 3: Project Info -> App Section ---
      tl.addLabel("appSectionStart", ">")
        .to(".project-app-wrap", { yPercent: 0, duration: ACTION }, "appSectionStart")
        .to(".project-info-wrap", { yPercent: -15, duration: ACTION }, "appSectionStart");

      tl.to(
        ".appsec-phone-wrapper",
        { y: 0, opacity: 1, duration: ACTION * 0.8, force3D: true },
        "appSectionStart+=0.4"
      );

      tl.to({}, { duration: DEAD_SCROLL });

      // --- TRANSITION 4: App Section -> FAQ Section ---
      tl.addLabel("faqStart", ">")
        .to(".faq-scroll-wrapper", { yPercent: 0, duration: ACTION }, "faqStart")
        .to(".project-app-wrap", { yPercent: -15, duration: ACTION }, "faqStart");

      tl.to({}, { duration: DEAD_SCROLL });

      // --- TRANSITION 5: FAQ Section -> Footer ---
      tl.addLabel("footerStart", ">")
        .set(".footer-scroll-wrapper", { visibility: "visible" }, "footerStart")
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
  }, [introDone, pageData.slides, isProjectInfoActive]);

  return (
    <div ref={scopeRef} className="w-full relative min-h-[100dvh] bg-black text-white overflow-hidden">
      <div
        className="master-viewport pin-all-single-project relative w-full h-[100dvh] overflow-hidden bg-black"
        style={{ visibility: "visible" }}
      >
        {/* Layer 1: Hero Section */}
        <div className="project-hero-master gpu-accelerated absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
          <ProjectScrollHero
            title={pageData.title}
            description={pageData.description}
            images={pageData.images || []}
          />
        </div>

        {/* Layer 2: Project Info Section */}
        <div
          className="project-info-wrap gpu-accelerated absolute inset-0 w-full h-full"
          style={{ zIndex: 20 }}
        >
          <ProjectInfoSlide
            slides={pageData.slides || []}
            isActive={isProjectInfoActive}
          />
        </div>

        {/* Layer 3: App Section */}
        <div
          className="project-app-wrap gpu-accelerated absolute inset-x-0 bottom-0 w-full h-auto min-h-[100dvh]"
          style={{ zIndex: 30 }}
        >
          <Appsection />
        </div>

        {/* Layer 4: FAQ Section */}
        <div
          className="faq-scroll-wrapper gpu-accelerated absolute inset-0 w-full h-full overflow-hidden"
          style={{ zIndex: 40 }}
        >
          <div className="faq-content w-full h-full">
            <FAQSection />
          </div>
        </div>

        {/* Layer 5: Footer */}
        <div
          className="footer-scroll-wrapper gpu-accelerated absolute left-0 bottom-0 w-full"
          style={{ zIndex: 50, pointerEvents: "auto", visibility: "hidden" }}
        >
          <Footer />
        </div>
      </div>
    </div>
  );
}