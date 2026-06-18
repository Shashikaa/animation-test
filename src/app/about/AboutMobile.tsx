"use client";

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

    // ✅ FIXED: Removed local classList mutations. State now updates 
    // cleanly via the application's central provider pipeline.
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  useEffect(() => {
    const locked = !preloaderDone || !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [preloaderDone, introDone]);

  // Initial clean structural configurations
  useEffect(() => {
    if (!preloaderDone) return;
    
    gsap.set(".about-section-one", { yPercent: 100 });
    gsap.set(".about-section-two", { visibility: "hidden", yPercent: 100 });
    
    gsap.set(".about-section-three", { 
      visibility: "hidden", 
      clipPath: "inset(100% 0% 0% 0%)",
      WebkitClipPath: "inset(100% 0% 0% 0%)"
    });
    
    gsap.set([".about-section-three .s3-reveal-top", ".about-section-three .s3-reveal-bottom"], { 
      opacity: 0, 
      y: 30 
    });

    gsap.set(".about-section-four", { visibility: "hidden", yPercent: 100 });
    gsap.set(".about-section-five", { visibility: "hidden", xPercent: 100 });
    gsap.set(".about-section-cta", { visibility: "hidden", y: "100%" });
    gsap.set(".about-footer-wrap", { visibility: "hidden", y: "100%" });
  }, [preloaderDone]);

  // Hero Intro Scale Sequence — Synchronized for zero delay gap
  useEffect(() => {
    if (!preloaderDone || !isReady) return;

    const ctx = gsap.context(() => {
      gsap.to(".about-hero-bg", { 
        scale: 1.1, 
        duration: 1.2, 
        ease: "power2.out",
        onComplete: () => setIntroDone(true)
      });
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
          end: "+=6000", 
          scrub: 0.8,    
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

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

      tl.to({}, { duration: 0.4 });

      tl.set(".about-section-two", { visibility: "visible" })
        .to(".about-section-two", { yPercent: 0, duration: 2.0, ease: "power2.inOut" });
      
      tl.to({}, { duration: 0.4 });

      tl.set(".about-section-three", { visibility: "visible" })
        .addLabel("sec3MobileStart")
        .fromTo(
          ".about-section-three",
          { clipPath: "inset(100% 0% 0% 0%)", WebkitClipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", WebkitClipPath: "inset(0% 0% 0% 0%)", duration: 2.0, ease: "power2.inOut" },
          "sec3MobileStart"
        );

      tl.set([".about-section-three .s3-reveal-top", ".about-section-three .s3-reveal-bottom"], { 
        visibility: "visible" 
      }, "sec3MobileStart+=0.8");

      tl.to(
        [".about-section-three .s3-reveal-top", ".about-section-three .s3-reveal-bottom"],
        { opacity: 1, y: 0, duration: 1.0, stagger: 0.2, ease: "power2.out" },
        "sec3MobileStart+=0.8"
      );
      
      tl.to({}, { duration: 0.4 });

      tl.set(".about-section-four", { visibility: "visible" })
        .to(".about-section-four", { yPercent: 0, duration: 2.0, ease: "power2.inOut" });
      
      tl.to({}, { duration: 0.4 });

      tl.set(".about-section-five", { visibility: "visible" })
        .to(".about-section-five", { xPercent: 0, duration: 2.0, ease: "power2.inOut" });
      
      tl.to({}, { duration: 0.4 });

      tl.set(".about-section-cta", { visibility: "visible" })
        .to(".about-section-cta", { y: "0%", duration: 1.8, ease: "power2.inOut" });

      tl.set(".about-footer-wrap", { visibility: "visible" })
        .to(".about-footer-wrap", { y: "0%", duration: 1.8, ease: "power2.inOut" });

    }, scopeRef);

    return () => ctx.revert();
  }, [introDone]);

  return (
    <div ref={scopeRef}>
      <div 
        className="about-pin relative h-screen w-screen overflow-hidden bg-[#111]"
        style={{ 
          visibility: "visible"
        }}
      >
        <div className="about-hero-panel-left absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
          <Hero hideText={false} />
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

        <div className="about-section-four absolute inset-0 w-full h-full" style={{ zIndex: 50 }}>
          <SectionFour />
        </div>

        <div className="about-section-five absolute inset-0 w-full h-full" style={{ zIndex: 60 }}>
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