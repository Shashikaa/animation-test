"use client";

import { useRef, useEffect, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectScrollHero from "@/src/components/Projects/ProjectScrollHero";
import SectionCTA from "@/src/components/SectionCTA";
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

  // Reset scroll position on refresh
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    document.body.classList.remove("preloading");
  }, []);

  // Handle body overflow locking logic during initial rendering
  useEffect(() => {
    const locked = !preloaderDone || !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [preloaderDone, introDone]);

  // 1. Establish precise starting layouts cleanly before paint
  useLayoutEffect(() => {
    if (!preloaderDone) return;
    
    const ctx = gsap.context(() => {
      // Clear inline placement values to avoid rendering flashes
      gsap.set([".project-hero-layer", ".project-section-cta", ".project-footer-wrap"], { clearProps: "transform" });

      gsap.set(".project-hero-layer", { zIndex: 10, yPercent: 0 });
      gsap.set(".project-section-cta", { yPercent: 100, zIndex: 150, visibility: "hidden" });
      gsap.set([".project-section-cta .cta-inner-mobile", ".project-section-cta .cta-inner-desktop"], { opacity: 1, y: 0 });
      gsap.set(".project-footer-wrap", { yPercent: 100, zIndex: 151, visibility: "hidden" });
      
      gsap.set(".hero-title", { opacity: 0, y: 20 });
      
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

  // 2. Play Intro Cinematic (Smooth zoom out from 1.6 down to 1.3)
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
        .to(".hero-title", { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }, 0.3);
    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  // 3. Integrated Master Single Scroll Timeline Controller
  useEffect(() => {
    if (!introDone || !preloaderDone) return;

    const ctx = gsap.context(() => {
      const imagesElements = gsap.utils.toArray<HTMLElement>(".hero-image-layer");
      let cachedProgressLabels: number[] = [];
      const labelNames: string[] = [];

      const ACTION = 2.0;
      const DEAD_SCROLL = 0.4;

      const scrollTl = gsap.timeline({
        defaults: { ease: "none" }
      });

      // ── STEP A: HERO TEXT FADEOUT ──
      scrollTl.addLabel("slide-0", 0);
      scrollTl.to(".hero-text-wrap", { opacity: 0, y: -40, duration: 2.0 }, 0)
              .set(".hero-text-wrap", { visibility: "hidden" });
      
      // ── STEP B: MODERN DIRECTIONAL CLIP-PATH REVEALS ──
      if (imagesElements.length > 0) {
        imagesElements.forEach((layer, index) => {
          const imgInner = layer.querySelector(".hero-image-inner");

          if (index === 0) {
            if (imgInner) {
              scrollTl.to(imgInner, { scale: 1.02, duration: 2.0 }, 0);
            }
            return;
          }

          const labelName = `slide-${index}`;
          labelNames.push(labelName);
          scrollTl.addLabel(labelName); 

          scrollTl.fromTo(
            layer,
            { clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" },
            { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 3.0 },
            labelName
          );

          if (imgInner) {
            scrollTl.fromTo(
              imgInner,
              { scale: 1.22, xPercent: 6 },
              { scale: 1.05, xPercent: 0, duration: 3.0 },
              labelName
            );
          }
        });
      }

      // ── STEP C: UNIFIED TRANSITION TO CTA SECTION ──
      labelNames.push("ctaStart");
      scrollTl.addLabel("ctaStart", ">");
      
      scrollTl.set(".project-section-cta", { visibility: "visible" }, "ctaStart")
              .to(".project-section-cta", { yPercent: 0, duration: ACTION, ease: "none" }, "ctaStart")
              .to(".project-hero-layer", { yPercent: -10, duration: ACTION, ease: "none" }, "ctaStart");

      scrollTl.to({}, { duration: DEAD_SCROLL });

      // ── STEP D: UNIFIED TRANSITION: CTA -> FOOTER ──
      labelNames.push("footerStart");
      scrollTl.addLabel("footerStart", ">");
      
      scrollTl.to([".project-section-cta .cta-inner-mobile", ".project-section-cta .cta-inner-desktop"], { 
        opacity: 0, 
        duration: ACTION * 0.3, 
        ease: "none" 
      }, "footerStart")
        .set(".project-footer-wrap", { visibility: "visible" }, "footerStart+=0.1")
        .to(".project-footer-wrap", { yPercent: 0, duration: ACTION, ease: "none" }, "footerStart+=0.1")
        .to(".project-hero-layer", { yPercent: -20, duration: ACTION, ease: "none" }, "footerStart+=0.1");

      // ── STEP SNAPPING CONTROLLER CALCULATOR ──
      const totalDuration = scrollTl.totalDuration();
      cachedProgressLabels = [0, ...labelNames.map(name => scrollTl.labels[name] / totalDuration), 1];

      ScrollTrigger.create({
        animation: scrollTl,
        trigger: ".master-viewport",
        start: "top top",
        end: `+=${imagesElements.length * 1200 + 4500}`, 
        pin: true,
        pinSpacing: true,
        scrub: 1.2, 
        anticipatePin: 1, 
        invalidateOnRefresh: true,
        snap: {
          snapTo: (progress) => {
            if (cachedProgressLabels.length === 0) return progress;
            if (progress <= 0) return 0;
            if (progress >= 1) return 1;

            for (let i = 0; i < cachedProgressLabels.length - 1; i++) {
              const start = cachedProgressLabels[i];
              const end = cachedProgressLabels[i + 1];

              if (progress >= start && progress <= end) {
                const localProgress = (progress - start) / (end - start);
                return localProgress > 0.3 ? end : start;
              }
            }
            return progress;
          },
          duration: { min: 0.6, max: 1.1 }, 
          delay: 0.03, 
          ease: "power2.inOut"
        }
      });

    }, scopeRef);

    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      ctx.revert();
      clearTimeout(refreshTimeout);
    };
  }, [introDone, preloaderDone, pageData.images, pageData.title]);

  return (
    <div 
      ref={scopeRef} 
      className={`w-full relative bg-[#131313] ${!introDone ? "h-screen overflow-hidden" : "overflow-x-hidden"}`}
    >
      <div className="master-viewport relative w-full h-screen overflow-hidden">
        
        {/* Layer 1: Presentational Project Hero Stack */}
        <div className="project-hero-layer absolute inset-0 w-full h-full z-10">
          <ProjectScrollHero 
            title={pageData.title}
            images={pageData.images || []}
          />
        </div>

        {/* Layer 2: Mobile/Desktop Responsive CTA Layer Container */}
        <div 
          className="project-section-cta absolute inset-0 w-full h-full bg-white z-[150]" 
          style={{ 
            pointerEvents: "auto", 
            visibility: "hidden",
            transform: "translateY(100%)"
          }}
        >
          <SectionCTA />
        </div>

        {/* Layer 3: Pinned Full Footer Assembly Wrapper Frame */}
        <div 
          className="project-footer-wrap absolute left-0 bottom-0 w-full z-[151]" 
          style={{ 
            pointerEvents: "auto", 
            visibility: "hidden",
            transform: "translateY(100%)"
          }}
        >
          <Footer />
        </div>

      </div>
    </div>
  );
}