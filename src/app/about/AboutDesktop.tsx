"use client";

import Hero from "@/src/components/About/Hero";
import SectionOne from "@/src/components/About/SectionOne";
import SectionTwo from "@/src/components/About/SectionTwo";
import SectionThree from "@/src/components/About/SectionThree";
import SectionFour from "@/src/components/About/SectionFour";
import SectionFive from "@/src/components/About/SectionFive";
import SectionCTA from "@/src/components/SectionCTA";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal";
import Footer from "@/src/components/Footer";
import { useSite } from "@/src/app/context/SiteContext";

gsap.registerPlugin(ScrollTrigger);

type AboutDesktopProps = {
  preloaderDone: boolean;
};

export default function AboutDesktop({ preloaderDone }: AboutDesktopProps) {
  const { setPreloaderDone } = useSite();
  const [introDone, setIntroDone] = useState(false);
  const [isReady, setIsReady] = useState(true); 
  const scopeRef = useRef<HTMLDivElement>(null);

  const textTriggersRef = useRef({
    sec1: false,
    sec2: false,
    sec3_bottom: false,
    sec3_top: false,
    sec4: false,
  });

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
    const ctx = gsap.context(() => {
      gsap.set(".about-hero-bg", { scale: 1.4 });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30 });
      gsap.set(".about-hero-panel-left", { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(".about-hero-panel-right", { clipPath: "inset(0% 0% 0% 0%)" });
      
      gsap.set(".s1-reveal-text", { y: 30, opacity: 0, visibility: "hidden" });
      gsap.set(".s2-reveal-text", { y: 30, opacity: 0, visibility: "hidden" });
      gsap.set([".s3-reveal-bottom", ".s3-reveal-top"], { opacity: 0 });
      gsap.set(".s4-reveal-text", { opacity: 0 });

      gsap.set(".about-section-two", { 
        visibility: "hidden", 
        top: "100%", 
        bottom: "-100%",
        clipPath: "inset(0% 0% 0% 0%)"
      });
      
      gsap.set(".about-section-three", { visibility: "hidden", clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".about-section-four", { visibility: "hidden", clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".s4-glass-card", { y: 80, opacity: 0 });
      
      gsap.set(".about-section-five", { 
        visibility: "hidden", 
        top: "100%", 
        bottom: "-100%" 
      });
      
      gsap.set([".about-section-cta", ".about-footer-wrap"], { yPercent: 100, visibility: "hidden" });
      gsap.set(".about-section-cta", { zIndex: 95 });
      gsap.set(".about-footer-wrap", { zIndex: 96 });
    }, scopeRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!preloaderDone || !isReady) return;

    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({
        onComplete: () => setIntroDone(true)
      });

      introTl.to(".about-hero-bg", {
        scale: 1.15,
        duration: 2.2,
        ease: "power2.out"
      }, 0);

      introTl.to([".hero-title", ".hero-desc"], {
        opacity: 1,
        y: 0,
        duration: 1.4,
        stagger: 0.2,
        ease: "power3.out",
      }, 0.4);
    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone, isReady]);

  useEffect(() => {
    if (!introDone) return;

    const ctx = gsap.context(() => {
      let cachedProgressLabels: number[] = [];

      const tl = gsap.timeline({
        defaults: { ease: "none" }, 
        scrollTrigger: {
          trigger: ".about-pin",
          start: "top top",
          end: "+=11500", 
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
        },
      });

      textTriggersRef.current = { 
        sec1: false, 
        sec2: false, 
        sec3_bottom: false, 
        sec3_top: false, 
        sec4: false 
      };

      tl.set(".about-hero-panel-left", { clipPath: "inset(0% 50% 0% 0%)" });
      tl.set(".about-hero-panel-right", { clipPath: "inset(0% 0% 0% 50%)" });

      // ── SECTION 1 REVEAL ──
      tl.addLabel("sec1Start")
        .to(".about-hero-panel-left", {
          clipPath: "inset(0% 50% 100% 0%)",
          duration: 2.0,
        })
        .to(".about-hero-panel-right", {
          clipPath: "inset(100% 0% 0% 50%)",
          duration: 2.0,
        }, "<")
        .fromTo(".about-hero-bg", 
          { scale: 1.15 }, 
          { scale: 1.0, duration: 2.0 }, 
          "<"
        );

      tl.to({}, {
        duration: 0.1,
        onStart: () => {
          if (!textTriggersRef.current.sec1 && tl.scrollTrigger && tl.scrollTrigger.direction > 0) {
            textTriggersRef.current.sec1 = true;
            gsap.set(".s1-reveal-text", { visibility: "visible" });
            useTextReveal(scopeRef, ".s1-reveal-text", { 
              immediate: true, 
              duration: 0.8, 
              stagger: 0.04,
              ease: "power2.out"
            });
            gsap.to(".s1-reveal-text", { opacity: 1, y: 0, duration: 0.8 });
          }
        }
      }, "sec1Start+=1.0");

      tl.to({}, { duration: 0.2 }); 

      // ── SECTION 2 REVEAL ──
      tl.addLabel("sec2Start")
        .set(".about-section-two", { visibility: "visible" })
        .fromTo(".about-section-two",
          { top: "100%", bottom: "-100%" },
          { top: "0%", bottom: "0%", duration: 2.0 },
          "sec2Start"
        )
        .fromTo(".s2-bg",
          { yPercent: 15, scale: 1.1 },
          { yPercent: 0, scale: 1.0, duration: 2.0 },
          "<"
        )
        .to(".about-section-one", { yPercent: -10, duration: 2.0 }, "<");

      tl.to({}, {
        duration: 0.1,
        onStart: () => {
          if (!textTriggersRef.current.sec2 && tl.scrollTrigger && tl.scrollTrigger.direction > 0) {
            textTriggersRef.current.sec2 = true;
            gsap.set(".s2-reveal-text", { visibility: "visible" });
            useTextReveal(scopeRef, ".s2-reveal-text", { 
              immediate: true, 
              duration: 0.8, 
              stagger: 0.04, 
              ease: "power2.out" 
            });
            gsap.to(".s2-reveal-text", { opacity: 1, y: 0, duration: 0.8 });
          }
        }
      }, "sec2Start+=1.0");

      tl.to({}, { duration: 0.2 });

      // ── SECTION 2 TO 3 REVEAL ──
      tl.set(".about-section-three", { visibility: "visible" }, ">-=0.1")
        .addLabel("sec3Start")
        .fromTo(".about-section-three",
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 2.0 },
          "sec3Start"
        )
        .to(".s2-bg", { yPercent: -15, duration: 2.0 }, "sec3Start")
        .fromTo(".s3-bg",
          { scale: 1.15 },
          { scale: 1.0, duration: 2.0 },
          "sec3Start"
        );

      tl.set(".s3-reveal-bottom", { visibility: "visible" }, "sec3Start+=0.4");
      
      tl.to({}, {
        duration: 0.1,
        onStart: () => {
          if (!textTriggersRef.current.sec3_bottom && tl.scrollTrigger && tl.scrollTrigger.direction > 0) {
            textTriggersRef.current.sec3_bottom = true;
            gsap.set(".s3-reveal-bottom", { opacity: 1 });
            useTextReveal(scopeRef, ".s3-reveal-bottom", { yOffset: 25, stagger: 0.05, duration: 0.4, ease: "power2.out" });
          }
        }
      }, "sec3Start+=0.8");

      tl.set(".s3-reveal-top", { visibility: "visible" }, "sec3Start+=0.6");
      
      tl.to({}, {
        duration: 0.1,
        onStart: () => {
          if (!textTriggersRef.current.sec3_top && tl.scrollTrigger && tl.scrollTrigger.direction > 0) {
            textTriggersRef.current.sec3_top = true;
            gsap.set(".s3-reveal-top", { opacity: 1 });
            useTextReveal(scopeRef, ".s3-reveal-top", { yOffset: 25, stagger: 0.05, duration: 0.4, ease: "power2.out" });
          }
        }
      }, "sec3Start+=1.1");

      tl.to({}, { duration: 0.2 });

      // ── SECTION 3 TO 4 REVEAL ──
      tl.addLabel("sec4Start")
        .to([".s3-reveal-bottom", ".s3-reveal-top"], {
          opacity: 0,
          y: -40,
          duration: 1.0,
          ease: "power2.in"
        }, "sec4Start-=0.4")
        .set(".about-section-four", { visibility: "visible" }, "sec4Start")
        .to(".about-section-four", {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 2.0,
        }, "sec4Start")
        .to(".s4-glass-card", {
          opacity: 1,
          y: 0,
          duration: 1.4,
          ease: "power2.out"
        }, "sec4Start+=0.8");

      tl.to({}, {
        duration: 0.1,
        onStart: () => {
          if (!textTriggersRef.current.sec4 && tl.scrollTrigger && tl.scrollTrigger.direction > 0) {
            textTriggersRef.current.sec4 = true;
            gsap.set(".s4-reveal-text", { opacity: 1 });
            useTextReveal(scopeRef, ".s4-reveal-text", { yOffset: 20, stagger: 0.04, duration: 0.4, ease: "power2.out" });
          }
        }
      }, "sec4Start+=1.2");

      tl.to({}, { duration: 0.2 });

      // ── SECTION 4 TO 5 REVEAL ──
      tl.addLabel("sec5Start")
        .to(".about-section-four .s4-img-bg", {
          scale: 1.03, 
          yPercent: -10,
          duration: 2.2,
        }, "sec5Start")
        .set(".about-section-five", { visibility: "visible" }, "sec5Start")
        .fromTo(".about-section-five",
          { top: "100%", bottom: "-100%" },
          { top: "0%", bottom: "0%", duration: 2.2 },
          "sec5Start"
        );

      useTextReveal(scopeRef, ".about-section-five .s5-reveal-text", {
        tl,
        position: "sec5Start", 
        yOffset: 0,            
        stagger: 0,
        duration: 0.01,
      });

      tl.addLabel("sec5FullyRevealed", "sec5Start+=2.2");

      tl.to(".about-section-five .s5-static-title", { opacity: 1, y: 0, duration: 1.0, ease: "power2.out" }, "sec5FullyRevealed")
        .to(".about-section-five .s5-static-desc", { opacity: 1, y: 0, duration: 1.0, ease: "power2.out" }, "sec5FullyRevealed+=0.2");

      tl.fromTo(".s5-bg", 
        { yPercent: 0, scale: 1.15 }, 
        { yPercent: -20, scale: 1.15, ease: "none", duration: 6.5 }, 
        "sec5Start"
      );

      // ── SECTION 5 CARDS CROSSFADE ──
      tl.addLabel("sec5_card2", "sec5FullyRevealed+=1.5")
        .to(".s5-slide-card-0", { opacity: 0, duration: 1.0, ease: "power2.out" }, "sec5_card2")
        .to(".s5-slide-card-1", { opacity: 1, pointerEvents: "auto", duration: 1.0, ease: "power2.out" }, "sec5_card2");

      tl.addLabel("sec5_card3", "sec5_card2+=2.0")
        .to(".s5-slide-card-1", { opacity: 0, duration: 1.0, ease: "power2.out" }, "sec5_card3")
        .to(".s5-slide-card-2", { opacity: 1, pointerEvents: "auto", duration: 1.0, ease: "power2.out" }, "sec5_card3");

      // ── CTA REVEAL TRACK (Triggered after final card finishes staging) ──
      tl.addLabel("ctaStart", "sec5_card3+=2.0")
        .set(".about-section-cta", { visibility: "visible" }, "ctaStart")
        .to(".about-section-cta", { yPercent: 0, duration: 4.8 }, "ctaStart")
        .to(".about-section-five", { scale: 1.0, duration: 4.8 }, "ctaStart");

      // ── FOOTER REVEAL TRACK ──
      tl.addLabel("footerStart", "ctaStart+=4.8")
        .set(".about-footer-wrap", { visibility: "visible" }, "footerStart")
        .to(".about-footer-wrap", { yPercent: 0, duration: 5.5 }, "footerStart")
        .to(".about-section-five", { scale: 1.05, duration: 5.5 }, "footerStart")
        .to(".about-section-cta .cta-inner-desktop", { opacity: 0, duration: 4.0, ease: "power1.out" }, "footerStart");

      const totalDuration = tl.totalDuration();
      const labelNames = ["sec1Start", "sec2Start", "sec3Start", "sec4Start", "sec5Start", "sec5FullyRevealed", "sec5_card2", "sec5_card3", "ctaStart", "footerStart"];
      cachedProgressLabels = [0, ...labelNames.map(name => tl.labels[name] / totalDuration), 1];

    }, scopeRef);

    return () => {
      ctx.revert();
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, [
          ".s1-reveal-text", ".s2-reveal-text", 
          ".s3-reveal-bottom", ".s3-reveal-top", 
          ".s4-reveal-text", ".about-section-five .s5-reveal-text"
        ].join(","));
      }
    };
  }, [introDone]);

  return (
    <div ref={scopeRef}>
      <div className="about-pin relative h-screen overflow-hidden" style={{ visibility: "visible" }}>
        <div className="about-section-one absolute inset-0" style={{ zIndex: 10 }}>
          <SectionOne />
        </div>
        <div className="about-hero-panel-left absolute inset-0" style={{ zIndex: 20, overflow: "hidden" }}>
          <Hero/>
        </div>
        <div className="about-hero-panel-right absolute inset-0" style={{ zIndex: 20, overflow: "hidden" }}>
          <Hero />
        </div>
        
        <div className="about-section-two absolute left-0 right-0" style={{ zIndex: 30, top: "100%", bottom: "-100%" }}>
          <SectionTwo />
        </div>
        
        <div className="about-section-three absolute inset-0 w-full h-full" style={{ zIndex: 40, clipPath: "inset(100% 0% 0% 0%)" }}>
          <SectionThree />
        </div>
        <div className="about-section-four absolute inset-0" style={{ zIndex: 50, clipPath: "inset(100% 0% 0% 0%)" }}>
          <SectionFour />
        </div>
        
        <div className="about-section-five absolute left-0 right-0" style={{ zIndex: 60, top: "100%", bottom: "-100%" }}>
          <SectionFive />
        </div>
        
        <div className="about-section-cta absolute bottom-0 left-0 w-full structural-layer" style={{ zIndex: 70 }}>
          <SectionCTA />
        </div>
        <div className="about-footer-wrap absolute left-0 bottom-0 w-full structural-layer" style={{ zIndex: 80 }}>
          <Footer />
        </div>
      </div>
    </div>
  );
}