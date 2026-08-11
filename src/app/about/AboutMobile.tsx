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
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";

gsap.registerPlugin(ScrollTrigger);

export default function AboutMobile() {
  const [isSectionFiveActive, setIsSectionFiveActive] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const lastSec5Idx = useRef<number>(-1);

  const { introDone } = useHeroIntro(scopeRef, { isMobile: true });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".about-section-one", { yPercent: 100 });
      gsap.set(".about-section-two", { visibility: "hidden", yPercent: 100 });
      
      gsap.set(".about-section-three", { 
        visibility: "hidden", 
        clipPath: "inset(100% 0% 0% 0%)",
        WebkitClipPath: "inset(100% 0% 0% 0%)"
      });

      gsap.set(".about-section-four", { visibility: "hidden", yPercent: 0 });

      gsap.set(".about-section-five", { yPercent: 100, opacity: 1, visibility: "hidden" });
      gsap.set(".about-section-five .s5-bg", { scale: 1.25, yPercent: 0 });

      gsap.set(".about-section-cta", { yPercent: 100, zIndex: 150, visibility: "hidden" });
      gsap.set(
        [".about-section-cta .cta-inner-mobile", ".about-section-cta .cta-inner-desktop"], 
        { opacity: 1, y: 0, pointerEvents: "auto", visibility: "visible" }
      );
      gsap.set(".about-footer-wrap", { yPercent: 100, zIndex: 151, visibility: "hidden" });
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!introDone) return;

    const ctx = gsap.context(() => {
      const vh = window.innerHeight;
      
      // Increased scroll track length so fast flings run out of distance before bypassing multiple panels
      const DYNAMIC_SCROLL_TRACK = vh * 8.5; 

      const ACTION = 1; 
      const DEAD_SCROLL = 0.15; 
      const SEC5_CARDS_HOLD = 1;

      const triggerSec5Hook = (nextIdx: number) => {
        if (nextIdx !== lastSec5Idx.current) {
          lastSec5Idx.current = nextIdx;
          if ((window as any)._sec5GoTo) {
            (window as any)._sec5GoTo(nextIdx);
          }
        }
      };

      const tl = gsap.timeline({
        defaults: { ease: "none", lazy: true },
        scrollTrigger: {
          trigger: ".about-pin",
          start: "top top",
          end: `+=${DYNAMIC_SCROLL_TRACK}`,
          scrub: 0.4, // Smooth catch-up without hard snapping
          pin: true,
          pinType: "fixed",
          anticipatePin: 1,
          preventOverlaps: true,
          fastScrollEnd: true,
          invalidateOnRefresh: false,

          onUpdate: (self) => {
            // CLAMP VELOCITY: Smoothly caps high-speed flick momentum without forcing snaps
            const velocity = self.getVelocity();
            const maxAllowedVelocity = 1800; // Adjust down (e.g. 1500) if you want even stronger resistance to fast flings

            if (Math.abs(velocity) > maxAllowedVelocity) {
              const clampedVelocity = Math.sign(velocity) * maxAllowedVelocity;
              self.scroll(self.scroll() - (velocity - clampedVelocity) * 0.012);
            }

            const sec5Time = tl.labels["sec5FullyRevealed"];
            const ctaTime = tl.labels["ctaStart"];

            if (typeof sec5Time === "number" && typeof ctaTime === "number") {
              const currentTime = tl.time();

              if (currentTime >= sec5Time && currentTime < ctaTime) {
                const sec5Progress = (currentTime - sec5Time) / (ctaTime - sec5Time);

                if (sec5Progress < 0.33) {
                  triggerSec5Hook(0);
                } else if (sec5Progress < 0.66) {
                  triggerSec5Hook(1);
                } else {
                  triggerSec5Hook(2);
                }
              } else if (currentTime < sec5Time) {
                triggerSec5Hook(0);
              }
            } else {
              const totalDuration = tl.duration();
              if (totalDuration > 0) {
                const progress = self.progress;
                if (progress > 0.55 && progress < 0.75) {
                  const localProg = (progress - 0.55) / 0.20;
                  if (localProg < 0.33) triggerSec5Hook(0);
                  else if (localProg < 0.66) triggerSec5Hook(1);
                  else triggerSec5Hook(2);
                }
              }
            }
          },
        },
      });

      tl.to(".about-section-one", { yPercent: 0, duration: ACTION, ease: "power1.inOut" })
        .to(".about-hero-bg", { scale: 1.0, yPercent: -10, duration: ACTION, ease: "power1.inOut" }, "<");

      tl.to({}, { duration: DEAD_SCROLL }); 

      tl.set(".about-section-two", { visibility: "visible" })
        .to(".about-section-two", { yPercent: 0, duration: ACTION, ease: "power1.inOut" });
      
      tl.to({}, { duration: DEAD_SCROLL }); 

      tl.set(".about-section-three", { visibility: "visible" })
        .fromTo(
          ".about-section-three",
          { clipPath: "inset(100% 0% 0% 0%)", WebkitClipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", WebkitClipPath: "inset(0% 0% 0% 0%)", duration: ACTION, ease: "power1.inOut" }
        );
      
      tl.to({}, { duration: DEAD_SCROLL }); 

      tl.set(".about-section-four", { visibility: "visible" })
        .addLabel("sec3to4Transition")
        .to(".about-section-three", { yPercent: -100, duration: ACTION, ease: "power1.inOut" }, "sec3to4Transition")
        .fromTo(".about-section-four .s4-img-bg", 
          { yPercent: 15 },
          { yPercent: 0, duration: ACTION, ease: "power1.inOut" }, 
          "sec3to4Transition"
        );
      
      tl.to({}, { duration: DEAD_SCROLL }); 

      tl.addLabel("sec5Start")
        .set(".about-section-five", { visibility: "visible" }, "sec5Start")
        .to(".about-section-five", { 
          yPercent: 0, 
          duration: ACTION, 
          ease: "power1.inOut",
          onStart: () => setIsSectionFiveActive(true),
          onReverseComplete: () => {
            setIsSectionFiveActive(false);
            triggerSec5Hook(0);
          }
        }, "sec5Start");

      tl.addLabel("sec5FullyRevealed", `sec5Start+=${ACTION}`);

      tl.to({}, { duration: SEC5_CARDS_HOLD });

      tl.addLabel("ctaStart", ">")
        .set(".about-section-cta", { visibility: "visible" }, "ctaStart")
        .fromTo(
          ".about-section-cta",
          { yPercent: 100 },
          { yPercent: 0, duration: ACTION, ease: "power1.inOut" },
          "ctaStart"
        )
        .to(".about-section-five", { yPercent: 0, duration: ACTION, ease: "power1.inOut" }, "ctaStart");

      tl.fromTo(
        ".about-section-five .s5-bg", 
        { yPercent: 0, scale: 1.0 }, 
        { yPercent: -55, scale: 1.0, duration: ACTION + SEC5_CARDS_HOLD, ease: "none" }, 
        "sec5Start"
      );

      tl.to({}, { duration: DEAD_SCROLL });

      tl.addLabel("footerStart", ">")
        .set(".about-section-five", { visibility: "hidden" }, "footerStart")
        .set(".about-footer-wrap", { visibility: "visible" }, "footerStart")
        .fromTo(
          ".about-footer-wrap",
          { yPercent: 100 },
          { yPercent: 0, duration: ACTION, ease: "power1.inOut" },
          "footerStart"
        );

    }, scopeRef);

    return () => ctx.revert();
  }, [introDone]);

  return (
    <div ref={scopeRef}>
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
            visibility: "hidden"
          }}
        >
          <SectionFive isActive={isSectionFiveActive} />
        </div>

        <div 
          className="about-section-cta gpu-accelerated absolute inset-x-0 bottom-0 w-full h-auto min-h-[100dvh] z-[150]" 
          style={{ pointerEvents: "auto", visibility: "hidden" }}
        >
          <SectionCTA />
        </div>

        <div className="about-footer-wrap gpu-accelerated absolute left-0 bottom-0 w-full z-[151]" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <Footer />
        </div>
      </div>
    </div>
  );
}