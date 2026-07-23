"use client";

import { useRef, useEffect, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectScrollHero from "@/src/components/Projects/ProjectScrollHero";
import ProjectInfoSlide from "@/src/components/Projects/ProjectInfoSlide";
import Appsection from "@/src/components/Projects/Appsection";
import FAQSection from "@/src/components/contact/FAQSection";
import Footer from "@/src/components/Footer";
import { FullServiceData } from "./data";

gsap.registerPlugin(ScrollTrigger);

type SubServicesMobileProps = {
  preloaderDone: boolean;
  pageData: FullServiceData;
};

export default function SingleProjectPageMobile({ preloaderDone, pageData }: SubServicesMobileProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const [introDone, setIntroDone] = useState(false);
  const [isProjectInfoActive, setIsProjectInfoActive] = useState(false);
  const lastInfoIdx = useRef<number>(-1);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    document.body.classList.remove("preloading");
  }, []);

  // Lock body scroll during intro cleanly
  useEffect(() => {
    const locked = !preloaderDone || !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [preloaderDone, introDone]);

  // Refresh ScrollTrigger only on width/orientation change
  useEffect(() => {
    if (typeof window === "undefined") return;

    let lastWidth = window.innerWidth;

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (currentWidth !== lastWidth) {
        lastWidth = currentWidth;
        ScrollTrigger.refresh();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useLayoutEffect(() => {
    if (!preloaderDone) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "DOMContentLoaded,load,visibilitychange",
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

      gsap.set(".project-info-wrap", { yPercent: 100, visibility: "hidden", zIndex: 50 });
      gsap.set(".project-app-wrap", { yPercent: 100, visibility: "hidden", zIndex: 60 });
      gsap.set(".faq-scroll-wrapper", { yPercent: 100, visibility: "hidden", zIndex: 70 });
      gsap.set(".footer-scroll-wrapper", { yPercent: 100, visibility: "hidden", zIndex: 80 });
      gsap.set(".faq-content", { opacity: 1, y: 0 });

      gsap.set(".hero-text-wrap", { autoAlpha: 1 });
      gsap.set([".hero-title", ".hero-description"], { autoAlpha: 0, y: 20 });

      const layers = gsap.utils.toArray<HTMLElement>(".hero-image-layer");
      if (layers.length > 0) {
        const firstInnerImg = layers[0].querySelector(".hero-image-inner");
        if (firstInnerImg) {
          gsap.set(firstInnerImg, { scale: 1.5, transformOrigin: "center center" });
        }
      }
    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  // Hero Intro Sequence
  useEffect(() => {
    if (!preloaderDone) return;

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
        .to(firstInnerImg, { scale: 1.25, duration: 1.8, ease: "power2.out" }, 0)
        .to(".hero-title", { autoAlpha: 1, y: 0, duration: 1.0, ease: "power3.out" }, 0.2)
        .to(".hero-description", { autoAlpha: 1, y: 0, duration: 1.0, ease: "power3.out" }, 0.4);
    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  // Master Scroll Timeline
  useEffect(() => {
    if (!introDone || !preloaderDone) return;

    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(0);

      ScrollTrigger.normalizeScroll(false);

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

      gsap.set(".appsec-phone-wrapper", { y: 30, opacity: 0 });

      const scrollTl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ".master-viewport",
          start: "top top",
          end: `+=8500`, // Slightly tightened to keep the snappy response
          pin: true,
          pinType: "fixed",
          pinSpacing: true,
          scrub: scrubValue,
          anticipatePin: 1,
          preventOverlaps: true,
          fastScrollEnd: true,
          invalidateOnRefresh: false,
        }
      });

      // ── STEP A: HERO TRANSITION & INFO SECTION SLIDE UP (HOME SPEED MATCH) ──
      scrollTl.addLabel("start", 0);

      scrollTl.to(".hero-text-wrap", { 
        autoAlpha: 0, 
        y: -30, 
        duration: 1.0, 
        ease: "power1.inOut" 
      }, 0);

      scrollTl.set(".project-info-wrap", { visibility: "visible" }, 0)
              .to(".project-info-wrap", { 
                yPercent: 0, 
                duration: 1.8, 
                ease: "power2.inOut",
                onStart: () => setIsProjectInfoActive(true),
                onReverseComplete: () => {
                  setIsProjectInfoActive(false);
                  triggerInfoHook(0);
                }
              }, 0);

      scrollTl.call(() => {
        triggerInfoHook(0);
      }, [], 0.8);

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
            duration: 3.5,
            ease: "power2.inOut"
          }, slideLabel);

          scrollTl.fromTo(innerImage, 
            { scale: 1.25 },
            { scale: 1.0, duration: 3.5, ease: "power2.out" },
            slideLabel
          );

          scrollTl.call(() => {
            const isForward = scrollTl.scrollTrigger ? scrollTl.scrollTrigger.direction > 0 : true;
            triggerInfoHook(isForward ? index : index - 1);
          }, [], `${slideLabel}+=1.5`);
        });
      }

      scrollTl.to({}, { duration: 1.5 });

      // ── STEP C: APP SECTION SLIDES UP OVER INFO WRAP ──
      scrollTl.addLabel("appSectionStart");

      scrollTl.set(".project-app-wrap", { visibility: "visible" }, "appSectionStart")
              .to(".project-app-wrap", { yPercent: 0, duration: 3.5, ease: "power2.inOut" }, "appSectionStart");

      scrollTl.to(
        ".appsec-phone-wrapper",
        { y: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
        "appSectionStart+=1.0"
      );

      // ── STEP D: FAQ SECTION SLIDES UP OVER APP WRAP ──
      scrollTl.addLabel("faqStart", "appSectionStart+=3.5");

      scrollTl.set(".faq-scroll-wrapper", { visibility: "visible" }, "faqStart")
              .to(".faq-scroll-wrapper", { yPercent: 0, ease: "power2.inOut", duration: 3.5 }, "faqStart");

      // ── STEP E: SYNCHRONIZED FAQ FADE-OUT & FOOTER SLIDE-UP ──
      scrollTl.addLabel("footerStart", "faqStart+=3.5");

      scrollTl.to(
        ".faq-content", 
        { 
          opacity: 0, 
          y: -40, 
          duration: 1.0, 
          ease: "power2.in",
          pointerEvents: "none" 
        }, 
        "footerStart"
      );

      scrollTl.set(".footer-scroll-wrapper", { visibility: "visible" }, "footerStart")
              .fromTo(
                ".footer-scroll-wrapper",
                { yPercent: 100 },
                { yPercent: 0, ease: "power2.out", duration: 2.5 },
                "footerStart"
              );

      scrollTl.addLabel("end");

    }, scopeRef);

    return () => {
      ctx.revert();
    };
  }, [introDone, preloaderDone, pageData.images, pageData.slides, pageData.title]);

  return (
    <div 
      ref={scopeRef} 
      className="w-full relative min-h-screen bg-black text-white overflow-hidden"
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
          className="project-app-wrap gpu-accelerated absolute inset-x-0 bottom-0 w-full h-[120vh] min-h-[120vh] structural-layer"
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