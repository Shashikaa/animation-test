"use client";

import { useRef, useEffect, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal";
import SubServiceHero from "@/src/components/Service/SubServiceHero";
import SubServiceSectionOne from "@/src/components/Service/SubServiceSectionOne";
import SubServiceFAQSection from "@/src/components/Service/SubServiceFAQSection";
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";
import { FullServiceData } from "./data";

gsap.registerPlugin(ScrollTrigger);

const isTouchOnly = () => ScrollTrigger.isTouch === 1;

type SubServicesDesktopProps = {
  preloaderDone: boolean;
  pageData: FullServiceData;
};

export default function SubServicesDesktop({ preloaderDone, pageData }: SubServicesDesktopProps) {
  const { setPreloaderDone } = useSite();
  const scopeRef = useRef<HTMLDivElement>(null);
  
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    document.body.classList.remove("preloading");
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  useEffect(() => {
    const locked = !preloaderDone || !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [preloaderDone, introDone]);

  useLayoutEffect(() => {
    if (!preloaderDone) return;
    const ctx = gsap.context(() => {
      gsap.set(".service-hero-bg", { scale: 1.3, xPercent: 0, transformOrigin: "center center" });
      gsap.set([".hero-title", ".hero-desc", ".hero-btn"], { opacity: 0, y: 30 });
      gsap.set(".services-hero-top-layer", { width: "100%", xPercent: 0 }); 
      gsap.set(".section-one-wrap", { clipPath: "inset(100% 0% 0% 0%)" });
      
      gsap.set(".s10-seq-container", { y: 0 });
      gsap.set(".s10-seq-p", { opacity: 1 });

      gsap.set(".s1-glass-card", { x: 40, opacity: 0 }); 
      gsap.set([".s1-static-title", ".s1-static-desc"], { opacity: 0, y: 30 });
      gsap.set([".s1-reveal-top", ".s1-reveal-bottom"], { opacity: 0, y: 40 });

      // Panel setups
      gsap.set(".services-faq-wrap", { visibility: "hidden", y: "100%" });
      gsap.set(".services-section-two-wrap", { visibility: "hidden", clipPath: "inset(0% 0% 0% 100%)" });
      
      // CTA and Footer tracking sets
      gsap.set([".services-section-cta", ".services-footer-wrap"], { yPercent: 100, visibility: "hidden" });
      gsap.set(".services-section-cta", { zIndex: 95 });
      gsap.set(".services-footer-wrap", { zIndex: 96 });
    }, scopeRef);
    return () => ctx.revert();
  }, [preloaderDone]);

  useEffect(() => {
    if (!preloaderDone) return;

    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({
        onComplete: () => setIntroDone(true)
      });

      introTl.to(".service-hero-bg", {
        scale: 1.0, 
        duration: 2.2,
        ease: "power2.out"
      }, 0);

      introTl.to([".hero-title", ".hero-desc", ".hero-btn"], {
        opacity: 1,
        y: 0,
        duration: 1.4,
        stagger: 0.2,
        ease: "power3.out",
      }, 0.4);
    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  useEffect(() => {
    if (!introDone) return;

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
        ".services-hero-master", ".service-hero-bg", ".services-hero-top-layer",
        ".section-one-wrap", ".s1-glass-card", ".s10-seq-container",
        ".s10-img-absolute-container", ".s10-img-element", ".services-faq-wrap",
        ".services-section-cta", ".services-footer-wrap"
      ];

      performanceTargets.forEach(selector => {
        gsap.set(selector, {
          force3D: true,
          willChange: "transform, opacity, clip-path"
        });
      });

      const scrubValue = 1.2;
      const revealedElements = new Set<string>();

      // Optional text reveals target declarations can match the layout loop here
      // useTextReveal(scopeRef, ".services-faq-wrap .reveal-text");

      const buildTimeline = () => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();

          const vv = typeof visualViewport !== "undefined" ? visualViewport : null;
          if (vv) {
            const onVVResize = () => ScrollTrigger.refresh(true);
            vv.addEventListener("resize", onVVResize);
            vvCleanup = () => vv.removeEventListener("resize", onVVResize);
          }

          const tl = gsap.timeline({
            defaults: { ease: "none" }, 
            scrollTrigger: {
              trigger: ".services-hero-master",
              start: "top top",
              end: "+=10500", 
              scrub: scrubValue,
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
              preventOverlaps: true,
              invalidateOnRefresh: true,
              fastScrollEnd: true,
              snap: {
                snapTo: (progress) => {
                  const labels = Object.keys(tl.labels).map(name => tl.labels[name] / tl.totalDuration());
                  labels.sort((a, b) => a - b);
                  
                  const currentProg = tl.progress();
                  const isForward = tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true;

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

          // ── PHASE 1: Compress Hero Layout ──
          tl.addLabel("phase1")
            .to(".hero-text-wrap", {
              opacity: 0,
              y: -40,
              duration: 1.0,
              ease: "power1.out"
            }, "phase1")
            .to(".services-hero-top-layer", {
              width: "calc(100% - 600px)", 
              xPercent: -10,                      
              duration: 1.0, 
              ease: "power1.inOut",
             }, "phase1+=0.1");

          // ── PHASE 2: Reveal Section One Sheet ──
          tl.addLabel("sec1Start")
            .to(".section-one-wrap", {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.0, 
              ease: "power1.inOut"
            }, "sec1Start")
            .to(".service-hero-bg", {
              scale: 1.1,     
              duration: 1.0, 
              ease: "power1.inOut",
            }, "sec1Start");

          // ── PHASE 2.5: Scale Up Cleanly ──
          tl.addLabel("sec1Expanded")
            .to([".s10-para-top", ".s10-title"], {
              opacity: 0,
              y: -45,
              duration: 0.8,
              ease: "power2.in"
            }, "sec1Expanded")
            
            .to(".s10-img-absolute-container", {
              width: "100vw",
              height: "100vh",
              right: "0px",
              bottom: "0px",
              borderRadius: "0px",
              duration: 1.0, 
              ease: "power2.inOut"
            }, "sec1Expanded")
            
            .to(".s10-img-element", {
              scale: 1.06,
              duration: 1.0, 
              ease: "power2.inOut"
            }, "sec1Expanded");

          // ── SEQUENTIAL PARAGRAPHS ROLL UP ──
          tl.addLabel("text1")
            .to(".s10-seq-container", { y: -380, duration: 1.0 }, "text1");
            
          tl.addLabel("text2")
            .to(".s10-seq-container", { y: -760, duration: 1.0 }, "text2");
            
          tl.addLabel("text3")
            .to(".s10-seq-container", { y: -1100, duration: 1.0 }, "text3");
            
          tl.addLabel("text4");

          // ── PHASE 2.6: FAQ Section Slide Up ──
          tl.addLabel("faqStart", "text4")
            .set(".services-faq-wrap", { visibility: "visible" }, "faqStart")
            .to(".services-faq-wrap", {
              y: "0%",
              duration: 1.0, 
              ease: "power1.inOut"
            }, "faqStart");

          // ── CTA REVEAL TRACK ──
          tl.addLabel("ctaStart")
            .set(".services-section-cta", { visibility: "visible" }, "ctaStart")
            .to(".services-section-cta", { yPercent: 0, duration: 1.0 }, "ctaStart")
            .to(".services-faq-wrap", { scale: 1, duration: 1.0 }, "ctaStart");

          // ── FOOTER REVEAL TRACK ──
          tl.addLabel("footerStart")
            .set(".services-footer-wrap", { visibility: "visible" }, "footerStart")
            .to(".services-footer-wrap", { yPercent: 0, duration: 1.0 }, "footerStart")
            .to(".services-faq-wrap", { scale: 0.92, duration: 1.0 }, "footerStart")
            .to(".services-section-cta .cta-inner-desktop", { opacity: 0, duration: 0.7, ease: "power1.out" }, "footerStart");
            
          tl.addLabel("end");
        });
      };

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
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".services-faq-wrap .reveal-text");
      }
      ctx.revert();
    };
  }, [introDone]);

  return (
    <div ref={scopeRef} className="w-full relative">
      <div className="services-hero-master relative w-full h-screen overflow-hidden z-10 bg-black" style={{ visibility: "visible" }}>
        
        {/* Layer 1: Hero view base */}
        <SubServiceHero data={pageData.hero} />
        
        {/* Layer 2: Section One scrolling sheet */}
        <div className="section-one-wrap absolute inset-0 w-full h-full z-20 overflow-hidden">
          <SubServiceSectionOne data={pageData.sectionOne} />
        </div>

        {/* Layer 3: FAQ slide overlay */}
        <div className="services-faq-wrap absolute inset-0 w-full h-full z-30 overflow-hidden">
          <SubServiceFAQSection data={pageData.sectionTwo} />
        </div>

        {/* Layer 4: Section CTA wrapper */}
        <div className="services-section-cta absolute bottom-0 left-0 w-full structural-layer">
          <SectionCTA />
        </div>

        {/* Layer 5: Footer wrapper */}
        <div className="services-footer-wrap absolute left-0 bottom-0 w-full structural-layer">
          <Footer />
        </div>
        
      </div>
    </div>
  );
}