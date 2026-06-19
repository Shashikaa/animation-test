"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import Hero from "@/src/components/Service/Hero";
import SectionOne from "@/src/components/Service/SectionOne";
import SectionTwo from "@/src/components/Service/SectionTwo";
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";

gsap.registerPlugin(ScrollTrigger);

type ServicesMobileProps = {
  preloaderDone: boolean;
};

export default function ServicesMobile({ preloaderDone }: ServicesMobileProps) {
  const { setPreloaderDone } = useSite(); 
  const [introDone, setIntroDone] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
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

  // 1. Set up safe baseline states before animations run
  useLayoutEffect(() => {
    if (!preloaderDone) return;
    const ctx = gsap.context(() => {
      gsap.set(".service-hero-bg", { scale: 1.3 });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30 }); 
      gsap.set(".services-hero-top-layer", { clipPath: "inset(0px 0px 0px 0px)", WebkitClipPath: "inset(0px 0px 0px 0px)" });

      // Initialize Section One with bottom-to-top mask hide
      gsap.set(".services-section-one-wrap", { 
        visibility: "hidden",
        clipPath: "inset(100% 0% 0% 0%)",
        WebkitClipPath: "inset(100% 0% 0% 0%)"
      });

      // Section Two comes in via standard slide over Section One
      gsap.set(".services-section-two-wrap", { 
        visibility: "hidden", 
        yPercent: 100 
      });

      // Baseline targets for CTA and Footer sheets matching About layout specs
      gsap.set(".services-section-cta", { visibility: "hidden", y: "100%" });
      gsap.set(".services-footer-wrap", { visibility: "hidden", y: "100%" });
    }, scopeRef);
    return () => ctx.revert();
  }, [preloaderDone]);

  // 2. Intro Sequence
  useEffect(() => {
    if (!preloaderDone) return;

    const ctx = gsap.context(() => {
      const masterTl = gsap.timeline();

      masterTl.to(".service-hero-bg", {
        scale: 1.0,
        duration: 2.2,
        ease: "power2.out",
        onComplete: () => {
          setIntroDone(true);
        }
      }, 0);

      masterTl.to([".hero-title", ".hero-desc"], {
        opacity: 1,
        y: 0,
        duration: 1.4,
        stagger: 0.2,
        ease: "power3.out",
      }, 0.4);

    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  // 3. Absolute Panel Stacking Scroll Timeline
  useEffect(() => {
    if (!introDone) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".services-pin-master",
          start: "top top",
          end: "+=6500", 
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          // 🌟 ADDED: Mobile snapping engine mapped to your timeline milestones
          snap: {
            snapTo: 1 / 5, 
            duration: { min: 0.2, max: 0.6 },
            delay: 0.05,
            ease: "power1.inOut"
          }
        }
      });

      // STEP A: Hero top layer image clips UP to reveal underneath card text block
      tl.to(".hero-text-wrap", {
        opacity: 0,
        y: -40,
        duration: 2.0, // Standardized to match weights
      }, 0)
      .to(".services-hero-top-layer", {
        clipPath: "inset(0px 0px 320px 0px)",
        WebkitClipPath: "inset(0px 0px 320px 0px)",
        duration: 2.0,
        ease: "power2.inOut",
      }, 0)
      .to(".service-hero-bg", {
        yPercent: 5,
        duration: 2.0,
        ease: "power2.inOut"
      }, 0);

      tl.to({}, { duration: 0.4 }); // Separation spacer

      // STEP B: Section One un-clips directly OVER the Hero
      tl.set(".services-section-one-wrap", { visibility: "visible" })
        .to(".services-section-one-wrap", {
          clipPath: "inset(0% 0% 0% 0%)",
          WebkitClipPath: "inset(0% 0% 0% 0%)",
          duration: 2.0,
          ease: "power2.inOut"
        });

      tl.to({}, { duration: 0.4 });

      // STEP C: Section Two slides up over Section One
      tl.set(".services-section-two-wrap", { visibility: "visible" })
        .to(".services-section-two-wrap", { 
          yPercent: 0, 
          duration: 2.0, 
          ease: "power2.inOut",
          onUpdate: function() {
            const progress = this.progress();
            setIsSectionTwoActive(progress > 0.2);
          }
        });

      tl.to({}, { duration: 0.4 });

      // STEP D: CTA Panel slides up cleanly over Section Two
      tl.set(".services-section-cta", { visibility: "visible" })
        .to(".services-section-cta", {
          y: "0%",
          duration: 2.0, // Updated to 2.0 to give uniform snapping precision
          ease: "power2.inOut"
        });

      tl.to({}, { duration: 0.4 }); // Balanced timeline spacer matching upper blocks

      // STEP E: Footer Panel slides up cleanly over the CTA
      tl.set(".services-footer-wrap", { visibility: "visible" })
        .to(".services-footer-wrap", {
          y: "0%",
          duration: 2.0, // Updated to 2.0 to give uniform snapping precision
          ease: "power2.inOut"
        });

    }, scopeRef);

    return () => ctx.revert();
  }, [introDone]);

  return (
    <div ref={scopeRef}>
      <div className="services-pin-master pin-all relative w-full overflow-hidden">
        
        {/* Layer 1: Hero Block */}
        <div className="absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
          <Hero isMobile={true} />
        </div>

        {/* Layer 2: Section One with absolute clip masking initialization */}
        <div 
          className="services-section-one-wrap absolute inset-0 w-full h-full overflow-y-auto" 
          style={{ 
            zIndex: 20,
            clipPath: "inset(100% 0% 0% 0%)",
            WebkitClipPath: "inset(100% 0% 0% 0%)"
          }}
        >
          <SectionOne />
        </div>

        {/* Layer 3: Section Two Context */}
        <div 
          className="services-section-two-wrap absolute inset-0 w-full h-full overflow-y-auto" 
          style={{ zIndex: 30 }}
        >
          <SectionTwo isActive={isSectionTwoActive} />
        </div>

        {/* Layer 4: Section CTA Block matching the About structural depths */}
        <div 
          className="services-section-cta absolute inset-0 w-full h-full bg-white" 
          style={{ zIndex: 40 }}
        >
          <SectionCTA />
        </div>

        {/* Layer 5: Footer Wrapper Frame sitting on top of the layout heap */}
        <div 
          className="services-footer-wrap absolute inset-0 w-full h-full flex flex-col justify-end" 
          style={{ zIndex: 50 }}
        >
          <Footer />
        </div>

      </div>
    </div>
  );
}