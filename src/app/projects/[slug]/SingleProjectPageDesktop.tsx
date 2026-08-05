"use client";

import { useRef, useEffect, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectScrollHero from "@/src/components/Projects/ProjectScrollHero";
import ProjectInfoSlide from "@/src/components/Projects/ProjectInfoSlide";
import Appsection from "@/src/components/Projects/Appsection";
import FAQSection from "@/src/components/contact/FAQSection";
import Footer from "@/src/components/Footer";
import { useSite } from "@/src/app/context/SiteContext";
import { FullServiceData } from "./data";

gsap.registerPlugin(ScrollTrigger);

const isTouchOnly = () => ScrollTrigger.isTouch === 1;

// Standardized Desktop Metrics (Matched to Home Setup)
const PX_PER_MAIN_PANEL = 1000;
const PX_PER_SUB_STEP = 600;
const PAUSE_PX = 350;

type SubServicesDesktopProps = {
  pageData: FullServiceData;
};

export default function SingleProjectPageDesktop({ pageData }: SubServicesDesktopProps) {
  const { setPreloaderDone, preloaderDone } = useSite();
  const scopeRef = useRef<HTMLDivElement>(null);
  
  const [introDone, setIntroDone] = useState(false);
  const [isProjectInfoActive, setIsProjectInfoActive] = useState(false);
  const lastInfoIdx = useRef<number>(-1);

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

  // Offscreen layout setup
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "DOMContentLoaded,load,visibilitychange,resize",
      });

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

      gsap.set(".project-info-wrap", { yPercent: 100, visibility: "hidden", zIndex: 50, force3D: true });
      gsap.set(".project-app-wrap", { yPercent: 100, visibility: "hidden", zIndex: 60, force3D: true });
      gsap.set(".faq-scroll-wrapper", { yPercent: 100, visibility: "hidden", zIndex: 70, force3D: true });
      gsap.set(".footer-scroll-wrapper", { yPercent: 100, visibility: "hidden", zIndex: 80, force3D: true });
      gsap.set(".faq-content", { opacity: 1, force3D: true });

      gsap.set(".hero-text-wrap", { autoAlpha: 1 });
      gsap.set([".hero-title", ".hero-description"], { autoAlpha: 0, y: 30, force3D: true });

      const layers = gsap.utils.toArray<HTMLElement>(".hero-image-layer");
      if (layers.length > 0) {
        const firstInnerImg = layers[0].querySelector(".hero-image-inner");
        if (firstInnerImg) {
          gsap.set(firstInnerImg, { scale: 1.4, force3D: true, transformOrigin: "center center" });
        }
      }
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  // Hero Intro Cinematic Sequence
  useEffect(() => {
    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({
        onComplete: () => {
          setIntroDone(true);
        }
      });

      const layers = gsap.utils.toArray<HTMLElement>(".hero-image-layer");
      const firstInnerImg = layers[0]?.querySelector(".hero-image-inner");

      introTl
        .to(firstInnerImg, { scale: 1.15, duration: 1.5, ease: "power2.out" }, 0)
        .to([".hero-title", ".hero-description"], { 
          autoAlpha: 1, 
          y: 0, 
          duration: 1.0, 
          stagger: 0.15, 
          ease: "power2.out" 
        }, 0.2);
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  // Master Single ScrollTrigger Timeline
  useEffect(() => {
    if (!introDone || !preloaderDone) return;

    if (isTouchOnly()) {
      ScrollTrigger.normalizeScroll(true);
    }

    let vvCleanup: (() => void) | null = null;

    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(500, 33);

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

      const infoSlides = pageData.slides || [];

      // Unified dispatch helper for slide index changes
      const triggerInfoHook = (targetIdx: number) => {
        if (targetIdx !== lastInfoIdx.current) {
          lastInfoIdx.current = targetIdx;
          if (typeof (window as any)._projectInfoGoTo === "function") {
            (window as any)._projectInfoGoTo(targetIdx);
          }
        }
      };

      const buildTimeline = () => {
        ScrollTrigger.refresh();

        const vv = typeof visualViewport !== "undefined" ? visualViewport : null;
        if (vv) {
          const onVVResize = () => ScrollTrigger.refresh(true);
          vv.addEventListener("resize", onVVResize);
          vvCleanup = () => vv.removeEventListener("resize", onVVResize);
        }

        gsap.set(".appsec-phone-wrapper", { y: 40, opacity: 0 });

        // Standardized Duration Metrics (Matched to Home Setup)
        const PANEL_ACTION = 2.0;
        const SUB_ACTION = 1.8;
        const PAUSE_ACTION = 0.4;

        const innerSlideSteps = Math.max(infoSlides.length - 1, 0);
        const MAIN_PANELS_COUNT = 4; 
        const PAUSES_COUNT = 4;

        const DYNAMIC_SCROLL_TRACK =
          (MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL) +
          (innerSlideSteps * PX_PER_SUB_STEP) +
          (PAUSES_COUNT * PAUSE_PX);

        const scrollTl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ".single-project-pin",
            start: "top top",
            end: `+=${DYNAMIC_SCROLL_TRACK}`,
            pin: true,
            pinSpacing: true,
            scrub: 1,
            anticipatePin: 1,
            preventOverlaps: true,
            invalidateOnRefresh: true,
          }
        });

        // ── HERO TRANSITION & INFO PANEL SLIDE UP ──
        scrollTl.addLabel("start", 0);

        scrollTl.set(".project-info-wrap", { visibility: "visible" }, "start")
                .to(".project-info-wrap", { 
                  yPercent: 0, 
                  duration: PANEL_ACTION,
                  ease: "power2.inOut",
                  onStart: () => setIsProjectInfoActive(true),
                  onReverseComplete: () => {
                    setIsProjectInfoActive(false);
                    triggerInfoHook(0);
                  }
                }, "start");

        scrollTl.to(".hero-text-wrap", { autoAlpha: 0, y: -60, duration: PANEL_ACTION * 0.75 }, "start");

        scrollTl.addLabel("info_slide_0", PANEL_ACTION);
        scrollTl.call(() => triggerInfoHook(0), [], PANEL_ACTION);

        // ── SYNCHRONIZED INNER SLIDES & REVERSE HOOKS ──
        if (infoSlides.length > 0) {
          infoSlides.forEach((_, index) => {
            if (index === 0) return;

            const slideLabel = `info_slide_${index}`;
            const currentImgLayer = `.info-img-layer-${index}`;
            const innerImage = `${currentImgLayer} .info-image-inner`;

            // Forward transition start trigger
            scrollTl.call(() => {
              const isForward = scrollTl.scrollTrigger ? scrollTl.scrollTrigger.direction > 0 : true;
              if (isForward) {
                triggerInfoHook(index);
              }
            }, [], `+=0.1`);

            // Synchronized image clip-path reveal & scale animation
            scrollTl.to(currentImgLayer, {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              duration: SUB_ACTION,
              ease: "power2.inOut"
            })
            .fromTo(innerImage, 
              { scale: 1.25 },
              { scale: 1.0, duration: SUB_ACTION, ease: "power2.out" },
              "<"
            )
            .addLabel(slideLabel);

            // Backward transition trigger
            scrollTl.call(() => {
              const isForward = scrollTl.scrollTrigger ? scrollTl.scrollTrigger.direction > 0 : true;
              if (!isForward) {
                triggerInfoHook(index - 1);
              }
            }, [], slideLabel);
          });
        }

        scrollTl.addLabel("infoSlidesEnd");
        scrollTl.to({}, { duration: PAUSE_ACTION });

        // ── APP SECTION SLIDE UP OVER INFO WRAP ──
        scrollTl.addLabel("appSectionStart", ">");

        scrollTl.set(".project-app-wrap", { visibility: "visible" }, "appSectionStart")
                .to(".project-app-wrap", { yPercent: 0, duration: PANEL_ACTION, ease: "power2.inOut" }, "appSectionStart");

        scrollTl.to(
          ".appsec-phone-wrapper",
          { y: 0, opacity: 1, duration: PANEL_ACTION * 0.8, ease: "power2.out" },
          `appSectionStart+=${PANEL_ACTION * 0.1}`
        );

        scrollTl.to({}, { duration: PAUSE_ACTION });

        // ── FAQ SECTION SLIDES UP ──
        scrollTl.addLabel("faqStart", ">");
        scrollTl.set(".faq-scroll-wrapper", { visibility: "visible" }, "faqStart")
                .to(".faq-scroll-wrapper", { yPercent: 0, ease: "power2.inOut", duration: PANEL_ACTION }, "faqStart");

        scrollTl.to({}, { duration: PAUSE_ACTION });

        // ── FAQ CONTENT FADE OUT FIRST (MATCHING HOME & CONTACT) ──
        scrollTl.addLabel("ctaFadeOut", ">")
          .to(".faq-content", { 
            opacity: 0, 
            y: -40, 
            duration: PANEL_ACTION * 0.5, 
            ease: "power2.in" 
          }, "ctaFadeOut")
          .to({}, { duration: 0 });

        // ── FOOTER SLIDE UP ──
        scrollTl.addLabel("footerStart", ">");
        scrollTl.set(".footer-scroll-wrapper", { visibility: "visible" }, "footerStart")
                .to(".footer-scroll-wrapper", { yPercent: 0, ease: "power2.out", duration: PANEL_ACTION }, "footerStart");

        scrollTl.addLabel("end");
      };

      requestAnimationFrame(buildTimeline);

    }, scopeRef);

    return () => {
      vvCleanup?.();
      if (isTouchOnly()) {
        ScrollTrigger.normalizeScroll(false);
      }
      ctx.revert();
    };
  }, [introDone, preloaderDone, pageData.images, pageData.slides, pageData.title]);

  return (
    <div 
      ref={scopeRef} 
      className={`w-full relative ${!introDone ? "h-screen overflow-hidden" : "overflow-x-hidden"}`}
    >
      <div className="single-project-pin relative w-full h-screen overflow-hidden bg-black" style={{ visibility: "visible" }}>
        
        {/* Layer 1: Presentation Hero Canvas */}
        <div className="project-hero-master absolute inset-0 w-full h-full">
          <ProjectScrollHero 
            title={pageData.title}
            description={pageData.description}
            images={pageData.images || []}
          />
        </div>

        {/* Layer 2: Interactive Project Info Overlay Panel */}
        <div 
          className="project-info-wrap absolute inset-0 w-full h-full structural-layer"
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

        {/* Layer 3: App Section Overlay Panel */}
        <div 
          className="project-app-wrap absolute inset-0 w-full h-full structural-layer"
          style={{ 
            zIndex: 60, 
            visibility: "hidden", 
            transform: "translateY(100%)" 
          }}
        >
          <Appsection />
        </div>

        {/* Layer 4: FAQ Section Overlay Panel */}
        <div 
          className="faq-scroll-wrapper absolute inset-0 w-full h-full structural-layer"
          style={{ 
            zIndex: 70, 
            visibility: "hidden", 
            transform: "translateY(100%)" 
          }}
        >
          <FAQSection />
        </div>

        {/* Layer 5: Master Footer Overlay Panel */}
        <div 
          className="footer-scroll-wrapper absolute inset-0 w-full h-full flex flex-col justify-end pointer-events-none"
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