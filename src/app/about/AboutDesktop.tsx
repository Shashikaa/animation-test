"use client";

import Preloader from "@/src/components/About/Preloader";
import Hero from "@/src/components/About/Hero";
import SectionOne from "@/src/components/About/SectionOne";
import SectionTwo from "@/src/components/About/SectionTwo";
import SectionThree from "@/src/components/About/SectionThree";
import SectionFour from "@/src/components/About/SectionFour";
import SectionFive from "@/src/components/About/SectionFive";
import SectionCTA from "@/src/components/SectionCTA";
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal";
import Footer from "@/src/components/Footer";
import { useSite } from "@/src/app/context/SiteContext";

gsap.registerPlugin(ScrollTrigger);

export default function AboutDesktop() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const { setPreloaderDone: setSitePreloaderDone } = useSite();

  // Prevent scroll shifts on layout mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  // Lock scroll during introductory visuals
  useEffect(() => {
    const locked = !preloaderDone || !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [preloaderDone, introDone]);

  // Initial setup layout tracking memory allocations
  useEffect(() => {
    if (!preloaderDone) return;
    
    gsap.set(".about-hero-panel-left", { clipPath: "inset(0% 50% 0% 0%)" });
    gsap.set(".about-hero-panel-right", { clipPath: "inset(0% 0% 0% 50%)" });
    
    gsap.set(".s1-card", { y: 50, opacity: 0 });

    gsap.set(".about-section-two", {
      visibility: "hidden",
      clipPath: "inset(100% 0% 0% 0%)",
    });
    gsap.set(".s2-cream-card", {
      clipPath: "inset(100% 0% 0% 0%)",
    });

    gsap.set(".about-section-three", {
      visibility: "hidden",
      clipPath: "inset(100% 0% 0% 0%)",
    });

    gsap.set(".about-section-four", {
      visibility: "hidden",
      clipPath: "inset(100% 0% 0% 0%)",
    });
    gsap.set(".s4-glass-card", { y: 80, opacity: 0 });

    gsap.set(".about-section-five", {
      visibility: "hidden",
      clipPath: "inset(0% 0% 0% 100%)",
    });

    gsap.set(".about-section-cta", {
      visibility: "hidden",
      y: "100%", 
    });

    gsap.set(".about-footer-wrap", {
      visibility: "hidden",
      y: "100%",
    });
  }, [preloaderDone]);

  // ── UNIFIED TIMELINE FOR HERO INTRO ──
  useEffect(() => {
    if (!preloaderDone) return;

    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({
        onComplete: () => setIntroDone(true) 
      });

      introTl.to(".about-hero-bg", {
        scale: 1.2,
        duration: 1.8,
        ease: "power1.out"
      }, 0);

      introTl.addLabel("textStart", "+=0.3");

      useTextReveal(scopeRef, ".hero-title", {
        tl: introTl,
        position: "textStart",
        yOffset: 25,
        stagger: 0.04,        
        duration: 0.5,     
        ease: "power2.out"
      });

      useTextReveal(scopeRef, ".hero-desc", {
        tl: introTl,
        position: "textStart",
        yOffset: 25,
        stagger: 0.04,        
        duration: 0.5,     
        ease: "power2.out"
      });

    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  // Main Scrolling Timeline Execution
  useEffect(() => {
    if (!introDone) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".about-pin",
          start: "top top",
          end: "+=24000", 
          scrub: 1.4,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.set([".s3-reveal-bottom", ".s3-reveal-top"], { visibility: "hidden" });

      // ── SECTION 1 REVEAL ───────────────────────────────────────
      tl.to(".about-hero-panel-left", {
        clipPath: "inset(0% 50% 100% 0%)",
        duration: 2.0,
        ease: "power2.inOut",
      })
      .to(".about-hero-panel-right", {
        clipPath: "inset(100% 0% 0% 50%)",
        duration: 2.0,
        ease: "power2.inOut",
      }, "<")
      .to(".about-hero-bg", {
        scale: 1.0, 
        duration: 2.0,
        ease: "power2.inOut",
      }, "<");

      tl.to(".s1-card", {
        visibility: "visible",
        y: 0,
        opacity: 1,
        duration: 1.0,
        ease: "power2.out",
      }, "-=1.2");

      useTextReveal(scopeRef, ".s1-reveal-text", {
        tl,
        position: "-=1",
        yOffset: 30,
        stagger: 0.06,
        duration: 0.3,
        ease: "power2.out",
      });

      tl.to({}, { duration: 0.8 });

      // ── SECTION 2 REVEAL ───────────────────────────────────────
      tl.set(".about-section-two", { visibility: "visible" })
        .to(".about-section-two", {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 2.0,
          ease: "power2.inOut",
        })
        .fromTo(".s2-bg", 
          { scale: 1.2 }, 
          { scale: 1.0, duration: 2.0, ease: "power2.inOut" }, 
          "<"
        )
        .to(".about-section-one", { scale: 1.05, duration: 2.0, ease: "power2.inOut" }, "<");

      tl.to(".s2-cream-card", {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.2,
        ease: "power2.out",
      }, ">-=0.4");

      useTextReveal(scopeRef, ".s2-reveal-text", {
        tl,
        position: "-=0.8",
        yOffset: 25,
        stagger: 0.05,
        duration: 0.4,
        ease: "power2.out",
      });

      // ── SECTION 2 TO 3 REVEAL (FIXED FOR FLUID CLIPPING) ───────
      tl.set(".about-section-three", { visibility: "visible" }, ">-=0.1")
        .addLabel("sec3Start") 
        .fromTo(".about-section-three",
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)", 
            duration: 2.2,
            ease: "power2.inOut",
          },
          "sec3Start"
        )
        .to(".s2-bg", {
          yPercent: -15,
          duration: 2.2,
          ease: "power2.inOut",
        }, "sec3Start")
        .fromTo(".s3-bg",
          { scale: 1.15 },
          { scale: 1.0, duration: 2.2, ease: "power2.inOut" },
          "sec3Start"
        );

      // ── SECTION 3 NATIVE REVEAL ────────────────────────────────
      tl.set(".s3-reveal-bottom", { visibility: "visible" }, "sec3Start+=0.3");
      useTextReveal(scopeRef, ".s3-reveal-bottom", {
        tl,
        position: "sec3Start+=0.8", 
        yOffset: 25,
        stagger: 0.05,
        duration: 0.4,
        ease: "power2.out",
      });

      tl.set(".s3-reveal-top", { visibility: "visible" }, "sec3Start+=1.0");
      useTextReveal(scopeRef, ".s3-reveal-top", {
        tl,
        position: "sec3Start+=1.2", 
        yOffset: 25,
        stagger: 0.05,
        duration: 0.4,
        ease: "power2.out",
      });

      tl.to({}, { duration: 1.5 }); 

      // ── SECTION 3 TO 4 REVEAL ──────────────────────────────────
      tl.addLabel("sec4Start")
        .to([".s3-reveal-bottom", ".s3-reveal-top"], {
          opacity: 0,
          y: -40,
          duration: 1.0,
          ease: "power2.in"
        }, "sec4Start-=0.6")
        .set(".about-section-four", { visibility: "visible" }, "sec4Start")
        .to(".about-section-four", {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 2.2,
          ease: "power2.inOut",
        }, "sec4Start")
        .to(".s4-glass-card", {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power2.out"
        }, "sec4Start+=1.2");

      useTextReveal(scopeRef, ".s4-reveal-text", {
        tl,
        position: "sec4Start+=1.6",
        yOffset: 20,
        stagger: 0.04,
        duration: 0.4,
        ease: "power2.out"
      });

      tl.to({}, { duration: 1.5 }); 

      // ── SECTION 4 TO 5 REVEAL ──────────────────────────────────
      tl.addLabel("sec5Start")
        .to(".about-section-four .s4-img-bg", {
          scale: 1.0,
          duration: 2.4,
          ease: "power2.inOut"
        }, "sec5Start")
        .set(".about-section-five", { visibility: "visible" }, "sec5Start")
        .to(".about-section-five", {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 2.4,
          ease: "power2.inOut"
        }, "sec5Start")
        .to(".s5-main-glass-card", {
          opacity: 1,
          x: 0,
          duration: 1.4,
          ease: "power2.out"
        }, "sec5Start+=0.8")
        .to([".s5-static-title", ".s5-static-desc"], {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "power2.out"
        }, "sec5Start+=1.4");

      tl.to({}, { duration: 2.0 });

      // ── PHASE 2: SECTION CTA REVEAL ───────────────────────────
      tl.addLabel("ctaStart")
        .set(".about-section-cta", { visibility: "visible" }, "ctaStart")
        .to(".about-section-cta", {
          y: "0%", 
          duration: 2.4,
          ease: "power2.inOut"
        }, "ctaStart");

      tl.to({}, { duration: 2.0 });

      // ── PHASE 4: FOOTER REVEAL ────────────────────────────────
      tl.addLabel("footerStart")
        .set(".about-footer-wrap", { visibility: "visible" }, "footerStart")
        .to(".about-footer-wrap", {
          y: "0%", 
          duration: 2.4,
          ease: "power2.inOut"
        }, "footerStart");

      tl.to({}, { duration: 1.0 });

    }, scopeRef);

    return () => {
      ctx.revert();
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".hero-title");
        restoreTextReveal(scopeRef.current, ".hero-desc");
        restoreTextReveal(scopeRef.current, ".s1-reveal-text");
        restoreTextReveal(scopeRef.current, ".s2-reveal-text");
        restoreTextReveal(scopeRef.current, ".s3-reveal-bottom");
        restoreTextReveal(scopeRef.current, ".s3-reveal-top");
        restoreTextReveal(scopeRef.current, ".s4-reveal-text");
      }
    };
  }, [introDone]);

  return (
    <div ref={scopeRef}>
      <Preloader onComplete={() => {
        setPreloaderDone(true);
        setSitePreloaderDone(true);
      }} />

      <div className="about-pin relative h-screen overflow-hidden">
        {/* Section One Layer */}
        <div className="about-section-one absolute inset-0" style={{ zIndex: 10 }}>
          <SectionOne />
        </div>

        {/* Hero Splits */}
        <div className="about-hero-panel-left absolute inset-0" style={{ zIndex: 20, overflow: "hidden" }}>
          <Hero hideText={false} />
        </div>

        <div className="about-hero-panel-right absolute inset-0" style={{ zIndex: 20, overflow: "hidden" }}>
          <Hero hideText={true} />
        </div>

        {/* Section Two Layer */}
        <div 
          className="about-section-two absolute inset-0" 
          style={{ zIndex: 30, clipPath: "inset(100% 0% 0% 0%)" }}
        >
          <SectionTwo />
        </div>

        {/* Section Three Layer (FIXED VISIBILITY & BACKFACE MASKS) */}
        <div 
          className="about-section-three absolute inset-0 w-full h-full" 
          style={{ 
            zIndex: 40, 
            clipPath: "inset(100% 0% 0% 0%)",
            WebkitClipPath: "inset(100% 0% 0% 0%)"
          }}
        >
          <SectionThree />
        </div>

        {/* Section Four Layer */}
        <div 
          className="about-section-four absolute inset-0" 
          style={{ zIndex: 50, clipPath: "inset(100% 0% 0% 0%)" }}
        >
          <SectionFour />
        </div>

        {/* Section Five Layer */}
        <div 
          className="about-section-five absolute inset-0" 
          style={{ zIndex: 60, clipPath: "inset(0% 0% 0% 100%)" }}
        >
          <SectionFive />
        </div>

        {/* Section CTA Layer */}
        <div 
          className="about-section-cta absolute inset-0 w-full h-full bg-white" 
          style={{ zIndex: 70, transform: "translateY(100%)" }}
        >
          <SectionCTA />
        </div>

        {/* Footer wrapper Layer */}
        <div 
          className="about-footer-wrap absolute inset-0 w-full h-full flex flex-col justify-end" 
          style={{ zIndex: 80, transform: "translateY(100%)" }}
        >
          <Footer />
        </div>
      </div>
    </div>
  );
}