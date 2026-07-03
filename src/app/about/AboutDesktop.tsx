"use client";

import Hero from "@/src/components/About/Hero";
import SectionOne from "@/src/components/About/SectionOne";
import SectionTwo from "@/src/components/About/SectionTwo";
import SectionThree from "@/src/components/About/SectionThree";
import SectionFour from "@/src/components/About/SectionFour";
import SectionFive from "@/src/components/About/SectionFive";
import SectionReviews from "../../components/SectionReviews"; // Adjust path if needed
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
    const ctx = gsap.context(() => {
      gsap.set(".about-hero-bg", { scale: 1.4 });
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
      gsap.set(".about-section-reviews", { visibility: "hidden", clipPath: "inset(100% 0% 0% 0%)" });
      
      // Adjusted initialization layers to precisely mirror Home configuration properties
      gsap.set([".about-section-cta", ".about-footer-wrap"], { yPercent: 100, visibility: "hidden" });
      gsap.set(".about-section-cta", { zIndex: 95 });
      gsap.set(".about-footer-wrap", { zIndex: 96 });
    }, scopeRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!preloaderDone || !isReady) return;

    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({
        onComplete: () => setIntroDone(true)
      });

      introTl.to(".about-hero-bg", {
        scale: 1.15,
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
      let cachedProgressLabels: number[] = [];

      const tl = gsap.timeline({
        defaults: { ease: "none" }, 
        scrollTrigger: {
          trigger: ".about-pin",
          start: "top top",
          end: "+=13500", 
          scrub: 0.8, 
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          snap: {
            snapTo: (progress) => {
              if (cachedProgressLabels.length === 0) return progress;
              if (progress <= 0) return 0;
              if (progress >= 1) return 1;

              for (let i = 0; i < cachedProgressLabels.length - 1; i++) {
                const start = cachedProgressLabels[i];
                const end = cachedProgressLabels[i + 1];

                if (progress >= start && progress <= end) {
                  const localProgress = (progress - start) / (end - start);
                  return localProgress > 0.3 ? end : start;
                }
              }
              return progress;
            },
            duration: { min: 0.8, max: 1.4 }, 
            delay: 0.05, 
            ease: "power2.inOut",
          },
        },
      });

      tl.set(".about-hero-panel-left", { clipPath: "inset(0% 50% 0% 0%)" });
      tl.set(".about-hero-panel-right", { clipPath: "inset(0% 0% 0% 50%)" });
      tl.set([".s3-reveal-bottom", ".s3-reveal-top"], { visibility: "hidden" });

      // ── SECTION 1 REVEAL ──
      tl.addLabel("sec1Start")
        .to(".about-hero-panel-left", {
          clipPath: "inset(0% 50% 100% 0%)",
          duration: 2.0,
        })
        .to(".about-hero-panel-right", {
          clipPath: "inset(100% 0% 0% 50%)",
          duration: 2.0,
        }, "<")
        .fromTo(".about-hero-bg", 
          { scale: 1.15 }, 
          { scale: 1.0, duration: 2.0 }, 
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
      tl.addLabel("sec2Start")
        .set(".about-section-two", { visibility: "visible" })
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
        }, "sec5Start+=0.6");

      useTextReveal(scopeRef, ".about-section-five .s5-reveal-text", {
        tl,
        position: "sec5Start", 
        yOffset: 0,            
        stagger: 0,
        duration: 0.01,
      });

      tl.to(".about-section-five .s5-static-title", { opacity: 1, y: 0, duration: 1.0, ease: "power2.out" }, "sec5Start+=1.0")
        .to(".about-section-five .s5-static-desc", { opacity: 1, y: 0, duration: 1.0, ease: "power2.out" }, "sec5Start+=1.2");

      tl.fromTo(".s5-bg", 
        { yPercent: 0 }, 
        { yPercent: -20, ease: "none", duration: 6.5 }, 
        "sec5Start"
      );

      // ── SMOOTH INTERCHANGE CONTROLS FOR DYNAMIC CARDS ──
      tl.addLabel("sec5_card2", "sec5Start+=2.0")
        .to(".s5-slide-card-0", { 
          opacity: 0, 
          y: -25, 
          pointerEvents: "none", 
          duration: 1.2, 
          ease: "power2.inOut" 
        }, "sec5_card2")
        .fromTo(".s5-slide-card-1", 
          { opacity: 0, y: 25 }, 
          { opacity: 1, y: 0, pointerEvents: "auto", duration: 1.2, ease: "power2.inOut" }, 
          "sec5_card2"
        )
        .to(".s5-dynamic-bg", { duration: 1.2 }, "sec5_card2");

      tl.addLabel("sec5_card3", "sec5Start+=4.0")
        .to(".s5-slide-card-1", { 
          opacity: 0, 
          y: -25, 
          pointerEvents: "none", 
          duration: 1.2, 
          ease: "power2.inOut" 
        }, "sec5_card3")
        .fromTo(".s5-slide-card-2", 
          { opacity: 0, y: 25 }, 
          { opacity: 1, y: 0, pointerEvents: "auto", duration: 1.2, ease: "power2.inOut" }, 
          "sec5_card3"
        )
        .to(".s5-dynamic-bg", { duration: 1.2 }, "sec5_card3");

      tl.to({}, { duration: 1.5 });

      // ── REVIEWS SECTION REVEAL (Slides up over 5th) ──
      tl.addLabel("secReviewsStart")
        .set(".about-section-reviews", { visibility: "visible" })
        .to(".about-section-reviews", {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 2.2,
        });

      tl.to({}, { duration: 1.5 });

      // ── MATCHED FROM HOME: CTA REVEAL TRACK ──
      tl.addLabel("ctaStart")
        .set(".about-section-cta", { visibility: "visible" }, "ctaStart")
        .to(".about-section-cta", { yPercent: 0, duration: 4.8 }, "ctaStart")
        .to(".about-section-reviews", { scale: 1.05, duration: 4.8 }, "ctaStart");

      // ── MATCHED FROM HOME: FOOTER REVEAL TRACK ──
      tl.addLabel("footerStart", "ctaStart+=4.8")
        .set(".about-footer-wrap", { visibility: "visible" }, "footerStart")
        .to(".about-footer-wrap", { yPercent: 0, duration: 5.5 }, "footerStart")
        .to(".about-section-reviews", { scale: 1.05, duration: 5.5 }, "footerStart")
        .to(".about-section-cta .cta-inner-desktop", { opacity: 0, duration: 4.0, ease: "power1.out" }, "footerStart");

      const totalDuration = tl.totalDuration();
      const labelNames = ["sec1Start", "sec2Start", "sec3Start", "sec4Start", "sec5Start", "sec5_card2", "sec5_card3", "secReviewsStart", "ctaStart", "footerStart"];
      cachedProgressLabels = [0, ...labelNames.map(name => tl.labels[name] / totalDuration), 1];

    }, scopeRef);

    return () => {
      ctx.revert();
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".s1-reveal-text");
        restoreTextReveal(scopeRef.current, ".s2-reveal-text");
        restoreTextReveal(scopeRef.current, ".s3-reveal-bottom");
        restoreTextReveal(scopeRef.current, ".s3-reveal-top");
        restoreTextReveal(scopeRef.current, ".s4-reveal-text");
        restoreTextReveal(scopeRef.current, ".about-section-five .s5-reveal-text");
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
          <Hero />
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
          className="about-section-reviews absolute inset-0"
          style={{ zIndex: 65, clipPath: "inset(100% 0% 0% 0%)" }}
        >
          <SectionReviews />
        </div>
        <div
          className="about-section-cta absolute bottom-0 left-0 w-full structural-layer"
          style={{ zIndex: 70 }}
        >
          <SectionCTA />
        </div>
        <div
          className="about-footer-wrap absolute left-0 bottom-0 w-full structural-layer"
          style={{ zIndex: 80 }}
        >
          <Footer />
        </div>
      </div>
    </div>
  );
}