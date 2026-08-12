"use client";

import Hero from "@/src/components/About/Hero";
import SectionOne from "@/src/components/About/SectionOne";
import SectionTwo from "@/src/components/About/SectionTwo";
import SectionThree from "@/src/components/About/SectionThree";
import SectionFour from "@/src/components/About/SectionFour";
import SectionFive from "@/src/components/About/SectionFive";
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";

import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";

gsap.registerPlugin(ScrollTrigger);

const PX_PER_MAIN_PANEL = 850;
const PX_PER_SUB_STEP = 450;
const PAUSE_PX = 100;

const BASELINE_VH = 800;

export default function AboutMobile() {
  const [isSectionFiveActive, setIsSectionFiveActive] = useState(false);

  const scopeRef = useRef<HTMLDivElement>(null);

  const lastSec5Idx = useRef<number>(-1);

  const { introDone } = useHeroIntro(scopeRef, {
    isMobile: true,
  });

  /*
   * ============================================================
   * INITIAL STATE
   * ============================================================
   */

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".about-hero-panel-left", {
        yPercent: 0,
        force3D: true,
      });

      gsap.set(".about-section-one", {
        yPercent: 100,
        visibility: "visible",
        force3D: true,
      });

      gsap.set(".about-section-two", {
        yPercent: 100,
        visibility: "visible",
        force3D: true,
      });

      gsap.set(".about-section-three", {
        yPercent: 100,
        visibility: "visible",
        force3D: true,
      });

      gsap.set(".about-section-four", {
        yPercent: 100,
        visibility: "visible",
        force3D: true,
      });

      gsap.set(".about-section-five", {
        yPercent: 100,
        opacity: 1,
        visibility: "visible",
        force3D: true,
      });

      gsap.set(".about-section-five .s5-bg", {
        scale: 1.25,
        yPercent: 0,
        force3D: true,
      });

      /*
       * CTA remains a full viewport section.
       */
      gsap.set(".about-section-cta", {
        yPercent: 100,
        zIndex: 150,
        visibility: "hidden",
        force3D: true,
      });

      gsap.set(
        [
          ".about-section-cta .cta-inner-mobile",
          ".about-section-cta .cta-inner-desktop",
        ],
        {
          opacity: 1,
          y: 0,
          pointerEvents: "auto",
          visibility: "visible",
        }
      );

      /*
       * IMPORTANT:
       *
       * Footer is NOT 100dvh.
       *
       * It keeps its natural/content height and starts below
       * the viewport. GSAP slides it upward until its bottom
       * meets the viewport bottom.
       */
      gsap.set(".about-footer-wrap", {
        yPercent: 100,
        zIndex: 160,
        visibility: "hidden",
        force3D: true,
      });
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  /*
   * ============================================================
   * MAIN SCROLL EXPERIENCE
   * ============================================================
   */

  useEffect(() => {
    if (!introDone) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.config({
        ignoreMobileResize: true,
      });

      /*
       * Lenis remains responsible for smooth scrolling.
       */
      const ACTION = 1.4;

      const DEAD_SCROLL = 0.08;

      const SEC5_CARDS_HOLD = 1.0;

      const UNIFIED_EASE = "none";

      const MAIN_PANELS_COUNT = 7;
      const SUB_STEPS_COUNT = 3;
      const PAUSES_COUNT = 7;

      const vh = window.innerHeight || BASELINE_VH;

      const scaleFactor = vh / BASELINE_VH;

      const DYNAMIC_SCROLL_TRACK =
        (
          MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL +
          SUB_STEPS_COUNT * PX_PER_SUB_STEP +
          PAUSES_COUNT * PAUSE_PX
        ) * scaleFactor;

      /*
       * ========================================================
       * SECTION FIVE CARD CONTROL
       * ========================================================
       */

      const triggerSec5Hook = (nextIdx: number) => {
        if (nextIdx === lastSec5Idx.current) return;

        lastSec5Idx.current = nextIdx;

        const goTo = (window as any)._sec5GoTo;

        if (typeof goTo === "function") {
          goTo(nextIdx);
        }
      };

      /*
       * ========================================================
       * MASTER TIMELINE
       * ========================================================
       */

      const tl = gsap.timeline({
        defaults: {
          ease: UNIFIED_EASE,
          lazy: true,
        },

        scrollTrigger: {
          trigger: ".about-pin",

          start: "top top",

          end: `+=${DYNAMIC_SCROLL_TRACK}`,

          pin: true,

          anticipatePin: 1,

          scrub: true,

          invalidateOnRefresh: true,

          onRefresh: () => {
            ScrollTrigger.update();
          },

          onUpdate: () => {
            const sec5Time = tl.labels["sec5FullyRevealed"];

            const ctaTime = tl.labels["ctaStart"];

            if (
              typeof sec5Time !== "number" ||
              typeof ctaTime !== "number"
            ) {
              return;
            }

            const currentTime = tl.time();

            /*
             * Section Five card progress.
             */

            if (
              currentTime >= sec5Time &&
              currentTime < ctaTime
            ) {
              const sec5Progress =
                (currentTime - sec5Time) /
                (ctaTime - sec5Time);

              if (sec5Progress < 0.33) {
                triggerSec5Hook(0);
              } else if (sec5Progress < 0.66) {
                triggerSec5Hook(1);
              } else {
                triggerSec5Hook(2);
              }
            }

            /*
             * Reverse back above Section Five.
             */

            else if (currentTime < sec5Time) {
              triggerSec5Hook(0);
            }
          },
        },
      });

      /*
       * ========================================================
       * TRANSITION 1
       * HERO → SECTION ONE
       * ========================================================
       */

      tl.to(".about-section-one", {
        yPercent: 0,
        duration: ACTION,
      }).to(
        ".about-hero-bg",
        {
          scale: 1,
          yPercent: -15,
          duration: ACTION,
        },
        "<"
      );

      tl.to(
        {},
        {
          duration: DEAD_SCROLL,
        }
      );

      /*
       * ========================================================
       * TRANSITION 2
       * SECTION ONE → SECTION TWO
       * ========================================================
       */

      tl.to(".about-section-two", {
        yPercent: 0,
        duration: ACTION,
      }).to(
        ".about-section-one",
        {
          yPercent: -15,
          duration: ACTION,
        },
        "<"
      );

      tl.to(
        {},
        {
          duration: DEAD_SCROLL,
        }
      );

      /*
       * ========================================================
       * TRANSITION 3
       * SECTION TWO → SECTION THREE
       * ========================================================
       */

      tl.to(".about-section-three", {
        yPercent: 0,
        duration: ACTION,
      }).to(
        ".about-section-two",
        {
          yPercent: -15,
          duration: ACTION,
        },
        "<"
      );

      tl.to(
        {},
        {
          duration: DEAD_SCROLL,
        }
      );

      /*
       * ========================================================
       * TRANSITION 4
       * SECTION THREE → SECTION FOUR
       * ========================================================
       */

      tl.to(".about-section-four", {
        yPercent: 0,
        duration: ACTION,
      }).to(
        ".about-section-three",
        {
          yPercent: -15,
          duration: ACTION,
        },
        "<"
      );

      tl.to(
        {},
        {
          duration: DEAD_SCROLL,
        }
      );

      /*
       * ========================================================
       * TRANSITION 5
       * SECTION FOUR → SECTION FIVE
       * ========================================================
       */

      tl.addLabel("sec5Start");

      tl.to(
        ".about-section-five",
        {
          yPercent: 0,
          duration: ACTION,

          onStart: () => {
            setIsSectionFiveActive(true);
          },

          onReverseComplete: () => {
            setIsSectionFiveActive(false);
            triggerSec5Hook(0);
          },
        },
        "sec5Start"
      );

      tl.to(
        ".about-section-four",
        {
          yPercent: -15,
          duration: ACTION,
        },
        "sec5Start"
      );

      /*
       * Section Five fully visible.
       */

      tl.addLabel(
        "sec5FullyRevealed",
        `sec5Start+=${ACTION}`
      );

      /*
       * Small hold.
       */

      tl.to(
        {},
        {
          duration: SEC5_CARDS_HOLD,
        }
      );

      /*
       * ========================================================
       * TRANSITION 6
       * SECTION FIVE → CTA
       * ========================================================
       */

      tl.addLabel("ctaStart", ">");

      tl.set(
        ".about-section-cta",
        {
          visibility: "visible",
        },
        "ctaStart"
      );

      tl.fromTo(
        ".about-section-cta",
        {
          yPercent: 100,
        },
        {
          yPercent: 0,
          duration: ACTION * 1.2,
          ease: "none",
        },
        "ctaStart"
      );

      tl.to(
        ".about-section-five",
        {
          yPercent: 0,
          duration: ACTION * 1.2,
          ease: "none",
        },
        "ctaStart"
      );

      /*
       * Section Five background movement.
       */

      tl.fromTo(
        ".about-section-five .s5-bg",
        {
          yPercent: 0,
          scale: 1,
        },
        {
          yPercent: -55,
          scale: 1,
          duration: ACTION + SEC5_CARDS_HOLD,
          ease: "none",
        },
        "sec5Start"
      );

      tl.to(
        {},
        {
          duration: DEAD_SCROLL,
        }
      );

      /*
       * ========================================================
       * TRANSITION 7
       * CTA → FOOTER
       * ========================================================
       *
       * IMPORTANT:
       *
       * Footer does NOT become 100dvh.
       *
       * The wrapper stays:
       *
       *   position: absolute
       *   left: 0
       *   bottom: 0
       *
       * and keeps its natural height.
       *
       * yPercent: 100 means the entire footer starts below
       * its own height.
       *
       * yPercent: 0 means the footer bottom meets the viewport
       * bottom exactly.
       */

      tl.addLabel("footerStart", ">");

      tl.set(
        ".about-footer-wrap",
        {
          visibility: "visible",
        },
        "footerStart"
      );

      tl.fromTo(
        ".about-footer-wrap",
        {
          yPercent: 100,
        },
        {
          yPercent: 0,
          duration: ACTION,
          ease: "none",
        },
        "footerStart"
      );

      /*
       * Small final hold.
       */

      tl.to(
        {},
        {
          duration: DEAD_SCROLL,
        }
      );

      /*
       * Initial refresh.
       */

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }, scopeRef);

    return () => {
      ctx.revert();
    };
  }, [introDone]);

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div ref={scopeRef}>
      <div
        className="about-pin pin-all relative w-full overflow-hidden h-[100dvh]"
        style={{
          visibility: "visible",
        }}
      >
        {/* =====================================================
            HERO
        ===================================================== */}

        <div
          className="about-hero-panel-left absolute inset-0 w-full h-full"
          style={{
            zIndex: 10,
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
          }}
        >
          <Hero isMobile={true} />
        </div>

        {/* =====================================================
            SECTION ONE
        ===================================================== */}

        <div
          className="about-section-one absolute inset-0 w-full h-full"
          style={{
            zIndex: 20,
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
          }}
        >
          <SectionOne />
        </div>

        {/* =====================================================
            SECTION TWO
        ===================================================== */}

        <div
          className="about-section-two absolute inset-0 w-full h-full"
          style={{
            zIndex: 30,
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
          }}
        >
          <SectionTwo />
        </div>

        {/* =====================================================
            SECTION THREE
        ===================================================== */}

        <div
          className="about-section-three absolute inset-0 w-full h-full"
          style={{
            zIndex: 40,
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
          }}
        >
          <SectionThree />
        </div>

        {/* =====================================================
            SECTION FOUR
        ===================================================== */}

        <div
          className="about-section-four absolute inset-0 w-full h-full"
          style={{
            zIndex: 50,
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
          }}
        >
          <SectionFour />
        </div>

        {/* =====================================================
            SECTION FIVE
        ===================================================== */}

        <div
          className="about-section-five absolute inset-0 w-full h-full"
          style={{
            zIndex: 60,
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
          }}
        >
          <SectionFive
            isActive={isSectionFiveActive}
          />
        </div>

        {/* =====================================================
            CTA
            FULL VIEWPORT HEIGHT — UNCHANGED
        ===================================================== */}

        <div
          className="about-section-cta absolute inset-x-0 bottom-0 w-full min-h-[100dvh] z-[150]"
          style={{
            pointerEvents: "auto",
            visibility: "hidden",
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
          }}
        >
          <SectionCTA />
        </div>

        {/* =====================================================
            FOOTER
            IMPORTANT:
            NO h-screen
            NO min-h-screen
            NO h-[100dvh]
            
            Natural footer height only.
            Bottom remains locked to viewport bottom.
        ===================================================== */}

        <div
          className="about-footer-wrap absolute left-0 bottom-0 w-full z-[160]"
          style={{
            pointerEvents: "auto",
            visibility: "hidden",
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
          }}
        >
          <Footer />
        </div>
      </div>
    </div>
  );
}