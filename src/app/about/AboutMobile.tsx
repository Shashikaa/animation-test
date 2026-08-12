"use client";

import Hero from "@/src/components/About/Hero";
import SectionOne from "@/src/components/About/SectionOne";
import SectionTwo from "@/src/components/About/SectionTwo";
import SectionThree from "@/src/components/About/SectionThree";
import SectionFour from "@/src/components/About/SectionFour";
import SectionFive from "@/src/components/About/SectionFive";
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";
import { useState, useRef, useEffect } from "react";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";

const easeOutQuad = (t: number) => t * (2 - t);

export default function AboutMobile() {
  const [isSectionFiveActive, setIsSectionFiveActive] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);
  const ctaWrapRef = useRef<HTMLDivElement>(null);

  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const rafId = useRef<number | null>(null);

  const vhRef = useRef<number>(0);
  const lastWidthRef = useRef<number>(0);
  const lastSec5Idx = useRef<number>(-1);
  const isInputFocusedRef = useRef<boolean>(false);

  const { smootherRef } = useSite();
  const { introDone, preloaderDone } = useHeroIntro(scopeRef, { isMobile: true });

  // ── 1. GLOBAL FORM & DROPDOWN FOCUS DETECTOR ──
  useEffect(() => {
    const isInteractiveElement = (target: HTMLElement | null) => {
      if (!target) return false;
      const tag = target.tagName;
      const role = target.getAttribute("role");
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        role === "combobox" ||
        role === "listbox" ||
        role === "option" ||
        target.isContentEditable ||
        target.closest(".custom-dropdown") !== null
      );
    };

    const handleFocusIn = (e: FocusEvent) => {
      if (isInteractiveElement(e.target as HTMLElement)) {
        isInputFocusedRef.current = true;
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      // Small timeout allows focus switching between dropdown options without jarring jumps
      setTimeout(() => {
        const active = document.activeElement as HTMLElement;
        if (!isInteractiveElement(active)) {
          isInputFocusedRef.current = false;
        }
      }, 50);
    };

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);

    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  // ── 2. STABLE VIEWPORT HEIGHT ──
  useEffect(() => {
    const updateVh = () => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;

      if (
        !isInputFocusedRef.current &&
        (vhRef.current === 0 || currentWidth !== lastWidthRef.current)
      ) {
        vhRef.current = currentHeight;
        lastWidthRef.current = currentWidth;
        if (fixedFrameRef.current) {
          fixedFrameRef.current.style.height = `${currentHeight}px`;
        }
      }
    };

    updateVh();

    const handleResize = () => updateVh();
    const handleOrientation = () => setTimeout(updateVh, 250);

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientation);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientation);
    };
  }, []);

  // ── 3. LOCK SCROLL UNTIL INTRO COMPLETES ──
  useEffect(() => {
    const lenis = smootherRef?.current;

    if (!preloaderDone || !introDone) {
      if (lenis) lenis.stop();
      window.scrollTo(0, 0);
      targetProgress.current = 0;
      currentProgress.current = 0;

      if (fixedFrameRef.current) {
        fixedFrameRef.current.style.position = "fixed";
        fixedFrameRef.current.style.top = "0px";
        fixedFrameRef.current.style.bottom = "auto";
      }
    } else {
      if (lenis) lenis.start();
    }
  }, [preloaderDone, introDone, smootherRef]);

  // ── 4. SCROLL & ANIMATION ENGINE ──
  useEffect(() => {
    if (!preloaderDone || !introDone) return;

    const panels = trackRef.current?.querySelectorAll<HTMLElement>(".about-stack-layer");
    if (!panels || panels.length === 0) return;

    const triggerSec5Hook = (nextIdx: number) => {
      if (nextIdx !== lastSec5Idx.current) {
        lastSec5Idx.current = nextIdx;
        if ((window as any)._sec5GoTo) {
          (window as any)._sec5GoTo(nextIdx);
        }
      }
    };

    const updatePhysics = () => {
      const vh = vhRef.current || window.innerHeight;
      if (!vh) {
        rafId.current = requestAnimationFrame(updatePhysics);
        return;
      }

      // Freeze transform movements during input or dropdown interaction
      if (isInputFocusedRef.current) {
        currentProgress.current = targetProgress.current;
        rafId.current = requestAnimationFrame(updatePhysics);
        return;
      }

      const lerpFactor = 0.12;
      currentProgress.current += (targetProgress.current - currentProgress.current) * lerpFactor;

      const ctaWrapEl = ctaWrapRef.current;
      const combinedHeight = ctaWrapEl ? ctaWrapEl.offsetHeight : vh;
      const extraScroll = Math.max(0, combinedHeight - vh);
      const ctaStepLength = extraScroll > 0 ? 1 + extraScroll / vh : 1;

      const totalSteps = 7.0 + ctaStepLength;
      const requiredTrackHeight = (totalSteps + 1) * vh;

      if (trackRef.current) {
        if (Math.abs(trackRef.current.offsetHeight - requiredTrackHeight) > 2) {
          trackRef.current.style.height = `${requiredTrackHeight}px`;
        }
      }

      const stepProgress = currentProgress.current * totalSteps;

      // Card Stacking Progress (Sections 1-5)
      const s1Progress = easeOutQuad(Math.min(Math.max(stepProgress - 0, 0), 1));
      const s2Progress = easeOutQuad(Math.min(Math.max(stepProgress - 1, 0), 1));
      const s3Progress = easeOutQuad(Math.min(Math.max(stepProgress - 2, 0), 1));
      const s4Progress = easeOutQuad(Math.min(Math.max(stepProgress - 3, 0), 1));
      const s5Progress = easeOutQuad(Math.min(Math.max(stepProgress - 4, 0), 1));

      if (panels[1]) panels[1].style.transform = `translate3d(0, ${(1 - s1Progress) * 100}%, 0)`;
      if (panels[2]) panels[2].style.transform = `translate3d(0, ${(1 - s2Progress) * 100}%, 0)`;
      if (panels[3]) panels[3].style.transform = `translate3d(0, ${(1 - s3Progress) * 100}%, 0)`;
      if (panels[4]) panels[4].style.transform = `translate3d(0, ${(1 - s4Progress) * 100}%, 0)`;
      if (panels[5]) panels[5].style.transform = `translate3d(0, ${(1 - s5Progress) * 100}%, 0)`;

      if (stepProgress >= 4.5 && stepProgress < 7.0) {
        setIsSectionFiveActive(true);
        const sec5SubProgress = (stepProgress - 4.5) / 2.5;

        if (sec5SubProgress < 0.33) {
          triggerSec5Hook(0);
        } else if (sec5SubProgress < 0.66) {
          triggerSec5Hook(1);
        } else {
          triggerSec5Hook(2);
        }
      } else {
        if (stepProgress < 4.5) {
          setIsSectionFiveActive(false);
          triggerSec5Hook(0);
        }
      }

      // Translate CTA + Footer combined layer
      const rawCtaProgress = Math.min(Math.max((stepProgress - 7.0) / ctaStepLength, 0), 1);
      const ctaY = (1 - rawCtaProgress) * vh - rawCtaProgress * extraScroll;

      if (ctaWrapEl) {
        ctaWrapEl.style.transform = `translate3d(0, ${ctaY}px, 0)`;
      }

      rafId.current = requestAnimationFrame(updatePhysics);
    };

    const handleScroll = () => {
      if (isInputFocusedRef.current) return;
      if (!trackRef.current || !fixedFrameRef.current) return;

      const trackRect = trackRef.current.getBoundingClientRect();
      const vh = vhRef.current || window.innerHeight;
      const totalScrollable = trackRect.height - vh;

      if (totalScrollable <= 0) return;

      if (trackRect.top <= 0 && trackRect.bottom >= vh) {
        fixedFrameRef.current.style.position = "fixed";
        fixedFrameRef.current.style.top = "0px";
        fixedFrameRef.current.style.bottom = "auto";
      } else if (trackRect.bottom < vh) {
        fixedFrameRef.current.style.position = "absolute";
        fixedFrameRef.current.style.top = "auto";
        fixedFrameRef.current.style.bottom = "0px";
      } else {
        fixedFrameRef.current.style.position = "absolute";
        fixedFrameRef.current.style.top = "0px";
        fixedFrameRef.current.style.bottom = "auto";
      }

      const currentScroll = Math.max(0, -trackRect.top);
      targetProgress.current = Math.min(Math.max(currentScroll / totalScrollable, 0), 1);
    };

    rafId.current = requestAnimationFrame(updatePhysics);

    const lenis = smootherRef?.current;
    if (lenis) {
      lenis.on("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    handleScroll();

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      if (lenis) {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [introDone, preloaderDone, smootherRef]);

  const isReady = preloaderDone && introDone;

  return (
    <div ref={scopeRef}>
      {/* ANIMATED CARDS TRACK CONTAINER */}
      <div
        ref={trackRef}
        className="about-track-container relative w-full min-h-[800vh]"
        style={{ height: "800vh" }}
      >
        <div
          ref={fixedFrameRef}
          className="fixed top-0 left-0 w-full overflow-hidden bg-[#162D24] z-10"
          style={{ height: vhRef.current ? `${vhRef.current}px` : "100vh" }}
        >
          {/* 0: HERO PANEL */}
          <div className="about-stack-layer absolute inset-0 w-full h-full z-10 gpu-accelerated">
            <Hero isMobile={true} />
          </div>

          {/* 1: SECTION ONE */}
          <div
            className="about-stack-layer absolute inset-0 w-full h-full z-20 gpu-accelerated"
            style={{ transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionOne />
          </div>

          {/* 2: SECTION TWO */}
          <div
            className="about-stack-layer absolute inset-0 w-full h-full z-30 gpu-accelerated"
            style={{ transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionTwo />
          </div>

          {/* 3: SECTION THREE */}
          <div
            className="about-stack-layer absolute inset-0 w-full h-full z-40 gpu-accelerated"
            style={{ transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionThree />
          </div>

          {/* 4: SECTION FOUR */}
          <div
            className="about-stack-layer absolute inset-0 w-full h-full z-50 gpu-accelerated"
            style={{ transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionFour />
          </div>

          {/* 5: SECTION FIVE */}
          <div
            className="about-stack-layer absolute inset-0 w-full h-full z-[60] gpu-accelerated"
            style={{ transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionFive isActive={isSectionFiveActive} />
          </div>

          {/* 6: SECTION CTA + FOOTER WRAPPER */}
          <div
            ref={ctaWrapRef}
            className="about-stack-layer absolute left-0 top-0 w-full z-[70] gpu-accelerated bg-[#162D24]"
            style={{
              transform: "translate3d(0, 100%, 0)",
              opacity: isReady ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          >
            {/* CTA Layer placed strictly ABOVE Footer z-index */}
            <div className="relative z-20 w-full">
              <SectionCTA />
            </div>
            
            {/* Footer Layer placed strictly BELOW CTA z-index */}
            <footer className="relative z-10 w-full bg-[#162D24]">
              <Footer />
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}