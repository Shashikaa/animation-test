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

  const vhRef = useRef<number>(0);
  const lastWidthRef = useRef<number>(0);
  const lastSec5Idx = useRef<number>(-1);

  const { smootherRef } = useSite();
  const { introDone, preloaderDone } = useHeroIntro(scopeRef, { isMobile: true });

  // ── 1. INITIALIZE VIEWPORT HEIGHT ──
  useEffect(() => {
    const updateVh = () => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") return;

      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;

      if (vhRef.current === 0 || currentWidth !== lastWidthRef.current) {
        vhRef.current = currentHeight;
        lastWidthRef.current = currentWidth;
        if (fixedFrameRef.current) {
          fixedFrameRef.current.style.height = `${currentHeight}px`;
        }
      }
    };

    updateVh();

    const handleResize = () => updateVh();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ── 2. INTRO UNLOCK & LENIS RESUME ──
  useEffect(() => {
    const lenis = smootherRef?.current;

    if (!preloaderDone || !introDone) {
      if (lenis && typeof lenis.stop === "function") lenis.stop();
      window.scrollTo(0, 0);
      targetProgress.current = 0;
      currentProgress.current = 0;
    } else {
      if (lenis && typeof lenis.start === "function") {
        lenis.start();
      }
      window.dispatchEvent(new Event("scroll"));
    }

    return () => {
      if (lenis && typeof lenis.start === "function") {
        lenis.start();
      }
    };
  }, [preloaderDone, introDone, smootherRef]);

  // ── 3. SECTION 5 TRIGGER HOOK ──
  const triggerSec5Hook = useCallback((nextIdx: number) => {
    if (nextIdx !== lastSec5Idx.current) {
      lastSec5Idx.current = nextIdx;
      if (typeof window !== "undefined" && (window as any)._sec5GoTo) {
        (window as any)._sec5GoTo(nextIdx);
      }
    }
  }, []);

  // ── 4. STACK ANIMATION LOOP ──
  useEffect(() => {
    if (!preloaderDone || !introDone) return;

    const panels = trackRef.current?.querySelectorAll<HTMLElement>(".about-stack-layer");
    if (!panels || panels.length === 0) return;

    const updatePhysics = () => {
      const vh = vhRef.current || window.innerHeight;
      if (!vh) {
        rafId.current = requestAnimationFrame(updatePhysics);
        return;
      }

      const lerpFactor = 0.12;
      currentProgress.current += (targetProgress.current - currentProgress.current) * lerpFactor;

      // Snap precision to prevent boundary lag
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

    const handleScroll = () => {
      if (!trackRef.current || !fixedFrameRef.current) return;

      const trackRect = trackRef.current.getBoundingClientRect();
      const vh = vhRef.current || window.innerHeight;
      const totalScrollable = trackRect.height - vh;

      if (totalScrollable <= 0) return;

      const buffer = 8;
      const lenis = smootherRef?.current;

      if (trackRect.top <= 0 && trackRect.bottom >= vh - buffer) {
        if (fixedFrameRef.current.style.position !== "fixed") {
          fixedFrameRef.current.style.position = "fixed";
          fixedFrameRef.current.style.top = "0px";
          fixedFrameRef.current.style.bottom = "auto";
          if (lenis && typeof lenis.resize === "function") lenis.resize();
        }
      } else if (trackRect.bottom < vh - buffer) {
        if (
          fixedFrameRef.current.style.position !== "absolute" ||
          fixedFrameRef.current.style.bottom !== "0px"
        ) {
          fixedFrameRef.current.style.position = "absolute";
          fixedFrameRef.current.style.top = "auto";
          fixedFrameRef.current.style.bottom = "0px";
          if (lenis && typeof lenis.resize === "function") lenis.resize();
        }
      } else {
        if (
          fixedFrameRef.current.style.position !== "absolute" ||
          fixedFrameRef.current.style.top !== "0px"
        ) {
          fixedFrameRef.current.style.position = "absolute";
          fixedFrameRef.current.style.top = "0px";
          fixedFrameRef.current.style.bottom = "auto";
          if (lenis && typeof lenis.resize === "function") lenis.resize();
        }
      }

      const currentScroll = Math.max(0, -trackRect.top);
      targetProgress.current = Math.min(Math.max(currentScroll / totalScrollable, 0), 1);
    };

    rafId.current = requestAnimationFrame(updatePhysics);

    const lenis = smootherRef?.current;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    handleScroll();

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }

      if (typeof window !== "undefined") {
        delete (window as any)._sec5GoTo;
      }
    };
  }, [introDone, preloaderDone, smootherRef, triggerSec5Hook]);

  const isReady = preloaderDone && introDone;

  return (
    <div ref={scopeRef} className="w-full bg-[#162D24] relative">
      <div
        ref={trackRef}
        className="about-track-container relative w-full"
        style={{ height: "800vh" }}
      >
        <div
          ref={fixedFrameRef}
          className="fixed top-0 left-0 w-full overflow-hidden bg-[#162D24] z-10"
          style={{ height: vhRef.current ? `${vhRef.current}px` : "100vh" }}
        >
          <div className="about-stack-layer absolute inset-0 w-full h-full z-10 gpu-accelerated">
            <Hero isMobile={true} />
          </div>

          <div
            className="about-stack-layer absolute inset-0 w-full h-full z-20 gpu-accelerated"
            style={{ transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionOne />
          </div>

          <div
            className="about-stack-layer absolute inset-0 w-full h-full z-30 gpu-accelerated"
            style={{ transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionTwo />
          </div>

          <div
            className="about-stack-layer absolute inset-0 w-full h-full z-40 gpu-accelerated"
            style={{ transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionThree />
          </div>

          <div
            className="about-stack-layer absolute inset-0 w-full h-full z-50 gpu-accelerated"
            style={{ transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionFour />
          </div>

          <div
            className="about-stack-layer absolute inset-0 w-full h-full z-[60] gpu-accelerated"
            style={{ transform: "translate3d(0, 100%, 0)" }}
          >
            <SectionFive isActive={isSectionFiveActive} />
          </div>
        </div>
      </div>

      <div className="relative z-[70] w-full bg-[#162D24] touch-auto">
        <SectionCTA preloaderDone={isReady} />
        <footer className="w-full bg-[#162D24]">
          <Footer />
        </footer>
      </div>
    </div>
  );
}