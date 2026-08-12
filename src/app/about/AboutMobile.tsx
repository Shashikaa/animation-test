"use client";

import Hero from "@/src/components/About/Hero";
import SectionOne from "@/src/components/About/SectionOne";
import SectionTwo from "@/src/components/About/SectionTwo";
import SectionThree from "@/src/components/About/SectionThree";
import SectionFour from "@/src/components/About/SectionFour";
import SectionFive from "@/src/components/About/SectionFive";
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";

const easeOutQuad = (t: number) => t * (2 - t);

export default function AboutMobile() {
  const [isSectionFiveActive, setIsSectionFiveActive] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const rafId = useRef<number | null>(null);

  const lastSec5Idx = useRef<number>(-1);

  const { smootherRef } = useSite();
  const { introDone, preloaderDone } = useHeroIntro(scopeRef, { isMobile: true });

  // ── 1. INTRO UNLOCK & LENIS RESUME ──
  useEffect(() => {
    const lenis = smootherRef?.current;

    if (!preloaderDone || !introDone) {
      if (lenis && typeof lenis.stop === "function") lenis.stop();
      targetProgress.current = 0;
      currentProgress.current = 0;
    } else {
      if (lenis && typeof lenis.start === "function") {
        lenis.start();
      }
    }
  }, [preloaderDone, introDone, smootherRef]);

  // ── 2. SECTION 5 TRIGGER HOOK ──
  const triggerSec5Hook = useCallback((nextIdx: number) => {
    if (nextIdx !== lastSec5Idx.current) {
      lastSec5Idx.current = nextIdx;
      if (typeof window !== "undefined" && (window as any)._sec5GoTo) {
        (window as any)._sec5GoTo(nextIdx);
      }
    }
  }, []);

  // ── 3. STACK ANIMATION & FIXED FRAME POSITIONING ──
  useEffect(() => {
    if (!preloaderDone || !introDone) return;

    const panels = trackRef.current?.querySelectorAll<HTMLElement>(".about-stack-layer");
    if (!panels || panels.length === 0) return;

    const updatePhysics = () => {
      const lerpFactor = 0.12;
      currentProgress.current += (targetProgress.current - currentProgress.current) * lerpFactor;

      if (Math.abs(targetProgress.current - currentProgress.current) < 0.0001) {
        currentProgress.current = targetProgress.current;
      }

      const totalSteps = 7.0;
      const stepProgress = currentProgress.current * totalSteps;

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

      const s5Bg = scopeRef.current?.querySelector<HTMLElement>(".s5-bg");
      if (s5Bg) {
        const parallaxProg = Math.min(Math.max((stepProgress - 4.0) / 3.0, 0), 1);
        s5Bg.style.transform = `translate3d(0, ${-parallaxProg * 50}%, 0)`;
      }

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

      rafId.current = requestAnimationFrame(updatePhysics);
    };

    const handleScroll = (e?: any) => {
      if (!trackRef.current || !fixedFrameRef.current) return;

      const trackTop = trackRef.current.offsetTop;
      const trackHeight = trackRef.current.offsetHeight;
      const vh = window.innerHeight;
      const totalScrollable = trackHeight - vh;

      // Extract scroll position from Lenis or DOM event
      const scrollY = e?.scroll !== undefined ? e.scroll : (e?.target?.scrollTop || window.scrollY);

      // Lock fixed position from the very start (scrollY = 0) until track completion
      if (scrollY < trackTop + totalScrollable) {
        fixedFrameRef.current.style.position = "fixed";
        fixedFrameRef.current.style.top = "0px";
        fixedFrameRef.current.style.bottom = "auto";
      } else {
        // Switch to absolute at bottom of track to allow smooth transition into CTA and Footer
        fixedFrameRef.current.style.position = "absolute";
        fixedFrameRef.current.style.top = "auto";
        fixedFrameRef.current.style.bottom = "0px";
      }

      const currentScroll = Math.max(0, scrollY - trackTop);
      targetProgress.current = Math.min(Math.max(currentScroll / totalScrollable, 0), 1);
    };

    rafId.current = requestAnimationFrame(updatePhysics);

    const lenis = smootherRef?.current;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", handleScroll);
    }

    // Call handleScroll once immediately on mount to establish position 0 lock
    handleScroll();

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", handleScroll);
      }

      if (typeof window !== "undefined") {
        delete (window as any)._sec5GoTo;
      }
    };
  }, [introDone, preloaderDone, smootherRef, triggerSec5Hook]);

  const isReady = preloaderDone && introDone;

  return (
    <div ref={scopeRef} className="w-full bg-[#162D24]">
      <div
        ref={trackRef}
        className="about-track-container relative w-full"
        style={{ height: "800vh" }}
      >
        <div
          ref={fixedFrameRef}
          className="fixed top-0 left-0 w-full overflow-hidden bg-[#162D24] z-10 h-[100dvh]"
        >
          <div className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-10 gpu-accelerated">
            <Hero isMobile={true} />
          </div>

          <div
            className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-20 gpu-accelerated"
            style={{ transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionOne />
          </div>

          <div
            className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-30 gpu-accelerated"
            style={{ transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionTwo />
          </div>

          <div
            className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-40 gpu-accelerated"
            style={{ transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionThree />
          </div>

          <div
            className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-50 gpu-accelerated"
            style={{ transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionFour />
          </div>

          <div
            className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-[60] gpu-accelerated"
            style={{ transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionFive isActive={isSectionFiveActive} />
          </div>
        </div>
      </div>

      <div className="relative z-[70] w-full bg-[#162D24]">
        <SectionCTA preloaderDone={isReady} />
        <footer className="w-full bg-[#162D24]">
          <Footer />
        </footer>
      </div>
    </div>
  );
}