"use client";

import { useRef, useEffect, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectScrollHero from "@/src/components/Projects/ProjectScrollHero";
import SectionCTA from "@/src/components/SectionCTA";
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

  // Reset scroll position on refresh & register component ready status
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    document.body.classList.remove("preloading");
    setPreloaderDone(true);
  }, [setPreloaderDone]);

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

  // 3. Master Single ScrollTrigger Timeline with Uniform Snapping Setup
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

      // Unified hardware layer optimization targets matching standard site architecture
      const performanceTargets = [
        ".project-hero-master", ".hero-image-layer", ".hero-image-inner",
        ".project-section-cta", ".project-footer-wrap"
      ];

      performanceTargets.forEach(selector => {
        gsap.set(selector, {
          force3D: true,
          willChange: "transform, opacity, clip-path"
        });
      });

      const imagesElements = gsap.utils.toArray<HTMLElement>(".hero-image-layer");
      const scrubValue = 1.2; // Standardized core tracking scrub speed matching site configuration

      const buildTimeline = () => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();

          const vv = typeof visualViewport !== "undefined" ? visualViewport : null;
          if (vv) {
            const onVVResize = () => ScrollTrigger.refresh(true);
            vv.addEventListener("resize", onVVResize);
            vvCleanup = () => vv.removeEventListener("resize", onVVResize);
          }

          const scrollTl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: ".master-viewport",
              start: "top top",
              end: `+=${imagesElements.length * 1500 + 4000}`,
              pin: true,
              pinSpacing: true,
              scrub: scrubValue,
              anticipatePin: 1,
              preventOverlaps: true,
              invalidateOnRefresh: true,
              snap: {
                snapTo: (progress) => {
                  // Standardized dynamic directional label collection loop
                  const labels = Object.keys(scrollTl.labels).map(name => scrollTl.labels[name] / scrollTl.totalDuration());
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
                ease: "power1.inOut" // Softened snapping curve for continuous scroll parity
              }
            }
          });

          // ── STEP A: HERO TEXT FADEOUT ──
          scrollTl.addLabel("slide-0", 0);
          scrollTl.to(".hero-text-wrap", { opacity: 0, y: -60, duration: 2.0 }, 0)
                  .set(".hero-text-wrap", { visibility: "hidden" });

          // ── STEP B: MODERN CLIP-PATH REVEALS ──
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
          scrollTl.addLabel("ctaStart");
          scrollTl.set(".project-section-cta", { visibility: "visible" }, "ctaStart")
                  .to(".project-section-cta", { yPercent: 0, duration: 4.8 }, "ctaStart");

          // ── STEP D: FOOTER REVEAL TRACK ──
          scrollTl.addLabel("footerStart", "ctaStart+=4.8");
          
          scrollTl.set(".project-footer-wrap", { visibility: "visible" }, "footerStart")
            .to(".project-footer-wrap", { yPercent: 0, duration: 5.5 }, "footerStart")
            .to(".project-section-cta .cta-inner-desktop", { opacity: 0, duration: 4.0, ease: "power1.out" }, "footerStart");

          scrollTl.addLabel("end");
        });
      };

      // Typography and resource protection safe-mount hook engine loop
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        (window as any).requestIdleCallback(
          () => document.fonts.ready.then(buildTimeline),
          { timeout: 300 }
        );
      } else {
        setTimeout(() => document.fonts.ready.then(buildTimeline), 0);
      }

    }, scopeRef);

    return () => {
      vvCleanup?.();
      if (isTouchOnly()) {
        ScrollTrigger.normalizeScroll(false);
      }
      ctx.revert();
    };
  }, [introDone, preloaderDone, pageData.images, pageData.title]);

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