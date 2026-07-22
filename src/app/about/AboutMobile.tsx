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
import Footer from "@/src/components/Footer";
import { useSite } from "@/src/app/context/SiteContext";

gsap.registerPlugin(ScrollTrigger);

type AboutMobileProps = {
  preloaderDone: boolean;
};

export default function AboutMobile({ preloaderDone }: AboutMobileProps) {
  const { setPreloaderDone } = useSite(); 
  const [introDone, setIntroDone] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo(0, 0);
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  // Lock background scrolling during preloader & intro sequence
  useEffect(() => {
    const locked = !preloaderDone || !introDone;
    
    if (locked) {
      document.body.style.touchAction = "none";
      document.body.style.pointerEvents = "none";
    } else {
      document.body.style.touchAction = "";
      document.body.style.pointerEvents = "";
    }

    return () => {
      document.body.style.touchAction = "";
      document.body.style.pointerEvents = "";
    };
  }, [preloaderDone, introDone]);

  // Dynamic --vh pixel calculation for exact iOS Safari viewport fitting
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const updateVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    updateVh();
    window.addEventListener("resize", updateVh);
    return () => window.removeEventListener("resize", updateVh);
  }, []);

  // Initial structural configurations & GPU layer promotion
  useLayoutEffect(() => {
    if (!preloaderDone) return;
    
    const ctx = gsap.context(() => {
      // Allows native scroll events to collapse the browser address bar
      ScrollTrigger.config({ 
        ignoreMobileResize: true,
        autoRefreshEvents: "DOMContentLoaded,load,visibilitychange" 
      });

      gsap.set(".about-hero-bg", { scale: 1.3, force3D: true });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30, force3D: true });

      gsap.set(".about-section-one", { yPercent: 100, force3D: true });
      gsap.set(".about-section-two", { visibility: "hidden", yPercent: 100, force3D: true });
      
      gsap.set(".about-section-three", { 
        visibility: "hidden", 
        clipPath: "inset(100% 0% 0% 0%)",
        WebkitClipPath: "inset(100% 0% 0% 0%)",
        force3D: true
      });

      gsap.set(".about-section-four", { visibility: "hidden", yPercent: 0, force3D: true });

      gsap.set(".about-section-five", { yPercent: 100, force3D: true });
      gsap.set(".about-section-five .s5-bg", { scale: 1.25, yPercent: 0, force3D: true });
      gsap.set([".about-section-five .s5-static-title", ".about-section-five .s5-static-desc"], { y: 0, opacity: 1 });
      
      gsap.set(".about-section-five .s5-slide-card", { opacity: 0, pointerEvents: "none", force3D: true });
      gsap.set(".about-section-five .s5-slide-card-0", { opacity: 1, pointerEvents: "auto", force3D: true });

      gsap.set(".about-section-cta", { yPercent: 100, zIndex: 150, visibility: "hidden", force3D: true });
      gsap.set([".about-section-cta .cta-inner-mobile", ".about-section-cta .cta-inner-desktop"], { opacity: 1, y: 0 });
      gsap.set(".about-footer-wrap", { yPercent: 100, zIndex: 151, visibility: "hidden", force3D: true });
    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  // Hero Intro Scale & Fade Sequence
  useEffect(() => {
    if (!preloaderDone) return;

    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({
        onComplete: () => setIntroDone(true)
      });

      introTl.to(".about-hero-bg", { 
        scale: 1.1, 
        duration: 2.2, 
        ease: "power2.out",
      }, 0);

      introTl.to([".hero-title", ".hero-desc"], {
        opacity: 1,
        y: 0,
        duration: 1.4,
        stagger: 0.2,
        ease: "power3.out",
      }, 0.4);

      introTl.to(".about-section-five", { opacity: 1, duration: 1.2, ease: "linear" }, 0.2);

    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  // Section Transition Scroll Timeline
  useEffect(() => {
    if (!introDone) return;

    const ctx = gsap.context(() => {
      const ACTION = 2.0;
      const DEAD_SCROLL = 0.4;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".about-pin",
          start: "top top",
          end: "+=5000",
          scrub: 1, // Lightweight scrub allows native touch momentum to scroll the document and collapse URL bar
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        },
      });

      // Section 1
      tl.to(".about-section-one", { yPercent: 0, duration: ACTION, ease: "power2.inOut" })
        .to(".about-hero-bg", { scale: 1.0, yPercent: -10, duration: ACTION, ease: "power2.inOut" }, "<");

      tl.to({}, { duration: DEAD_SCROLL }); 

      // Section 2
      tl.set(".about-section-two", { visibility: "visible" })
        .to(".about-section-two", { yPercent: 0, duration: ACTION, ease: "power2.inOut" });
      
      tl.to({}, { duration: DEAD_SCROLL }); 

      // Section 3
      tl.set(".about-section-three", { visibility: "visible" })
        .fromTo(
          ".about-section-three",
          { clipPath: "inset(100% 0% 0% 0%)", WebkitClipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", WebkitClipPath: "inset(0% 0% 0% 0%)", duration: ACTION, ease: "power2.inOut" }
        );
      
      tl.to({}, { duration: DEAD_SCROLL }); 

      // Section 4
      tl.set(".about-section-four", { visibility: "visible" })
        .addLabel("sec3to4Transition")
        .to(".about-section-three", { yPercent: -100, duration: ACTION, ease: "power2.inOut" }, "sec3to4Transition")
        .fromTo(".about-section-four .s4-img-bg", 
          { yPercent: 15 },
          { yPercent: 0, duration: ACTION, ease: "power2.inOut" }, 
          "sec3to4Transition"
        );
      
      tl.to({}, { duration: DEAD_SCROLL }); 

      // Section 5 Reveal
      tl.addLabel("sec5Start")
        .set(".about-section-five", { visibility: "visible" }, "sec5Start")
        .to(".about-section-five", { yPercent: 0, duration: 2.2, ease: "power2.inOut" }, "sec5Start");

      tl.fromTo(".about-section-five .s5-bg", 
        { yPercent: 5, scale: 1.25 }, 
        { yPercent: -25, scale: 1.25, ease: "none", duration: 6.0 }, 
        "sec5Start"
      );

      tl.addLabel("sec5FullyRevealed", "sec5Start+=2.2");

      // Section 5 Card Transitions
      tl.addLabel("sec5_card2", "sec5FullyRevealed+=0.6")
        .to(".about-section-five .s5-slide-card-0", { opacity: 0, duration: 0.8, ease: "power2.out" }, "sec5_card2")
        .to(".about-section-five .s5-slide-card-1", { opacity: 1, pointerEvents: "auto", duration: 0.8, ease: "power2.out" }, "sec5_card2");

      tl.addLabel("sec5_card3", "sec5_card2+=1.0")
        .to(".about-section-five .s5-slide-card-1", { opacity: 0, duration: 0.8, ease: "power2.out" }, "sec5_card3")
        .to(".about-section-five .s5-slide-card-2", { opacity: 1, pointerEvents: "auto", duration: 0.8, ease: "power2.out" }, "sec5_card3");

      tl.to({}, { duration: 0.2 }); 

      // CTA Reveal Track
      tl.addLabel("ctaStart", ">")
        .set(".about-section-cta", { visibility: "visible" }, "ctaStart")
        .to(".about-section-cta", { yPercent: 0, duration: ACTION, ease: "power2.inOut" }, "ctaStart") 
        .to(".about-section-five", { yPercent: -10, duration: ACTION, ease: "power2.inOut" }, "ctaStart");

      tl.to({}, { duration: DEAD_SCROLL });

      // Footer Reveal Track (Eliminates Sec 5 Flash)
      tl.addLabel("footerStart", ">")
        .to([".about-section-cta .cta-inner-mobile", ".about-section-cta .cta-inner-desktop"], { 
          opacity: 0, 
          duration: ACTION * 0.4, 
          ease: "power1.inOut" 
        }, "footerStart")
        // Completely hide Section 5 as CTA inner content finishes fading out
        .set(".about-section-five", { visibility: "hidden" }, `footerStart+=${ACTION * 0.4}`)
        // Slide up the Footer over the CTA wrapper
        .set(".about-footer-wrap", { visibility: "visible" }, "footerStart")
        .fromTo(".about-footer-wrap", 
          { yPercent: 100 },
          { yPercent: 0, duration: ACTION, ease: "power2.inOut" }, 
          "footerStart"
        );

    }, scopeRef);

    return () => ctx.revert();
  }, [introDone]);

  return (
    <div ref={scopeRef}>
      <style jsx global>{`
        .pin-all {
          height: 100vh;
          height: calc(var(--vh, 1vh) * 100);
          height: 100dvh;
        }

        .gpu-accelerated {
          will-change: transform, opacity, clip-path;
          transform: translateZ(0);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }

        .about-section-cta {
          background-color: #000; /* Match site background */
        }
      `}</style>

      <div 
        className="about-pin pin-all relative w-full overflow-hidden"
        style={{ visibility: "visible" }}
      >
        <div className="about-hero-panel-left gpu-accelerated absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
          <Hero isMobile={true} />
        </div>

        <div className="about-section-one gpu-accelerated absolute inset-0 w-full h-full" style={{ zIndex: 20 }}>
          <SectionOne />
        </div>

        <div className="about-section-two gpu-accelerated absolute inset-0 w-full h-full" style={{ zIndex: 30 }}>
          <SectionTwo />
        </div>

        <div 
          className="about-section-three gpu-accelerated absolute inset-0 w-full h-full" 
          style={{ 
            zIndex: 40, 
            clipPath: "inset(100% 0% 0% 0%)",
            WebkitClipPath: "inset(100% 0% 0% 0%)"
          }}
        >
          <SectionThree />
        </div>

        <div className="about-section-four gpu-accelerated absolute inset-0 w-full h-full" style={{ zIndex: 35 }}>
          <SectionFour />
        </div>

        <div 
          className="about-section-five gpu-accelerated absolute inset-0 w-full h-full" 
          style={{ 
            zIndex: 45,
            opacity: 0,
            visibility: "hidden"
          }}
        >
          <SectionFive />
        </div>

        <div className="about-section-cta gpu-accelerated absolute inset-0 w-full h-full z-[150]" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <SectionCTA />
        </div>

        <div className="about-footer-wrap gpu-accelerated absolute left-0 bottom-0 w-full z-[151]" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <Footer />
        </div>
      </div>
    </div>
  );
}