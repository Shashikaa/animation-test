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

// Controlled Desktop Scroll Metrics
const PX_PER_MAIN_PANEL = 1150;
const PX_PER_SUB_STEP = 450;
const PAUSE_PX = 100;

type SubServicesDesktopProps = {
  pageData: FullServiceData;
};

export default function SingleProjectPageDesktop({ pageData }: SubServicesDesktopProps) {
  const { setPreloaderDone } = useSite();
  const scopeRef = useRef<HTMLDivElement>(null);
  
  const [introDone, setIntroDone] = useState(false);
  const [isProjectInfoActive, setIsProjectInfoActive] = useState(false);
  const lastInfoIdx = useRef<number>(-1);

  // 1. Scroll restoration & initialization
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    document.body.classList.remove("preloading");
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  // 2. Lock body scroll during intro sequence
  useEffect(() => {
    const locked = !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [introDone]);

  // 3. Offscreen layout setup
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

  // 4. Play Intro Cinematic Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({
        onComplete: () => {
          setIntroDone(true);
          setTimeout(() => ScrollTrigger.refresh(), 50);
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

  // 5. Master Single ScrollTrigger Timeline
  useEffect(() => {
    if (!introDone) return;

    if (isTouchOnly()) {
      ScrollTrigger.normalizeScroll(true);
    }

    let vvCleanup: (() => void) | null = null;

    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(0);

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

        const innerSlideSteps = Math.max(infoSlides.length - 1, 0);
        const MAIN_PANELS_COUNT = 4; 
        const PAUSES_COUNT = 3;

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
            snap: {
              directional: false,
              snapTo: (value, self) => {
                const totalDur = scrollTl.totalDuration();
                if (!totalDur) return value;

                const labelTimes = Array.from(
                  new Set(
                    Object.keys(scrollTl.labels).map(name =>
                      Number((scrollTl.labels[name] / totalDur).toFixed(5))
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
              ease: "power3.inOut"
            }
          }
        });

        // ── HERO TRANSITION & INFO PANEL SLIDE UP ──
        scrollTl.addLabel("start", 0);

        scrollTl.set(".project-info-wrap", { visibility: "visible" }, 0)
                .to(".project-info-wrap", { 
                  yPercent: 0, 
                  duration: 1.5,
                  ease: "power2.out",
                  onStart: () => setIsProjectInfoActive(true),
                  onReverseComplete: () => {
                    setIsProjectInfoActive(false);
                    triggerInfoHook(0);
                  }
                }, 0);

        scrollTl.to(".hero-text-wrap", { autoAlpha: 0, y: -60, duration: 1.2 }, 0);

        scrollTl.addLabel("info_slide_0", 1.5);
        scrollTl.call(() => triggerInfoHook(0), [], 1.5);

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
              duration: 1.5,
              ease: "power2.inOut"
            })
            .fromTo(innerImage, 
              { scale: 1.25 },
              { scale: 1.0, duration: 1.5, ease: "power2.out" },
              "<"
            )
            .addLabel(slideLabel);

            // Backward transition trigger (runs when scrubbing back past this label)
            scrollTl.call(() => {
              const isForward = scrollTl.scrollTrigger ? scrollTl.scrollTrigger.direction > 0 : true;
              if (!isForward) {
                triggerInfoHook(index - 1);
              }
            }, [], slideLabel);
          });
        }

        scrollTl.addLabel("infoSlidesEnd");

        // ── APP SECTION SLIDE UP OVER INFO WRAP ──
        scrollTl.addLabel("appSectionStart");

        scrollTl.set(".project-app-wrap", { visibility: "visible" }, "appSectionStart")
                .to(".project-app-wrap", { yPercent: 0, duration: 1.5, ease: "power2.inOut" }, "appSectionStart");

        scrollTl.to(
          ".appsec-phone-wrapper",
          { y: 0, opacity: 1, duration: 1.2, ease: "power2.out" },
          "appSectionStart+=0.3"
        );

        // ── FAQ SECTION SLIDES UP ──
        scrollTl.addLabel("faqStart", "appSectionStart+=1.5");
        scrollTl.set(".faq-scroll-wrapper", { visibility: "visible" }, "faqStart")
                .to(".faq-scroll-wrapper", { yPercent: 0, ease: "power2.inOut", duration: 1.5 }, "faqStart");

        // ── COMBINED FAQ FADE & FOOTER SLIDE ──
        scrollTl.addLabel("footerStart", "faqStart+=1.5");
        
        scrollTl.to(".faq-content", { opacity: 0, y: -30, ease: "power2.in", duration: 0.8 }, "footerStart");
        
        scrollTl.set(".footer-scroll-wrapper", { visibility: "visible" }, "footerStart")
                .to(".footer-scroll-wrapper", { yPercent: 0, ease: "power2.out", duration: 1.5 }, "footerStart");

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
  }, [introDone, pageData.images, pageData.slides, pageData.title]);

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