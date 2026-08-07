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

// Standardized Metrics to align exact scroll feel
const PX_PER_MAIN_PANEL = 850; 
const PX_PER_SUB_STEP = 350;   
const PAUSE_PX = 100;          

export default function SingleProjectPageMobile({ pageData }: SubServicesMobileProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const [isProjectInfoActive, setIsProjectInfoActive] = useState(false);
  const lastInfoIdx = useRef<number>(-1);

  // Single unified utility hook configured for Mobile
  const { introDone } = useHeroIntro(scopeRef, { isMobile: true });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".project-hero-master", { zIndex: 10 });

      gsap.set(
        [
          ".project-info-wrap",
          ".project-app-wrap",
          ".faq-scroll-wrapper",
          ".footer-scroll-wrapper"
        ],
        { clearProps: "transform" }
      );

      gsap.set(".project-info-wrap", { yPercent: 100, visibility: "hidden", zIndex: 50 });
      gsap.set(".project-app-wrap", { yPercent: 100, visibility: "hidden", zIndex: 60 });
      gsap.set(".faq-scroll-wrapper", { yPercent: 100, visibility: "hidden", zIndex: 70 });
      gsap.set(".footer-scroll-wrapper", { yPercent: 100, visibility: "hidden", zIndex: 80 });
      gsap.set(".faq-content", { opacity: 1, y: 0 });

      gsap.set(".hero-text-wrap", { autoAlpha: 1 });
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  // Master Scroll Timeline
  useEffect(() => {
    if (!introDone) return;

    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(0);

      // Enable touch normalization on mobile
      const isTouchDevice = ScrollTrigger.isTouch > 0 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
      if (isTouchDevice) {
        ScrollTrigger.normalizeScroll(true);
      }

      const performanceTargets = [
        ".project-hero-master", ".hero-image-layer", ".hero-image-inner",
        ".project-info-wrap", ".info-text-block", ".info-img-layer",
        ".project-app-wrap", ".appsec-bg", ".appsec-phone-wrapper",
        ".faq-scroll-wrapper", ".faq-content", ".footer-scroll-wrapper"
      ];

      performanceTargets.forEach(selector => {
        gsap.set(selector, {
          force3D: true,
          willChange: "transform, opacity, clip-path"
        });
      });

      const ACTION = 1.4;
      const DEAD_SCROLL = 0.2;
      const infoSlides = pageData.slides || [];

      const MAIN_PANELS_COUNT = 4;
      const SUB_STEPS_COUNT = Math.max(0, infoSlides.length - 1);
      const PAUSES_COUNT = 5;

      const DYNAMIC_SCROLL_TRACK = 
        (MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL) + 
        (SUB_STEPS_COUNT * PX_PER_SUB_STEP) + 
        (PAUSES_COUNT * PAUSE_PX);

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
        defaults: { ease: "none", lazy: true },
        scrollTrigger: {
          trigger: ".master-viewport",
          start: "top top",
          end: `+=${DYNAMIC_SCROLL_TRACK}`,
          pin: true,
          pinType: "fixed",
          pinSpacing: true,
          scrub: 0.5,
          anticipatePin: 1,
          preventOverlaps: true,
          fastScrollEnd: true,
          invalidateOnRefresh: false,
        }
      });

      // ── STEP A: HERO TRANSITION & INFO SECTION SLIDE UP ──
      scrollTl.addLabel("start", 0);

      scrollTl.to(".hero-text-wrap", { 
        autoAlpha: 0, 
        y: -30, 
        duration: ACTION * 0.75, 
        ease: "power2.in" 
      }, 0);

      scrollTl.set(".project-info-wrap", { visibility: "visible" }, 0)
              .to(".project-info-wrap", { 
                yPercent: 0, 
                duration: ACTION, 
                ease: "power2.inOut",
                onStart: () => setIsProjectInfoActive(true),
                onReverseComplete: () => {
                  setIsProjectInfoActive(false);
                  triggerInfoHook(0);
                }
              }, 0);

      scrollTl.call(() => {
        triggerInfoHook(0);
      }, [], 0.6);

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
            ease: "power2.inOut"
          }, slideLabel);

          scrollTl.fromTo(innerImage, 
            { scale: 1.25 },
            { scale: 1.0, duration: ACTION, ease: "power2.out" },
            slideLabel
          );

          scrollTl.call(() => {
            const isForward = scrollTl.scrollTrigger ? scrollTl.scrollTrigger.direction > 0 : true;
            triggerInfoHook(isForward ? index : index - 1);
          }, [], `${slideLabel}+=0.6`);
        });
      }

      scrollTl.to({}, { duration: DEAD_SCROLL });

      // ── STEP C: APP SECTION SLIDES UP OVER INFO WRAP ──
      scrollTl.addLabel("appSectionStart");

      scrollTl.set(".project-app-wrap", { visibility: "visible" }, "appSectionStart")
              .to(".project-app-wrap", { yPercent: 0, duration: ACTION, ease: "power2.inOut" }, "appSectionStart");

      scrollTl.to(
        ".appsec-phone-wrapper",
        { y: 0, opacity: 1, duration: ACTION * 0.8, ease: "power2.out" },
        "appSectionStart+=0.4"
      );

      scrollTl.to({}, { duration: DEAD_SCROLL });

      // ── STEP D: FAQ SECTION SLIDES UP OVER APP WRAP ──
      scrollTl.addLabel("faqStart");

      scrollTl.set(".faq-scroll-wrapper", { visibility: "visible" }, "faqStart")
              .to(".faq-scroll-wrapper", { yPercent: 0, ease: "power2.inOut", duration: ACTION }, "faqStart");

      scrollTl.to({}, { duration: DEAD_SCROLL });

      // ── STEP D.5: FAQ CONTENT FADE OUT FIRST ──
      scrollTl.addLabel("ctaFadeOut", ">")
        .to(".faq-content", { 
          opacity: 0, 
          y: -30, 
          duration: ACTION * 0.1, 
          ease: "power2.in",
          pointerEvents: "none"
        }, "ctaFadeOut")
        .to({}, { duration: 0 });

      // ── STEP E: FOOTER SLIDE-UP ──
      scrollTl.addLabel("footerStart", ">");

      scrollTl.set(".footer-scroll-wrapper", { visibility: "visible" }, "footerStart")
              .fromTo(
                ".footer-scroll-wrapper",
                { yPercent: 100 },
                { yPercent: 0, ease: "power2.inOut", duration: ACTION },
                "footerStart"
              );

      scrollTl.addLabel("end");

    }, scopeRef);

    return () => {
      ctx.revert();
      if (ScrollTrigger.isTouch) {
        ScrollTrigger.normalizeScroll(false);
      }
    };
  }, [introDone, pageData.images, pageData.slides, pageData.title]);

  return (
    <div 
      ref={scopeRef} 
      className="w-full relative min-h-[100dvh] bg-black text-white overflow-hidden"
    >
      <div className="master-viewport pin-all-single-project relative w-full overflow-hidden bg-black" style={{ visibility: "visible" }}>
        
        <div className="project-hero-master gpu-accelerated absolute inset-0 w-full h-full">
          <ProjectScrollHero 
            title={pageData.title}
            description={pageData.description}
            images={pageData.images || []}
          />
        </div>

        <div 
          className="project-info-wrap gpu-accelerated absolute inset-0 w-full h-full structural-layer"
          style={{ 
            zIndex: 50, 
            visibility: "hidden", 
            transform: "translateY(100%)" 
          }}
        >
          <ProjectInfoSlide 
            slides={pageData.slides || []} 
            isActive={isProjectInfoActive}
          />
        </div>

        <div 
          className="project-app-wrap gpu-accelerated absolute inset-x-0 bottom-0 w-full h-auto min-h-[100dvh] structural-layer"
          style={{ 
            zIndex: 60, 
            visibility: "hidden", 
            transform: "translateY(100%)" 
          }}
        >
          <Appsection />
        </div>

        <div 
          className="faq-scroll-wrapper gpu-accelerated absolute inset-0 w-full h-full structural-layer overflow-hidden"
          style={{ 
            zIndex: 70, 
            visibility: "hidden", 
            transform: "translateY(100%)" 
          }}
        >
          <FAQSection />
        </div>

        <div 
          className="footer-scroll-wrapper gpu-accelerated absolute inset-0 w-full h-full flex flex-col justify-end pointer-events-none"
          style={{ 
            zIndex: 80, 
            visibility: "hidden", 
            transform: "translateY(100%)" 
          }}
        >
          <div className="w-full pointer-events-auto">
            <Footer />
          </div>
        </div>

      </div>
    </div>
  );
}