"use client";

import { useRef, useEffect, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import ContactHero from "../../components/contact/Hero";
import SectionCTA from "@/src/components/contact/SectionCTA";
import SectionOne from "@/src/components/contact/SectionOne";
import FAQSection from "@/src/components/contact/FAQSection";
import Footer from "@/src/components/Footer";
import { useTextReveal, restoreTextReveal } from "@/src/app/utils/useTextReveal";

gsap.registerPlugin(ScrollTrigger);

const isTouchOnly = () => ScrollTrigger.isTouch === 1;

type ContactProps = {
  preloaderDone: boolean;
};

export default function ContactDesktop({ preloaderDone }: ContactProps) {
  const { setPreloaderDone } = useSite();
  const scopeRef = useRef<HTMLDivElement>(null);
  const [introDone, setIntroDone] = useState(false);

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
    if (!preloaderDone) return;
    const ctx = gsap.context(() => {
      gsap.set(".contact-hero-bg", { scale: 1.3, y: 0, transformOrigin: "center center" });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30 });
      
      gsap.set(".cta-scroll-wrapper", { yPercent: 0, visibility: "visible" });
      gsap.set(".section-one-scroll-wrapper", { visibility: "hidden", y: "100vh" });
      gsap.set(".faq-scroll-wrapper", { visibility: "hidden", y: "100vh" }); 
      gsap.set(".footer-scroll-wrapper", { visibility: "hidden", y: "100vh" });
      gsap.set(".faq-content", { opacity: 1 });
      
      gsap.set(".contact-one-bg", { scale: 1, yPercent: 0 });
      gsap.set(".contact-right-scroll-track", { y: 0 });
    }, scopeRef);
    return () => ctx.revert();
  }, [preloaderDone]);

  useEffect(() => {
    if (!preloaderDone) return;
    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({ onComplete: () => setIntroDone(true) });
      introTl.to(".contact-hero-bg", { scale: 1.1, duration: 2.2, ease: "power2.out" }, 0)
             .to([".hero-title", ".hero-desc"], { opacity: 1, y: 0, duration: 1.4, stagger: 0.2, ease: "power3.out" }, 0.4);
    }, scopeRef);
    return () => ctx.revert();
  }, [preloaderDone]);

  useEffect(() => {
    if (!introDone) return;

    if (isTouchOnly()) {
      ScrollTrigger.normalizeScroll(true);
    }

    let vvCleanup: (() => void) | null = null;
    
    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(0);

      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize",
      });

      const performanceTargets = [
        ".contact-hero-master", ".contact-hero-bg", ".cta-scroll-wrapper",
        ".section-one-scroll-wrapper", ".contact-one-bg", ".contact-right-scroll-track",
        ".faq-scroll-wrapper", ".faq-content", ".footer-scroll-wrapper"
      ];

      performanceTargets.forEach(selector => {
        gsap.set(selector, {
          force3D: true,
          willChange: "transform, opacity"
        });
      });

      const scrubValue = 1.2;
      const revealedElements = new Set<string>();

      // Optional text reveals hook targets can be registered here if needed
      // useTextReveal(scopeRef, ".faq-scroll-wrapper .reveal-text");

      const buildTimeline = () => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();

          const vv = typeof visualViewport !== "undefined" ? visualViewport : null;
          if (vv) {
            const onVVResize = () => ScrollTrigger.refresh(true);
            vv.addEventListener("resize", onVVResize);
            vvCleanup = () => vv.removeEventListener("resize", onVVResize);
          }

          const cardContainer = document.querySelector(".contact-cards-container");
          const scrollDistance = cardContainer ? cardContainer.getBoundingClientRect().height + 96 : window.innerHeight;

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: ".contact-hero-master",
              start: "top top",
              end: "+=12000",
              scrub: scrubValue,
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
              preventOverlaps: true,
              invalidateOnRefresh: true,
              snap: {
                snapTo: (progress) => {
                  const labels = Object.keys(tl.labels).map(name => tl.labels[name] / tl.totalDuration());
                  labels.sort((a, b) => a - b);
                  
                  const currentProg = tl.progress();
                  const isForward = tl.scrollTrigger ? tl.scrollTrigger.direction > 0 : true;

                  for (let i = 0; i < labels.length - 1; i++) {
                    const start = labels[i];
                    const end = labels[i + 1];

                    if (currentProg >= start && currentProg <= end) {
                      const localProgress = (currentProg - start) / (end - start);
                      if (isForward) {
                        return localProgress >= 0.35 ? end : start;
                      } else {
                        return localProgress <= 0.40 ? start : end;
                      }
                    }
                  }
                  return progress;
                },
                duration: { min: 0.3, max: 0.6 },
                delay: 0.01,
                ease: "power1.inOut",
              }
            }
          });

          // ─── PHASE 1: Previous components shift out ───
          tl.addLabel("heroOut")
            .to(".contact-hero-bg", { y: -100, duration: 1.0 }, "heroOut")
            .to(".cta-scroll-wrapper", { yPercent: -100, ease: "power2.inOut", duration: 1.0 }, "heroOut");
          
          // ─── PHASE 2: Section One glides up safely ───
          tl.addLabel("sec1Start")
            .set(".section-one-scroll-wrapper", { visibility: "visible" }, "sec1Start")
            .to(".section-one-scroll-wrapper", { y: "0vh", ease: "power2.inOut", duration: 1.0 }, "sec1Start");
          
          // ─── PHASE 3: Section One Cards Track Scrolls up ───
          tl.addLabel("sec1Scroll")
            .to(".contact-one-bg", { yPercent: -35, duration: 2.0 }, "sec1Scroll")
            .to(".contact-right-scroll-track", { y: -scrollDistance, ease: "power1.inOut", duration: 2.0 }, "sec1Scroll");

          // ─── PHASE 4: FAQ Section glides up seamlessly ───
          tl.addLabel("faqStart")
            .set(".faq-scroll-wrapper", { visibility: "visible" }, "faqStart")
            .to(".faq-scroll-wrapper", { y: "0vh", ease: "power2.inOut", duration: 1.5 }, "faqStart");
          
          // ─── PHASE 5: FAQ Text Content Fades out ───
          tl.addLabel("faqFade")
            .to(".faq-content", { opacity: 0, y: -30, ease: "power2.in", duration: 1.0 }, "faqFade");

          // ─── PHASE 6: Footer Slides Up over the FAQ background ───
          tl.addLabel("footerStart")
            .set(".footer-scroll-wrapper", { visibility: "visible" }, "footerStart")
            .to(".footer-scroll-wrapper", { y: "0vh", ease: "power2.out", duration: 1.0 }, "footerStart");

          tl.addLabel("end");
        });
      };

      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        (window as any).requestIdleCallback(
          () => document.fonts.ready.then(buildTimeline),
          { timeout: 300 }
        );
      } else {
        setTimeout(() => document.fonts.ready.then(buildTimeline), 0);
      }

    }, scopeRef);

    return () => {
      vvCleanup?.();
      if (isTouchOnly()) {
        ScrollTrigger.normalizeScroll(false);
      }
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".faq-scroll-wrapper .reveal-text");
      }
      ctx.revert();
    };
  }, [introDone]);

  return (
    <div ref={scopeRef} className="w-full relative">
      <div className="contact-hero-master relative w-full h-screen overflow-hidden bg-black" style={{ visibility: "visible" }}>
        
        <div className="w-full h-full relative z-10">
          <ContactHero />
        </div>

        <div className="cta-scroll-wrapper absolute top-full left-0 w-full h-screen z-20">
          <SectionCTA />
        </div>

        <div className="section-one-scroll-wrapper absolute top-0 left-0 w-full h-screen z-30">
          <SectionOne />
        </div>

        <div className="faq-scroll-wrapper absolute top-0 left-0 w-full h-screen z-40">
          <FAQSection />
        </div>

        <div className="footer-scroll-wrapper absolute top-0 left-0 w-full h-screen z-50 flex flex-col justify-end pointer-events-none">
          <div className="w-full pointer-events-auto">
            <Footer />
          </div>
        </div>

      </div>
    </div>
  );
}