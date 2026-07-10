"use client";

import { useRef, useEffect, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal";
import Hero from "@/src/components/Service/Hero";
import SectionOne from "@/src/components/Service/SectionOne";
import SectionTwo from "@/src/components/Service/SectionTwo";
import Appsection from "@/src/components/Appsection"; 
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";

gsap.registerPlugin(ScrollTrigger);

type ServicesDesktopProps = {
  preloaderDone: boolean;
};

export default function ServicesDesktop({ preloaderDone }: ServicesDesktopProps) {
  const { setPreloaderDone } = useSite();
  const scopeRef = useRef<HTMLDivElement>(null);
  
  const [introDone, setIntroDone] = useState(false);
  const [isSectionTwoActive, setIsSectionTwoActive] = useState(false);

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
      gsap.set([".hero-title", ".hero-desc", ".hero-btn"], { opacity: 0, y: -60 });
      gsap.set(".services-hero-top-layer", { width: "100%" });
      
      // Section One Initial State
      gsap.set(".section-one-wrap", { clipPath: "inset(100% 0% 0% 0%)", zIndex: 20 });
      gsap.set(".s1-glass-card", { x: 40, opacity: 0 }); 
      gsap.set([".s1-static-title", ".s1-static-desc"], { opacity: 0, y: 30 });
      gsap.set([".s1-reveal-top", ".s1-reveal-bottom"], { opacity: 0, y: 40 });
      
      // Section Two Panel Split Initial State
      gsap.set(".services-section-two-wrap", { visibility: "hidden", zIndex: 30, opacity: 1 });
      gsap.set(".s2-left-panel", { yPercent: 100 });
      gsap.set(".s2-right-panel", { yPercent: -100 });
      gsap.set(".s2-inner-fade-target", { opacity: 0 });

      // App Section Initial State
      gsap.set(".services-appsec-wrap", { visibility: "hidden", y: "100%", zIndex: 35 });

      // CTA & Footer Initial States mapped explicitly to match About Desktop stacks
      gsap.set([".services-section-cta", ".services-footer-wrap"], { yPercent: 100, visibility: "hidden" });
      gsap.set(".services-section-cta", { zIndex: 70 });
      gsap.set(".services-footer-wrap", { zIndex: 80 });
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
        scale: 1.1, 
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

    const ctx = gsap.context(() => {
      let cachedProgressLabels: number[] = [];
      let sliderThresholds = { p0: 0, p1: 0, p2: 0, p3: 0, t1: 0, t2: 0, t3: 0 };
      let lastSec2Idx = -1;

      const tl = gsap.timeline({
        defaults: { ease: "none" }, 
        scrollTrigger: {
          trigger: ".services-hero-master",
          start: "top top",
          end: "+=16500", 
          scrub: 0.8,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
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
            ease: "power2.inOut",
          },
          onUpdate: (self) => {
            const p = self.progress;
            
            if (sliderThresholds.p0 > 0 && p >= sliderThresholds.p0 - 0.05 && p <= sliderThresholds.p3 + 0.05) {
              let nextIdx = 0;
              if (p >= sliderThresholds.t3) nextIdx = 3;
              else if (p >= sliderThresholds.t2) nextIdx = 2;
              else if (p >= sliderThresholds.t1) nextIdx = 1;
              else nextIdx = 0;

              if (nextIdx !== lastSec2Idx) {
                lastSec2Idx = nextIdx;
                if ((window as any)._sec2GoTo) {
                  (window as any)._sec2GoTo(nextIdx);
                }
              }
            }
          }
        },
      });

      tl.addLabel("snap_hero", 0);

      // ── PHASE 1: Compress Hero Layout ──
      tl.addLabel("phase1")
        .set(".hero-text-wrap", { transformOrigin: "left bottom" }, "phase1")
        .to(".hero-text-wrap", {
          y: 60,
          scale: 0.75,
          duration: 1.5,
          ease: "power1.inOut"
        }, "phase1")
        .to(".services-hero-top-layer", {
          width: "calc(100% - 40%)",
          duration: 1.5,
          ease: "power1.inOut",
        }, "phase1+=0.1");

      tl.addLabel("snap_hero_compressed", "phase1+=1.6");
      tl.to({}, { duration: 0.8 });

      // ── PHASE 2: Reveal Section One Sheet ──
      tl.addLabel("phase2")
        .to(".section-one-wrap", {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.5,
          ease: "power1.inOut"
        }, "phase2")
        .to(".service-hero-bg", {
          xPercent: -8,   
          scale: 1.6,     
          duration: 1.5,
          ease: "power1.inOut",
        }, "phase2")
        .to(".s1-glass-card", {
          opacity: 1,
          x: 0,
          duration: 1.5,
          ease: "power2.out"
        }, "phase2+=0.4")
        .to(".s1-reveal-bottom", {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out"
        }, "phase2+=0.5")
        .to(".s1-reveal-top", {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: "power2.out"
        }, "phase2+=0.6")
        .to([".s1-static-title", ".s1-static-desc"], {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "power2.out"
        }, "phase2+=0.8");

      tl.addLabel("snap_s1", "phase2+=2.0");
      tl.to({}, { duration: 0.3 });

      // ── PHASE 3: Transition to Section Two ──
      tl.addLabel("phase3")
        .set(".services-section-two-wrap", { visibility: "visible" }, "phase3")
        .to([".s1-glass-card", ".s1-static-title", ".s1-static-desc", ".s1-reveal-top", ".s1-reveal-bottom"], {
          opacity: 0,
          y: -50,
          duration: 1.5,
          ease: "power1.in"
        }, "phase3")
        .to(".s2-left-panel", {
          yPercent: 0,
          duration: 3.0,
          ease: "power2.inOut",
          onStart: () => setIsSectionTwoActive(true),
          onReverseComplete: () => {
            setIsSectionTwoActive(false);
            gsap.set(".services-section-two-wrap", { visibility: "hidden" });
          }
        }, "phase3")
        .to(".s2-right-panel", {
          yPercent: 0,
          duration: 3.0,
          ease: "power2.inOut"
        }, "phase3")
        .to(".s2-inner-fade-target", {
          opacity: 1,
          duration: 1.2,
          ease: "power1.out"
        }, "phase3+=2.5");

      tl.addLabel("snap_s2_1", "phase3+=3.0");
      
      tl.to({}, { duration: 3.0 });
      tl.addLabel("snap_s2_2");

      tl.to({}, { duration: 3.0 });
      tl.addLabel("snap_s2_3");

      tl.to({}, { duration: 3.0 });
      tl.addLabel("snap_s2_4");

      tl.to({}, { duration: 0.2 });

      // ── PHASE 4: App Section Slide Up over Sec2 ──
      tl.addLabel("phase_appsec")
        .set(".services-appsec-wrap", { visibility: "visible" }, "phase_appsec")
        .to(".services-appsec-wrap", {
          y: "0%",
          duration: 2.5,
          ease: "power1.inOut"
        }, "phase_appsec");

      tl.addLabel("snap_appsec", "phase_appsec+=2.5");
      tl.to({}, { duration: 1.5 });

      // ── PHASE 5: CTA REVEAL TRACK (Identical to About implementation) ──
      tl.addLabel("ctaStart")
        .set(".services-section-cta", { visibility: "visible" }, "ctaStart")
        .to(".services-section-cta", { yPercent: 0, duration: 4.8 }, "ctaStart")
        .to(".services-appsec-wrap", { scale: 1, duration: 4.8 }, "ctaStart");

      // ── PHASE 6: FOOTER REVEAL TRACK (Identical to About implementation) ──
      tl.addLabel("footerStart", "ctaStart+=4.8")
        .set(".services-footer-wrap", { visibility: "visible" }, "footerStart")
        .to(".services-footer-wrap", { yPercent: 0, duration: 5.5 }, "footerStart")
        .to(".services-appsec-wrap", { scale: 1, duration: 5.5 }, "footerStart")
        .to(".services-section-cta .cta-inner-desktop", { opacity: 0, duration: 4.0, ease: "power1.out" }, "footerStart");

      const totalDuration = tl.totalDuration();
      const snapLabelsList = [
        "snap_hero", 
        "snap_hero_compressed",
        "snap_s1", 
        "snap_s2_1", 
        "snap_s2_2", 
        "snap_s2_3", 
        "snap_s2_4", 
        "snap_appsec", 
        "ctaStart", 
        "footerStart"
      ];
      
      cachedProgressLabels = [0, ...snapLabelsList.map(name => tl.labels[name] / totalDuration), 1];
      cachedProgressLabels = Array.from(new Set(cachedProgressLabels)).sort((a, b) => a - b);

      sliderThresholds.p0 = tl.labels["snap_s2_1"] / totalDuration;
      sliderThresholds.p1 = tl.labels["snap_s2_2"] / totalDuration;
      sliderThresholds.p2 = tl.labels["snap_s2_3"] / totalDuration;
      sliderThresholds.p3 = tl.labels["snap_s2_4"] / totalDuration;
      
      sliderThresholds.t1 = sliderThresholds.p0 + (sliderThresholds.p1 - sliderThresholds.p0) * 0.3;
      sliderThresholds.t2 = sliderThresholds.p1 + (sliderThresholds.p2 - sliderThresholds.p1) * 0.3;
      sliderThresholds.t3 = sliderThresholds.p2 + (sliderThresholds.p3 - sliderThresholds.p2) * 0.3;

    }, scopeRef);

    return () => {
      ctx.revert();
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".s2-reveal-text");
      }
    };
  }, [introDone]);

  return (
    <div ref={scopeRef} className="w-full relative">
      <div className="services-hero-master relative w-full h-screen overflow-hidden z-10 bg-black">
        <Hero />
        
        <div className="section-one-wrap absolute inset-0 w-full h-full overflow-hidden">
          <SectionOne />
        </div>
        
        <div className="services-section-two-wrap absolute inset-0 w-full h-full overflow-hidden">
          <SectionTwo isActive={isSectionTwoActive} />
        </div>
        
        <div 
          className="services-appsec-wrap absolute inset-0 w-full h-full overflow-hidden"
          style={{ transform: "translateY(100%)" }}
        >
          <Appsection />
        </div>
        
        <div
          className="services-section-cta absolute bottom-0 left-0 w-full structural-layer"
          style={{ zIndex: 70 }}
        >
          <SectionCTA />
        </div>
        
        <div
          className="services-footer-wrap absolute left-0 bottom-0 w-full structural-layer"
          style={{ zIndex: 80 }}
        >
          <Footer />
        </div>
      </div>
    </div>
  );
}