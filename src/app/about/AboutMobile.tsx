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

  useEffect(() => {
    const locked = !preloaderDone || !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [preloaderDone, introDone]);

  // Initial structural configurations
  useLayoutEffect(() => {
    if (!preloaderDone) return;
    
    const ctx = gsap.context(() => {
      gsap.set(".about-hero-bg", { scale: 1.3 });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30 });

      gsap.set(".about-section-one", { yPercent: 100 });
      gsap.set(".about-section-two", { visibility: "hidden", yPercent: 100 });
      
      gsap.set(".about-section-three", { 
        visibility: "hidden", 
        clipPath: "inset(100% 0% 0% 0%)",
        WebkitClipPath: "inset(100% 0% 0% 0%)"
      });

      gsap.set(".about-section-four", { visibility: "hidden", yPercent: 0 });

      // Clean setup for Section 5 container placement
      gsap.set(".about-section-five", { 
        yPercent: 100
      });

      // UPGRADED: Increased base background scale slightly to prevent any blank edge leaks during heavy translations
      gsap.set(".about-section-five .s5-bg", { scale: 1.25, yPercent: 0 });
      gsap.set([".about-section-five .s5-static-title", ".about-section-five .s5-static-desc"], { y: 0, opacity: 1 });
      
      gsap.set(".about-section-five .s5-slide-card", { opacity: 0, pointerEvents: "none" });
      gsap.set(".about-section-five .s5-slide-card-0", { opacity: 1, pointerEvents: "auto" });

      gsap.set(".about-section-cta", { yPercent: 100, zIndex: 150, visibility: "hidden" });
      gsap.set([".about-section-cta .cta-inner-mobile", ".about-section-cta .cta-inner-desktop"], { opacity: 1, y: 0 });
      gsap.set(".about-footer-wrap", { yPercent: 100, zIndex: 151, visibility: "hidden" });
    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  // Hero Intro Scale & Fade Sequence (Page Load Animations)
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

  // Pure Section Transition Scroll Timeline
  useEffect(() => {
    if (!introDone) return;

    const ctx = gsap.context(() => {
      const ACTION = 2.0;
      const DEAD_SCROLL = 0.4;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".about-pin",
          start: "top top",
          end: "+=12500", 
          scrub: 0.2,    
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        },
      });

      // Section 1
      tl.to(".about-section-one", {
        yPercent: 0,
        duration: ACTION,
        ease: "power2.inOut"
      })
      .to(".about-hero-bg", {
        scale: 1.0,
        yPercent: -10, 
        duration: ACTION,
        ease: "power2.inOut"
      }, "<");

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
        .to(".about-section-three", {
          yPercent: -100,
          duration: ACTION,
          ease: "power2.inOut"
        }, "sec3to4Transition")
        .fromTo(".about-section-four .s4-img-bg", 
          { yPercent: 15 },
          { 
            yPercent: 0, 
            duration: ACTION, 
            ease: "power2.inOut" 
          }, 
          "sec3to4Transition"
        );
      
      tl.to({}, { duration: DEAD_SCROLL }); 

      // ── SECTION 5 PANEL SLIDE UP REVEAL ──
      tl.addLabel("sec5Start")
        .set(".about-section-five", { visibility: "visible" }, "sec5Start")
        .to(".about-section-five", { 
          yPercent: 0, 
          duration: 2.2, 
          ease: "power2.inOut" 
        }, "sec5Start");

      // UPGRADED: Amplified `yPercent` to -35 and extended duration to 9.0. 
      // This forces the image to physically travel further and move noticeably faster with every scroll increment.
      tl.fromTo(".about-section-five .s5-bg", 
        { yPercent: 5, scale: 1.25 }, 
        { yPercent: -25, scale: 1.25, ease: "none", duration: 9.0 }, 
        "sec5Start"
      );

      tl.addLabel("sec5FullyRevealed", "sec5Start+=2.2");

      // ── SECTION 5 CARDS CROSSFADE ──
      tl.addLabel("sec5_card2", "sec5FullyRevealed+=1.5")
        .to(".about-section-five .s5-slide-card-0", { opacity: 0, duration: 1.0, ease: "power2.out" }, "sec5_card2")
        .to(".about-section-five .s5-slide-card-1", { opacity: 1, pointerEvents: "auto", duration: 1.0, ease: "power2.out" }, "sec5_card2");

      tl.addLabel("sec5_card3", "sec5_card2+=2.0")
        .to(".about-section-five .s5-slide-card-1", { opacity: 0, duration: 1.0, ease: "power2.out" }, "sec5_card3")
        .to(".about-section-five .s5-slide-card-2", { opacity: 1, pointerEvents: "auto", duration: 1.0, ease: "power2.out" }, "sec5_card3");

      tl.to({}, { duration: 1.5 }); 

      // ── CTA REVEAL TRACK ──
      tl.addLabel("ctaStart", ">")
        .set(".about-section-cta", { visibility: "visible" }, "ctaStart")
        .to(".about-section-cta", { yPercent: 0, duration: ACTION, ease: "power2.inOut" }, "ctaStart") 
        .to(".about-section-five", { yPercent: -10, duration: ACTION, ease: "power2.inOut" }, "ctaStart");

      tl.to({}, { duration: DEAD_SCROLL });

      // ── FOOTER REVEAL TRACK ──
      tl.addLabel("footerStart", ">")
        .to([".about-section-cta .cta-inner-mobile", ".about-section-cta .cta-inner-desktop"], { opacity: 0, duration: ACTION * 0.3, ease: "none" }, "footerStart")
        .set(".about-footer-wrap", { visibility: "visible" }, "footerStart+=0.1")
        .to(".about-footer-wrap", { yPercent: 0, duration: ACTION, ease: "none" }, "footerStart+=0.1") 
        .to(".about-section-five", { yPercent: -20, duration: ACTION, ease: "none" }, "footerStart+=0.1");

    }, scopeRef);

    return () => ctx.revert();
  }, [introDone]);

  return (
    <div ref={scopeRef}>
      <style jsx global>{`
        .pin-all {
          height: 100lvh; 
        }
      `}</style>

      <div 
        className="about-pin pin-all relative w-full overflow-hidden"
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
            opacity: 0,
            visibility: "hidden"
          }}
        >
          <SectionFive />
        </div>

        <div className="about-section-cta absolute inset-0 w-full h-full z-[150]" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <SectionCTA />
        </div>

        <div className="about-footer-wrap absolute left-0 bottom-0 w-full z-[151]" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <Footer />
        </div>
      </div>
    </div>
  );
}