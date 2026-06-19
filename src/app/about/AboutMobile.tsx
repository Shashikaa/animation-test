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
  const [isReady, setIsReady] = useState(true);
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo(0, 0);

    setPreloaderDone(true);
  }, [setPreloaderDone]);

  useEffect(() => {
    const locked = !preloaderDone || !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [preloaderDone, introDone]);

  // Initial clean structural configurations (Runs instantly before paint)
  useLayoutEffect(() => {
    if (!preloaderDone) return;
    
    const ctx = gsap.context(() => {
      // Initialize the background image scaled up slightly for the intro timeline
      gsap.set(".about-hero-bg", { scale: 1.3 });
      
      // Setup hero text values to mirror Desktop initial hidden states
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30 });

      gsap.set(".about-section-one", { yPercent: 100 });
      gsap.set(".about-section-two", { visibility: "hidden", yPercent: 100 });
      
      gsap.set(".about-section-three", { 
        visibility: "hidden", 
        clipPath: "inset(100% 0% 0% 0%)",
        WebkitClipPath: "inset(100% 0% 0% 0%)"
      });

      // Section 4 sits underneath Section 3 driven by stacking index
      gsap.set(".about-section-four", { visibility: "hidden", yPercent: 0 });

      // Initialize Section 5 with clipPath stack layers instead of x positioning
      gsap.set(".about-section-five", { 
        visibility: "hidden", 
        clipPath: "inset(100% 0% 0% 0%)",
        WebkitClipPath: "inset(100% 0% 0% 0%)"
      });

      gsap.set(".about-section-cta", { visibility: "hidden", y: "100%" });
      gsap.set(".about-footer-wrap", { visibility: "hidden", y: "100%" });
    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  // Hero Intro Scale & Fade Sequence (Triggers text fade-in on mobile matching desktop setup)
  useEffect(() => {
    if (!preloaderDone || !isReady) return;

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
    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone, isReady]);

  // Pure Section Transition Scroll Timeline
  useEffect(() => {
    if (!introDone) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".about-pin",
          start: "top top",
          end: "+=8400", // Optimized for Mobile (7 distinct states * 1200px baseline)
          scrub: 0.8,    
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // Mobile snapping engine to avoid awkward halfway scroll positions
snap: {
    snapTo: 1 / 7, 
    duration: { min: 0.2, max: 0.6 },
    delay: 0.05,
    ease: "power1.inOut"
  }
        },
      });

      // Section 1
      tl.to(".about-section-one", {
        yPercent: 0,
        duration: 2.0,
        ease: "power2.inOut"
      })
      .to(".about-hero-bg", {
        scale: 1.0,
        yPercent: -10, 
        duration: 2.0,
        ease: "power2.inOut"
      }, "<");

      tl.to({}, { duration: 0.2 }); // Tight mobile spacer pad

      // Section 2
      tl.set(".about-section-two", { visibility: "visible" })
        .to(".about-section-two", { yPercent: 0, duration: 2.0, ease: "power2.inOut" });
      
      tl.to({}, { duration: 0.2 }); // Tight mobile spacer pad

      // Section 3
      tl.set(".about-section-three", { visibility: "visible" })
        .fromTo(
          ".about-section-three",
          { clipPath: "inset(100% 0% 0% 0%)", WebkitClipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", WebkitClipPath: "inset(0% 0% 0% 0%)", duration: 2.0, ease: "power2.inOut" }
        );
      
      tl.to({}, { duration: 0.2 }); // Tight mobile spacer pad

      // Slide Section 3 up and away, revealing Section 4 underneath
      tl.set(".about-section-four", { visibility: "visible" })
        .addLabel("sec3to4Transition")
        .to(".about-section-three", {
          yPercent: -100,
          duration: 2.0,
          ease: "power2.inOut"
        }, "sec3to4Transition")
        .fromTo(".about-section-four .s4-img-bg", 
          { yPercent: 15 },
          { 
            yPercent: 0, 
            duration: 2.0, 
            ease: "power2.inOut" 
          }, 
          "sec3to4Transition"
        );
      
      tl.to({}, { duration: 0.2 }); // Tight mobile spacer pad

      // Section 4 to 5 ClipPath reveal transitions
      tl.set(".about-section-five", { visibility: "visible" })
        .to(".about-section-five", { 
          clipPath: "inset(0% 0% 0% 0%)", 
          WebkitClipPath: "inset(0% 0% 0% 0%)", 
          duration: 2.0, 
          ease: "power2.inOut" 
        })
        .to(".s5-static-title, .s5-static-desc", { y: 0, opacity: 1, duration: 1.2, ease: "power2.out" }, "0")
        .to(".s5-main-glass-card", { x: 0, opacity: 1, duration: 1.2, ease: "power2.out" }, "<");
      
      tl.to({}, { duration: 0.2 }); // Tight mobile spacer pad

      // CTA
      tl.set(".about-section-cta", { visibility: "visible" })
        .to(".about-section-cta", { y: "0%", duration: 1.8, ease: "power2.inOut" });

      // Footer
      tl.set(".about-footer-wrap", { visibility: "visible" })
        .to(".about-footer-wrap", { y: "0%", duration: 1.8, ease: "power2.inOut" });

    }, scopeRef);

    return () => ctx.revert();
  }, [introDone]);

  return (
    <div ref={scopeRef}>
      <div 
        className="about-pin pin-all relative w-full overflow-hidden "
        style={{ visibility: "visible" }}
      >
        <div className="about-hero-panel-left absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
          <Hero isMobile={true} />
        </div>

        <div className="about-section-one absolute inset-0 w-full h-full" style={{ zIndex: 20 }}>
          <SectionOne />
        </div>

        <div className="about-section-two absolute inset-0 w-full h-full" style={{ zIndex: 30 }}>
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

        <div className="about-section-four absolute inset-0 w-full h-full" style={{ zIndex: 35 }}>
          <SectionFour />
        </div>

        <div 
          className="about-section-five absolute inset-0 w-full h-full" 
          style={{ 
            zIndex: 45,
            clipPath: "inset(100% 0% 0% 0%)",
            WebkitClipPath: "inset(100% 0% 0% 0%)"
          }}
        >
          <SectionFive />
        </div>

        <div className="about-section-cta absolute inset-0 w-full h-full bg-white" style={{ zIndex: 70 }}>
          <SectionCTA />
        </div>

        <div className="about-footer-wrap absolute inset-0 w-full h-full flex flex-col justify-end" style={{ zIndex: 80 }}>
          <Footer />
        </div>
      </div>
    </div>
  );
}