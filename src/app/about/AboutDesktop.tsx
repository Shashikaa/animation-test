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
    // Let layout run immediately to intercept default states cleanly
    const ctx = gsap.context(() => {
      gsap.set(".about-hero-bg", { scale: 1.3 });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30 });
      gsap.set(".about-hero-panel-left", { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(".about-hero-panel-right", { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(".s1-card", { y: 50, opacity: 0 });
      gsap.set(".about-section-two", { visibility: "hidden", clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".s2-cream-card", { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".about-section-three", { visibility: "hidden", clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".about-section-four", { visibility: "hidden", clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(".s4-glass-card", { y: 80, opacity: 0 });
      gsap.set(".about-section-five", { visibility: "hidden", clipPath: "inset(0% 0% 0% 100%)" });
      gsap.set(".about-section-cta", { visibility: "hidden", y: "100%" });
      gsap.set(".about-footer-wrap", { visibility: "hidden", y: "100%" });
    }, scopeRef);
    return () => ctx.revert();
  }, []); // Run on mount to guarantee no instant flashes

  useEffect(() => {
    if (!preloaderDone || !isReady) return;

    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({
        onComplete: () => setIntroDone(true)
      });

      introTl.to(".about-hero-bg", {
        scale: 1.0,
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
      const tl = gsap.timeline({
        defaults: { ease: "power1.inOut" }, 
        scrollTrigger: {
          trigger: ".about-pin",
          start: "top top",
          end: "+=16800",            
          scrub: 1.5,               
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
        },
      });

      tl.set(".about-hero-panel-left", { clipPath: "inset(0% 50% 0% 0%)" });
      tl.set(".about-hero-panel-right", { clipPath: "inset(0% 0% 0% 50%)" });
      tl.set([".s3-reveal-bottom", ".s3-reveal-top"], { visibility: "hidden" });

      // ── SECTION 1 REVEAL ──
      tl.to(".about-hero-panel-left", {
        clipPath: "inset(0% 50% 100% 0%)",
        duration: 2.0,
      })
      .to(".about-hero-panel-right", {
        clipPath: "inset(100% 0% 0% 50%)",
        duration: 2.0,
      }, "<")
      .fromTo(".about-hero-bg", 
        { scale: 1.0 }, 
        { scale: 0.85, duration: 2.0 }, 
        "<"
      );

      tl.to(".s1-card", {
        visibility: "visible",
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power2.out",
      }, "-=0.8");

      useTextReveal(scopeRef, ".s1-reveal-text", {
        tl,
        position: "-=1.8",
        yOffset: 30,
        stagger: 0.05,
        duration: 0.4,
        ease: "power2.out",
      });

      tl.to({}, { duration: 0.2 }); 

      // ── SECTION 2 REVEAL ──
      tl.set(".about-section-two", { visibility: "visible" })
        .to(".about-section-two", {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 2.0,
        })
        .fromTo(".s2-bg",
          { scale: 1.2 },
          { scale: 1.0, duration: 2.0 },
          "<"
        )
        .to(".about-section-one", { scale: 1.05, duration: 2.0 }, "<");

      tl.to(".s2-cream-card", {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.4,
        ease: "power2.out",
      }, ">-=0.6");

      useTextReveal(scopeRef, ".s2-reveal-text", {
        tl,
        position: "-=1",
        yOffset: 25,
        stagger: 0.05,
        duration: 0.4,
        ease: "power2.out",
      });

      tl.to({}, { duration: 0.2 });

      // ── SECTION 2 TO 3 REVEAL ──
      tl.set(".about-section-three", { visibility: "visible" }, ">-=0.1")
        .addLabel("sec3Start")
        .fromTo(".about-section-three",
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 2.0,
          },
          "sec3Start"
        )
        .to(".s2-bg", {
          yPercent: -15,
          duration: 2.0,
        }, "sec3Start")
        .fromTo(".s3-bg",
          { scale: 1.15 },
          { scale: 1.0, duration: 2.0 },
          "sec3Start"
        );

      // ── SECTION 3 NATIVE REVEAL ──
      tl.set(".s3-reveal-bottom", { visibility: "visible" }, "sec3Start+=0.4");
      useTextReveal(scopeRef, ".s3-reveal-bottom", {
        tl,
        position: "sec3Start+=0.8",
        yOffset: 25,
        stagger: 0.05,
        duration: 0.4,
        ease: "power2.out",
      });

      tl.set(".s3-reveal-top", { visibility: "visible" }, "sec3Start+=0.6");
      useTextReveal(scopeRef, ".s3-reveal-top", {
        tl,
        position: "sec3Start+=1.1",
        yOffset: 25,
        stagger: 0.05,
        duration: 0.4,
        ease: "power2.out",
      });

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
          ease: "power1.inOut"
        }, "sec4Start")
        .to(".s4-glass-card", {
          opacity: 1,
          y: 0,
          duration: 1.4,
          ease: "power2.out"
        }, "sec4Start+=0.8");

      useTextReveal(scopeRef, ".s4-reveal-text", {
        tl,
        position: "sec4Start+=1.2",
        yOffset: 20,
        stagger: 0.04,
        duration: 0.4,
        ease: "power2.out"
      });

      tl.to({}, { duration: 0.2 });

      // ── SECTION 4 TO 5 REVEAL ──
      tl.addLabel("sec5Start")
        .to(".about-section-four .s4-img-bg", {
          scale: 1.0,
          duration: 2.2,
          }, "sec5Start")
        .set(".about-section-five", { visibility: "visible" }, "sec5Start")
        .to(".about-section-five", {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 2.2,
        }, "sec5Start")
        .to(".s5-main-glass-card", {
          opacity: 1,
          x: 0,
          duration: 1.5,
          ease: "power2.out"
        }, "sec5Start+=0.6")
        .to([".s5-static-title", ".s5-static-desc"], {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "power2.out"
        }, "sec5Start+=1.1");

      tl.to({}, { duration: 0.2 });

      // ── PHASE 2: SECTION CTA REVEAL ──
      tl.addLabel("ctaStart")
        .set(".about-section-cta", { visibility: "visible" }, "ctaStart")
        .to(".about-section-cta", {
          y: "0%",
          duration: 2.2,
        }, "ctaStart");

      tl.to({}, { duration: 0.2 });

      // ── PHASE 4: FOOTER REVEAL ──
      tl.addLabel("footerStart")
        .set(".about-footer-wrap", { visibility: "visible" }, "footerStart")
        .to(".about-footer-wrap", {
          y: "0%",
          duration: 2.2,
          ease: "power1.inOut"
        }, "footerStart");

    }, scopeRef);

    return () => {
      ctx.revert();
      if (scopeRef.current) {
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
      <div
        className="about-pin relative h-screen overflow-hidden"
        style={{ visibility: "visible" }}
      >
        <div className="about-section-one absolute inset-0" style={{ zIndex: 10 }}>
          <SectionOne />
        </div>
        <div className="about-hero-panel-left absolute inset-0" style={{ zIndex: 20, overflow: "hidden" }}>
          <Hero/>
        </div>
        <div className="about-hero-panel-right absolute inset-0" style={{ zIndex: 20, overflow: "hidden" }}>
          <Hero  />
        </div>
        <div
          className="about-section-two absolute inset-0"
          style={{ zIndex: 30, clipPath: "inset(100% 0% 0% 0%)" }}
        >
          <SectionTwo />
        </div>
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
        <div
          className="about-section-four absolute inset-0"
          style={{ zIndex: 50, clipPath: "inset(100% 0% 0% 0%)" }}
        >
          <SectionFour />
        </div>
        <div
          className="about-section-five absolute inset-0"
          style={{ zIndex: 60, clipPath: "inset(0% 0% 0% 100%)" }}
        >
          <SectionFive />
        </div>
        <div
          className="about-section-cta absolute inset-0 w-full h-full bg-white"
          style={{ zIndex: 70, transform: "translateY(100%)" }}
        >
          <SectionCTA />
        </div>
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