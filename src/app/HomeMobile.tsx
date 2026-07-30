"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "./context/SiteContext";
import dynamic from "next/dynamic";

import Hero from "../components/Home/Hero";
import SectionTwo from "../components/Home/SectionTwo";
import SectionCTA from "../components/SectionCTA";
import Footer from "../components/Footer";

const SectionSeven = dynamic(() => import("../components/Home/Sectionseven"), { ssr: false });
const SectionEight = dynamic(() => import("../components/Home/Sectioneight"), { ssr: false });
const SectionNine = dynamic(() => import("../components/Home/SectionNine"), { ssr: false });
const SectionTen = dynamic(() => import("../components/Home/SectionTen"), { ssr: false });
const Appsection = dynamic(() => import("../components/Appsection"), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

// Standardized Metrics matching About, Contact, Services, SubServices & Projects
const PX_PER_MAIN_PANEL = 850; 
const PX_PER_SUB_STEP = 350;   
const PAUSE_PX = 100;          

// Inline splitting utility
function executeInlineSplitting(selector: string) {
  const element = document.querySelector(selector) as HTMLElement;
  if (!element || element.dataset.splitComplete === "true") return;

  const rawText = element.textContent || "";
  const linesArray = rawText.split("\n").map(line => line.trim()).filter(line => line.length > 0);
  
  element.innerHTML = "";
  linesArray.forEach(lineText => {
    const wrapper = document.createElement("span");
    wrapper.className = "custom-line-wrap";
    wrapper.style.display = "block";
    wrapper.style.overflow = "hidden";
    wrapper.style.position = "relative";

    const inner = document.createElement("span");
    inner.className = "custom-line-inner";
    inner.style.display = "block";
    inner.style.opacity = "0";
    inner.textContent = lineText;

    wrapper.appendChild(inner);
    element.appendChild(wrapper);
  });

  element.dataset.splitComplete = "true";
}

export default function HomeMobile() {
  const contextValues = useSite() as any;
  const preloaderDone = contextValues?.preloaderDone ?? false;
  const onScrollReady = contextValues?.onScrollReady ?? (() => {});
  
  const [introDone, setIntroDone] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);

  // Configure manual scroll restoration ONCE on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Lock scrolling cleanly ONLY during initial preloader execution
  useEffect(() => {
    const locked = !preloaderDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [preloaderDone]);

  // Refresh ScrollTrigger only on screen width changes (ignoring mobile address bar height toggles)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let lastWidth = window.innerWidth;

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      if (currentWidth !== lastWidth) {
        lastWidth = currentWidth;
        ScrollTrigger.refresh();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Synchronous Layout Initialization
  useLayoutEffect(() => {
    if (!preloaderDone) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.config({ 
        ignoreMobileResize: true,
        autoRefreshEvents: "DOMContentLoaded,load,visibilitychange" 
      });

      executeInlineSplitting(".hero-right-text");
      executeInlineSplitting(".hero-secondary-para");

      gsap.set([
        ".hero-bg-wrapper", ".hero-bg", ".section-10", 
        ".s10-img-right-wrap", ".s10-scrollable-container", 
        ".section-7", ".s7-bg-img", ".s7-mob-bg", ".section-8", ".s8-bg-img", 
        ".s8-mob-bg", ".section-9", ".s9-bg-img", ".section-cta", ".footer", ".section-appsec"
      ], { force3D: true });

      gsap.set(".hero", { yPercent: 0, zIndex: 90, display: "block", opacity: 1, force3D: true });
      gsap.set(".hero-bg-wrapper", { opacity: 1, visibility: "visible", clipPath: "none" });
      gsap.set(".hero-gradient-bg", { opacity: 1, visibility: "visible" });
      
      gsap.set([".hero-title", ".hero-contact-btn", ".hero-scroll-indicator"], { opacity: 1, y: 0 });
      gsap.set(".hero-progress-wrapper", { opacity: 1, visibility: "visible" });
      gsap.set(".hero-progress-bar-fill", { scaleY: 0, transformOrigin: "top center", force3D: true });
      
      gsap.set([".hero-right-text", ".hero-secondary-para"], { opacity: 0, visibility: "hidden" });
      gsap.set([".hero-right-text .custom-line-inner", ".hero-secondary-para .custom-line-inner"], { 
        opacity: 0, 
        yPercent: 100 
      });
      
      gsap.set(".hero-secondary-text-wrap", { height: "auto" });

      gsap.set(".section-2", { display: "block", clipPath: "none", zIndex: 95, yPercent: 100, opacity: 1, visibility: "visible", force3D: true });
      gsap.set(".s2-mob-scroll-wrapper", { opacity: 0, yPercent: 100, y: 0 }); 
      gsap.set([".s2-title-main", ".s2-title-sub", ".s2-body"], { opacity: 1, y: 0, visibility: "visible" });
      
      gsap.set([".s2-mob-clip-bg-1", ".s2-mob-clip-bg-2", ".s2-mob-clip-bg-3"], { 
        scaleX: 0,
        transformOrigin: "left center",
        force3D: true
      });

      gsap.set(".section-8", { visibility: "hidden", yPercent: 100, zIndex: 100, force3D: true });
      gsap.set(".s8-bg-img", { yPercent: 20, force3D: true });
      gsap.set(".s8-mob-bg", { scale: 1.35, transformOrigin: "center center", force3D: true });

      gsap.set(".section-10", { visibility: "hidden", yPercent: 100, zIndex: 105, force3D: true });
      gsap.set(".s10-img-right-wrap", { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(".s10-scrollable-container", { y: "0vh" });

      gsap.set(".section-7", { visibility: "hidden", yPercent: 100, zIndex: 110, force3D: true });
      gsap.set(".s7-bg-img", { yPercent: 20, force3D: true });
      gsap.set(".s7-mob-bg", { scale: 1.35, transformOrigin: "center center", force3D: true });

      gsap.set(".section-appsec", { visibility: "hidden", yPercent: 100, zIndex: 115, force3D: true });

      gsap.set(".section-9", { visibility: "hidden", yPercent: 100, zIndex: 120, force3D: true });
      gsap.set(".s9-bg-img", { yPercent: 20, scale: 1.35, transformOrigin: "center center", force3D: true });
      gsap.set(".s9-title", { opacity: 1 });
      gsap.set(".s9-para", { opacity: 1 });

      gsap.set(".section-cta", { yPercent: 100, zIndex: 125, visibility: "hidden", force3D: true });
      gsap.set([".section-cta .cta-inner-mobile", ".section-cta .cta-inner-desktop"], { opacity: 1, y: 0 });
      gsap.set(".footer", { yPercent: 100, zIndex: 126, visibility: "hidden", force3D: true });

      gsap.set(".hero-bg", { scale: 1.0, transformOrigin: "center center", force3D: true });

      setIntroDone(true);
    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  // Master Timeline Driver
  useEffect(() => {
    if (!preloaderDone || !introDone) return;

    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(0);

      const ACTION = 1.4;
      const DEAD_SCROLL = 0.2; 

      // Dynamic calculation matching all other mobile modules:
      // 8 main panel moves, 5 sub steps, 8 pause holds
      const MAIN_PANELS_COUNT = 8;
      const SUB_STEPS_COUNT = 5;
      const PAUSES_COUNT = 8;

      const DYNAMIC_SCROLL_TRACK = 
        (MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL) + 
        (SUB_STEPS_COUNT * PX_PER_SUB_STEP) + 
        (PAUSES_COUNT * PAUSE_PX);

      const tl = gsap.timeline({
        defaults: { ease: "none", lazy: true },
        scrollTrigger: {
          trigger: ".home-pin-master",
          start: "top top",
          end: `+=${DYNAMIC_SCROLL_TRACK}`,
          pin: true,
          pinType: "fixed",
          scrub: 0.5,
          anticipatePin: 1,
          preventOverlaps: true, 
          fastScrollEnd: true, 
          invalidateOnRefresh: false,
        },
      });

      // ── HERO SEQUENCE ──
      tl.addLabel("heroStart", 0)
        // Dynamically scale progress bar line synchronously
        .fromTo(".hero-progress-bar-fill",
          { scaleY: 0 },
          { scaleY: 1, duration: ACTION * 1.9, ease: "none" },
          "heroStart"
        )
        .fromTo(".hero-bg", 
          { scale: 1.0 },
          { scale: 1.25, duration: ACTION * 2.0, ease: "power1.out" },
          "heroStart"
        )
        .to([".hero-title", ".hero-contact-btn", ".hero-scroll-indicator"], {
          opacity: 0,
          y: -20,
          duration: ACTION * 0.3,
          ease: "power1.inOut"
        }, "heroStart")

        .set(".hero-right-text", { visibility: "visible", opacity: 1 }, `heroStart+=${ACTION * 0.15}`)
        .to(".hero-right-text .custom-line-inner", {
          opacity: 1,
          yPercent: 0,
          stagger: 0.04,
          duration: ACTION * 0.4,
          ease: "power2.out"
        }, `heroStart+=${ACTION * 0.15}`)

        // DEAD SCROLL BUFFER
        .to({}, { duration: DEAD_SCROLL })

        .addLabel("heroRightHide", `heroStart+=${ACTION * 0.7 + DEAD_SCROLL}`)
        .to(".hero-right-text .custom-line-inner", {
          opacity: 0,
          y: -15,
          duration: ACTION * 0.25,
          ease: "power1.in"
        }, "heroRightHide")
        .set(".hero-right-text", { visibility: "hidden" })

        // Change step counter to 02 as text transitions
        .to(".hero-step-num", {
          opacity: 0,
          duration: ACTION * 0.1,
          onComplete: () => {
            const el = document.querySelector(".hero-step-num");
            if (el) el.textContent = "02";
          },
          onReverseComplete: () => {
            const el = document.querySelector(".hero-step-num");
            if (el) el.textContent = "01";
          }
        }, "heroRightHide")
        .to(".hero-step-num", { opacity: 1, duration: ACTION * 0.1 })

        .set(".hero-secondary-para", { visibility: "visible", opacity: 1 }, `heroRightHide+=${ACTION * 0.1}`)
        .to(".hero-secondary-para .custom-line-inner", {
          opacity: 1,
          yPercent: 0,
          stagger: 0.04,
          duration: ACTION * 0.4,
          ease: "power2.out"
        }, `heroRightHide+=${ACTION * 0.1}`)

        // DEAD SCROLL BUFFER
        .to({}, { duration: DEAD_SCROLL })

        .addLabel("heroExit", `heroRightHide+=${ACTION * 0.6 + DEAD_SCROLL}`)
        .to(".hero-secondary-para .custom-line-inner", {
          opacity: 0,
          y: -30,
          duration: ACTION * 0.3,
          ease: "power1.in"
        }, "heroExit")
        
        // Hide entire progress indicator wrapper on exit
        .to(".hero-progress-wrapper", {
          opacity: 0,
          duration: ACTION * 0.4,
          ease: "power1.inOut"
        }, "heroExit")

        .fromTo(".section-2", 
          { yPercent: 100 }, 
          { yPercent: 0, duration: ACTION, ease: "power2.inOut" }, 
          "heroExit"
        )
        .addLabel("textLanding", `heroExit+=${ACTION}`);

      // ── SECTION 2 INNER ANIMATIONS ──
      tl.addLabel("s2TextDismissal", "textLanding")
        .to([".s2-title-main", ".s2-title-sub", ".s2-body"], { 
          opacity: 0, 
          y: -40, 
          duration: ACTION * 0.8,
          ease: "power2.in"
        }, "s2TextDismissal")
        
        .addLabel("s2MobileScrollStart", "s2TextDismissal+=" + (ACTION * 0.4))
        .to(".s2-mob-scroll-wrapper", { opacity: 1, duration: ACTION * 0.3 }, "s2MobileScrollStart")
        .fromTo(".s2-mob-scroll-wrapper", 
          { yPercent: 100 }, 
          { yPercent: -70, duration: ACTION * 2.5 },
          "s2MobileScrollStart"
        )

        .to(".s2-mob-clip-bg-1", {
          scaleX: 1,
          duration: ACTION * 0.7,
          ease: "power2.inOut"
        }, "s2MobileScrollStart+=" + (ACTION * 0.3))

        .to(".s2-mob-clip-bg-2", {
          scaleX: 1,
          duration: ACTION * 0.7,
          ease: "power2.inOut"
        }, "s2MobileScrollStart+=" + (ACTION * 0.9))

        .to(".s2-mob-clip-bg-3", {
          scaleX: 1,
          duration: ACTION * 0.7,
          ease: "power2.inOut"
        }, "s2MobileScrollStart+=" + (ACTION * 1.5))

        .to({}, { duration: DEAD_SCROLL });

      // ── SECTION 8 SLIDE UP ──
      tl.addLabel("sec8Start", ">")
        .set(".section-8", { visibility: "visible" }, "sec8Start")
        .to(".section-8", { yPercent: 0, duration: ACTION, ease: "power2.inOut" }, "sec8Start")
        .to(".s8-bg-img", { yPercent: 0, duration: ACTION, ease: "power2.inOut" }, "sec8Start")
        .to(".s8-mob-bg", { scale: 1, duration: ACTION, ease: "power2.inOut" }, "sec8Start")

        .to({}, { duration: DEAD_SCROLL });

      // ── SECTION 10 SLIDE UP ──
      tl.addLabel("sec10Start", ">")
        .set(".section-10", { visibility: "visible" }, "sec10Start")
        .fromTo(".section-10", { yPercent: 100 }, { yPercent: 0, duration: ACTION, ease: "power2.inOut" }, "sec10Start")
        .to(".section-8", { yPercent: -10, duration: ACTION, ease: "power2.inOut" }, "sec10Start")
        
        .to(".s10-title, .s10-title-sub, .s10-para-top", { y: "-50vh", duration: ACTION, ease: "power2.inOut" }, ">")
        .fromTo(".s10-scrollable-container", { y: "0vh" }, { y: "-36vh", duration: ACTION, ease: "power2.inOut" }, "<")

        .to({}, { duration: DEAD_SCROLL });

      // ── SECTION 7 SLIDE UP ──
      tl.addLabel("sec7Start", ">")
        .set(".section-7", { visibility: "visible" }, "sec7Start")
        .fromTo(".section-7", { yPercent: 100 }, { yPercent: 0, duration: ACTION, ease: "power2.inOut" }, "sec7Start")
        .to(".s7-bg-img", { yPercent: 0, duration: ACTION, ease: "power2.inOut" }, "sec7Start")
        .to(".s7-mob-bg", { scale: 1, duration: ACTION, ease: "power2.inOut" }, "sec7Start")

        .to({}, { duration: DEAD_SCROLL });

      // ── APPSECTION SLIDE UP ──
      tl.addLabel("appSecStart", ">")
        .set(".section-appsec", { visibility: "visible" }, "appSecStart")
        .fromTo(".section-appsec", { yPercent: 100 }, { yPercent: 0, duration: ACTION, ease: "power2.inOut" }, "appSecStart")
        .to(".section-7", { yPercent: -10, duration: ACTION, ease: "power2.inOut" }, "appSecStart") 

        .to({}, { duration: DEAD_SCROLL }); 

      // ── SECTION 9 SLIDE UP ──
      tl.addLabel("sec9Start", ">")
        .set(".section-9", { visibility: "visible" }, "sec9Start")
        .fromTo(".section-9", { yPercent: 100 }, { yPercent: 0, duration: ACTION, ease: "power2.inOut" }, "sec9Start")
        .to(".section-appsec", { yPercent: -10, duration: ACTION, ease: "power2.inOut" }, "sec9Start")
        .to(".s9-bg-img", { scale: 1, yPercent: 0, duration: ACTION, ease: "power2.inOut" }, "sec9Start")
        
        .to(".s9-title", { opacity: 1, duration: ACTION * 0.5 }, "sec9Start+=0.15")
        .to(".s9-para", { opacity: 1, duration: ACTION * 0.5 }, "sec9Start+=0.15");

      // ── CTA REVEAL ──
      tl.addLabel("ctaStart", ">")
        .set(".section-cta", { visibility: "visible" }, "ctaStart")
        .to(".section-cta", { yPercent: 0, duration: ACTION, ease: "power2.inOut" }, "ctaStart") 
        .to(".s9-bg-img", { yPercent: -10, duration: ACTION, ease: "power2.inOut" }, "ctaStart")

        .to({}, { duration: DEAD_SCROLL });

      // ── FOOTER REVEAL ──
      tl.addLabel("footerStart", ">")
        .to([".section-cta .cta-inner-mobile", ".section-cta .cta-inner-desktop"], { opacity: 0, duration: ACTION * 0.4, ease: "power1.inOut" }, "footerStart")
        
        .set(".footer", { visibility: "visible" }, "footerStart+=0.1")
        .to(".footer", { yPercent: 0, duration: ACTION, ease: "power2.inOut" }, "footerStart+=0.1") 
        .to(".s9-bg-img", { yPercent: -20, duration: ACTION, ease: "power2.inOut" }, "footerStart+=0.1");

      onScrollReady();

    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone, introDone]);

  return (
    <div ref={scopeRef} className="min-h-screen w-full bg-black text-white overflow-hidden">
      <style jsx global>{`
        .hero-right-text:not([data-split-complete="true"]),
        .hero-secondary-para:not([data-split-complete="true"]) {
          opacity: 0;
          visibility: hidden;
        }
      `}</style>

      <div className="home-pin-master pin-all-home relative w-full overflow-hidden">
        
        {/* Layer 1: Hero Component */}
        <div className="hero gpu-accelerated absolute inset-0 w-full h-full" style={{ pointerEvents: "auto" }}>
          <Hero />
        </div>

        {/* Layer 2: Section Two */}
        <div className="section-2 gpu-accelerated absolute inset-0 h-full w-full" style={{ visibility: "hidden" }}>
          <SectionTwo />
        </div>

        {/* Layer 3: Section Eight */}
        <div className="section-8 gpu-accelerated absolute inset-0 h-full w-full" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <SectionEight />
        </div>

        {/* Layer 4: Section Ten */}
        <div className="section-10 gpu-accelerated absolute inset-0 h-full w-full" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <SectionTen />
        </div>

        {/* Layer 5: Section Seven */}
        <div className="section-7 gpu-accelerated absolute inset-0 h-full w-full" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <SectionSeven />
        </div>

        {/* Layer 6: App Section */}
        <div className="section-appsec gpu-accelerated absolute inset-x-0 bottom-0 w-full h-[125vh] min-h-[120vh] bg-black" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <Appsection />
        </div>

        {/* Layer 7: Section Nine */}
        <div className="section-9 gpu-accelerated absolute inset-0 h-full w-full" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <SectionNine />
        </div>

        {/* Layer 8: CTA Section */}
        <div className="section-cta gpu-accelerated absolute inset-0 h-full w-full" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <SectionCTA />
        </div>

        {/* Layer 9: Footer */}
        <div className="footer gpu-accelerated absolute left-0 bottom-0 w-full" style={{ pointerEvents: "auto", visibility: "hidden" }}>
          <Footer />
        </div>

      </div>
    </div>
  );
}