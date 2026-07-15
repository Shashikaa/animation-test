"use client";

import { useRef, useEffect, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectScrollHero from "@/src/components/Projects/ProjectScrollHero";
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";
import { FullServiceData } from "./data";

gsap.registerPlugin(ScrollTrigger);

type SubServicesDesktopProps = {
  preloaderDone: boolean;
  pageData: FullServiceData;
};

export default function SingleProjectPageDesktop({ preloaderDone, pageData }: SubServicesDesktopProps) {
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

  // Sync scroll locking state with global loading systems
  useEffect(() => {
    const locked = !preloaderDone || !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [preloaderDone, introDone]);

  // 1. Establish precise starting positions cleanly before paint
  useLayoutEffect(() => {
    if (!preloaderDone) return;

    const ctx = gsap.context(() => {
      gsap.set(".project-hero-master", { zIndex: 10 });
      
      // Clear inline hardware transforms before initializing GSAP to secure dimensional constraints
      gsap.set([".project-section-cta", ".project-footer-wrap"], { clearProps: "transform" });
      
      gsap.set([".project-section-cta", ".project-footer-wrap"], { yPercent: 100, visibility: "hidden" });
      gsap.set(".project-section-cta", { zIndex: 70 });
      gsap.set(".project-footer-wrap", { zIndex: 80 });

      // Initialize typography text layers hidden
      gsap.set(".hero-title", { opacity: 0, y: 30 });

      // Match main page setup: Explicitly set the base scale target to 1.6
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
        .to(".hero-title", { opacity: 1, y: 0, duration: 1.4, ease: "power3.out" }, 0.4);
    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  // 3. Master Single ScrollTrigger Timeline
  useEffect(() => {
    if (!introDone || !preloaderDone) return;

    const ctx = gsap.context(() => {
      const imagesElements = gsap.utils.toArray<HTMLElement>(".hero-image-layer");
      let cachedProgressLabels: number[] = [];

      const scrollTl = gsap.timeline({
        defaults: { ease: "none" }
      });

      // ── STEP A: HERO TEXT FADEOUT ──
      scrollTl.addLabel("slide-0", 0);
      scrollTl.to(".hero-text-wrap", { opacity: 0, y: -60, duration: 2.0 }, 0)
              .set(".hero-text-wrap", { visibility: "hidden" });

      // ── STEP B: MODERN CLIP-PATH REVEALS ──
      const labelNames: string[] = [];

      if (imagesElements.length > 0) {
        imagesElements.forEach((layer, index) => {
          const imgInner = layer.querySelector(".hero-image-inner");

          if (index === 0) {
            if (imgInner) {
              scrollTl.to(imgInner, { scale: 1.05, duration: 2.0 }, 0);
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
              { scale: 1.25, xPercent: 8 },
              { scale: 1.05, xPercent: 0, duration: 3.0 },
              labelName
            );
          }
        });
      }

      // ── STEP C: CTA REVEAL TRACK ──
      labelNames.push("ctaStart");
      scrollTl.addLabel("ctaStart");
      scrollTl.set(".project-section-cta", { visibility: "visible" }, "ctaStart")
              .to(".project-section-cta", { yPercent: 0, duration: 4.8 }, "ctaStart");

      // ── STEP D: FOOTER REVEAL TRACK ──
      labelNames.push("footerStart");
      scrollTl.addLabel("footerStart", "ctaStart+=4.8");
      
      scrollTl.set(".project-footer-wrap", { visibility: "visible" }, "footerStart")
        .to(".project-footer-wrap", { yPercent: 0, duration: 5.5 }, "footerStart")
        .to(".project-section-cta .cta-inner-desktop", { opacity: 0, duration: 4.0, ease: "power1.out" }, "footerStart");

      // ── ADVANCED STEP SNAPPING CONFIGURATION ──
      const totalDuration = scrollTl.totalDuration();
      cachedProgressLabels = [0, ...labelNames.map(name => scrollTl.labels[name] / totalDuration), 1];

      ScrollTrigger.create({
        animation: scrollTl,
        trigger: ".master-viewport",
        end: `+=${imagesElements.length * 1500 + 4000}`, 
        pin: true,
        pinSpacing: true,
        scrub: 0.8, 
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
          duration: { min: 0.8, max: 1.4 }, 
          delay: 0.05, 
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
      className={`w-full relative ${!introDone ? "h-screen overflow-hidden" : "overflow-x-hidden"}`}
    >
      <div className="master-viewport relative w-full h-screen overflow-hidden bg-black">
        
        {/* Layer 1: Presentation Hero Canvas */}
        <div className="project-hero-master absolute inset-0 w-full h-full">
          <ProjectScrollHero 
            title={pageData.title}
            images={pageData.images || []}
          />
        </div>

        {/* Layer 2: CTA Overlay Wrapper */}
        <div 
          className="project-section-cta absolute bottom-0 left-0 w-full structural-layer"
          style={{ 
            zIndex: 70, 
            visibility: "hidden", 
            transform: "translateY(100%)" 
          }}
        >
          <SectionCTA />
        </div>
        
        {/* Layer 3: Pinned Master Footer Wrapper */}
        <div 
          className="project-footer-wrap absolute left-0 bottom-0 w-full structural-layer"
          style={{ 
            zIndex: 80, 
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