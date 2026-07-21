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

type SubServicesDesktopProps = {
  preloaderDone: boolean;
  pageData: FullServiceData;
};

export default function SingleProjectPageDesktop({ preloaderDone, pageData }: SubServicesDesktopProps) {
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

  // 2. Lock body scroll during preload/intro sequences
  useEffect(() => {
    const locked = !preloaderDone || !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [preloaderDone, introDone]);

  // 3. Offscreen layout setup
  useLayoutEffect(() => {
    if (!preloaderDone) return;

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
      gsap.set(".faq-content", { opacity: 1 });

      // Keep wrapper visible to allow child animations, but prepare text for intro stagger
      gsap.set(".hero-text-wrap", { autoAlpha: 1 });
      gsap.set([".hero-title", ".hero-description"], { autoAlpha: 0, y: 30 });

      const layers = gsap.utils.toArray<HTMLElement>(".hero-image-layer");
      if (layers.length > 0) {
        const firstInnerImg = layers[0].querySelector(".hero-image-inner");
        if (firstInnerImg) {
          gsap.set(firstInnerImg, { scale: 1.6, transformOrigin: "center center" });
        }
      }
    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  // 4. Play Intro Cinematic Animation
  useEffect(() => {
    if (!preloaderDone) return;

    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({
        onComplete: () => setIntroDone(true)
      });

      const layers = gsap.utils.toArray<HTMLElement>(".hero-image-layer");
      const firstInnerImg = layers[0]?.querySelector(".hero-image-inner");

      introTl
        .to(firstInnerImg, { scale: 1.3, duration: 2.2, ease: "power2.out" }, 0)
        .to(".hero-title", { autoAlpha: 1, y: 0, duration: 1.4, ease: "power3.out" }, 0.4)
        .to(".hero-description", { autoAlpha: 1, y: 0, duration: 1.4, ease: "power3.out" }, 0.6);
    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  // 5. Master Single ScrollTrigger Timeline
  useEffect(() => {
    if (!introDone || !preloaderDone) return;

    if (isTouchOnly()) {
      ScrollTrigger.normalizeScroll(true);
    }

    let vvCleanup: (() => void) | null = null;

    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(0);

      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize",
      });

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
      const scrubValue = 1.2;

      const triggerInfoHook = (nextIdx: number) => {
        if (nextIdx !== lastInfoIdx.current) {
          lastInfoIdx.current = nextIdx;
          if ((window as any)._projectInfoGoTo) {
            (window as any)._projectInfoGoTo(nextIdx);
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

        const scrollTl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ".master-viewport",
            start: "top top",
            end: `+=18000`,
            pin: true,
            pinSpacing: true,
            scrub: scrubValue,
            anticipatePin: 1,
            preventOverlaps: true,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
            snap: {
              snapTo: (progress) => {
                const labels = Object.keys(scrollTl.labels).map(
                  name => scrollTl.labels[name] / scrollTl.totalDuration()
                );
                labels.sort((a, b) => a - b);

                const currentProg = scrollTl.progress();
                const isForward = scrollTl.scrollTrigger ? scrollTl.scrollTrigger.direction > 0 : true;

                for (let i = 0; i < labels.length - 1; i++) {
                  const start = labels[i];
                  const end = labels[i + 1];

                  if (currentProg >= start && currentProg <= end) {
                    const localProgress = (currentProg - start) / (end - start);

                    if (isForward) {
                      return localProgress >= 0.35 ? end : start;
                    } else {
                      return localProgress <= 0.40 ? start : end;
                    }
                  }
                }
                return progress;
              },
              duration: { min: 0.3, max: 0.6 },
              delay: 0.01,
              ease: "power1.inOut"
            }
          }
        });

        // ── HERO TRANSITION & INFO PANEL SLIDE UP ──
        scrollTl.addLabel("start", 0);

        scrollTl.set(".project-info-wrap", { visibility: "visible" }, 0)
                .to(".project-info-wrap", { 
                  yPercent: 0, 
                  duration: 2.0,
                  ease: "power2.out",
                  onStart: () => setIsProjectInfoActive(true),
                  onReverseComplete: () => {
                    setIsProjectInfoActive(false);
                    triggerInfoHook(0);
                  }
                }, 0);

        scrollTl.to(".hero-text-wrap", { autoAlpha: 0, y: -60, duration: 1.5 }, 0);

        scrollTl.call(() => triggerInfoHook(0), [], 1.0);

        // ── INNER INFO SLIDES SWITCHING ──
        if (infoSlides.length > 0) {
          infoSlides.forEach((_, index) => {
            if (index === 0) return;

            const slideLabel = `info_slide_${index}`;
            scrollTl.addLabel(slideLabel);

            const currentImgLayer = `.info-img-layer-${index}`;
            const innerImage = `${currentImgLayer} .info-image-inner`;

            scrollTl.to(currentImgLayer, {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              duration: 2.5,
              ease: "power2.inOut"
            }, slideLabel);

            scrollTl.fromTo(innerImage, 
              { scale: 1.25 },
              { scale: 1.0, duration: 2.5, ease: "power2.out" },
              slideLabel
            );

            scrollTl.call(() => {
              const isForward = scrollTl.scrollTrigger ? scrollTl.scrollTrigger.direction > 0 : true;
              triggerInfoHook(isForward ? index : index - 1);
            }, [], `${slideLabel}+=1.0`);
          });
        }

        scrollTl.addLabel("infoSlidesEnd");
        scrollTl.to({}, { duration: 1.5 }, "infoSlidesEnd");

        // ── APP SECTION SLIDE UP OVER INFO WRAP ──
        scrollTl.addLabel("appSectionStart");

        scrollTl.set(".project-app-wrap", { visibility: "visible" }, "appSectionStart")
                .to(".project-app-wrap", { yPercent: 0, duration: 2.0, ease: "power2.inOut" }, "appSectionStart");

        scrollTl.to(
          ".appsec-phone-wrapper",
          { y: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
          "appSectionStart+=0.5"
        );

        // ── FAQ SECTION SLIDES UP ──
        scrollTl.addLabel("faqStart", "appSectionStart+=2.0");
        scrollTl.set(".faq-scroll-wrapper", { visibility: "visible" }, "faqStart")
                .to(".faq-scroll-wrapper", { yPercent: 0, ease: "power2.inOut", duration: 2.0 }, "faqStart");

        // ── COMBINED FAQ FADE & FOOTER SLIDE ──
        scrollTl.addLabel("footerStart", "faqStart+=2.0");
        
        scrollTl.to(".faq-content", { opacity: 0, y: -30, ease: "power2.in", duration: 1.0 }, "footerStart");
        
        scrollTl.set(".footer-scroll-wrapper", { visibility: "visible" }, "footerStart")
                .to(".footer-scroll-wrapper", { yPercent: 0, ease: "power2.out", duration: 2.0 }, "footerStart");

        scrollTl.addLabel("end");
      };

      // 🌟 FIXED: Instantly builds the timeline on the next animation frame
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
      <div className="master-viewport relative w-full h-screen overflow-hidden bg-black" style={{ visibility: "visible" }}>
        
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