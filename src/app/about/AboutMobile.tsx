"use client";

import dynamic from "next/dynamic";
import Hero from "@/src/components/About/Hero";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSite } from "@/src/app/context/SiteContext";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";

// Dynamically import downstream sections to prevent CPU/GPU contention during hero intro
const SectionOne = dynamic(() => import("@/src/components/About/SectionOne"));
const SectionTwo = dynamic(() => import("@/src/components/About/SectionTwo"));
const SectionThree = dynamic(() => import("@/src/components/About/SectionThree"));
const SectionFour = dynamic(() => import("@/src/components/About/SectionFour"));
const SectionFive = dynamic(() => import("@/src/components/About/SectionFive"));
const SectionCTA = dynamic(() => import("@/src/components/SectionCTA"));
const Footer = dynamic(() => import("@/src/components/Footer"));

const easeOutQuad = (t: number) => t * (2 - t);

export default function AboutMobile() {
  const [isSectionFiveActive, setIsSectionFiveActive] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const layer6Ref = useRef<HTMLDivElement>(null); // CTA Layer
  const layer7Ref = useRef<HTMLDivElement>(null); // Footer Layer

  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const rafId = useRef<number | null>(null);

  const lastSec5Idx = useRef<number>(-1);

  const { smootherRef } = useSite();
  // Leverages shouldLoadRest to delay mounting heavy DOM nodes until the hero zoom finishes
  const { introDone, preloaderDone, shouldLoadRest } = useHeroIntro(scopeRef, { 
    isMobile: true,
    introDurationMs: 3000,
  });

  // ── 1. INTRO UNLOCK & LENIS RESUME ──
  useEffect(() => {
    const lenis = smootherRef?.current;

    if (!preloaderDone || !introDone) {
      if (lenis && typeof lenis.stop === "function") lenis.stop();
      targetProgress.current = 0;
      currentProgress.current = 0;
      window.scrollTo(0, 0);
    } else {
      document.body.classList.remove("preloading");
      document.documentElement.classList.remove("preloading");

      if (lenis && typeof lenis.start === "function") {
        lenis.start();
      }
      window.dispatchEvent(new Event("scroll"));
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
    if (!preloaderDone || !introDone || !shouldLoadRest) return;

    const updatePhysics = () => {
      const panels = trackRef.current?.querySelectorAll<HTMLElement>(".about-stack-layer");
      
      const lerpFactor = 0.15;
      currentProgress.current += (targetProgress.current - currentProgress.current) * lerpFactor;

      if (Math.abs(targetProgress.current - currentProgress.current) < 0.0001) {
        currentProgress.current = targetProgress.current;
      }

      const totalSteps = 10.0;
      const stepProgress = currentProgress.current * totalSteps;

      // Base sections progress
      const s1Progress = easeOutQuad(Math.min(Math.max(stepProgress - 0, 0), 1));
      const s2Progress = easeOutQuad(Math.min(Math.max(stepProgress - 1, 0), 1));
      const s3Progress = easeOutQuad(Math.min(Math.max(stepProgress - 2, 0), 1));
      const s4Progress = easeOutQuad(Math.min(Math.max(stepProgress - 3, 0), 1));
      const s5Progress = easeOutQuad(Math.min(Math.max(stepProgress - 4, 0), 1));

      // Transition CTA & Footer (Steps 8 -> 10)
      const ctaProgress = easeOutQuad(Math.min(Math.max(stepProgress - 8.0, 0), 1));
      const footerProgress = easeOutQuad(Math.min(Math.max(stepProgress - 9.0, 0), 1));

      if (panels && panels.length > 0) {
        if (panels[1]) panels[1].style.transform = `translate3d(0, ${(1 - s1Progress) * 100}%, 0)`;
        if (panels[2]) panels[2].style.transform = `translate3d(0, ${(1 - s2Progress) * 100}%, 0)`;
        if (panels[3]) panels[3].style.transform = `translate3d(0, ${(1 - s3Progress) * 100}%, 0)`;
        if (panels[4]) panels[4].style.transform = `translate3d(0, ${(1 - s4Progress) * 100}%, 0)`;
        if (panels[5]) panels[5].style.transform = `translate3d(0, ${(1 - s5Progress) * 100}%, 0)`;
      }

      // Layer 6 (CTA)
      if (layer6Ref.current) {
        const ctaHeight = layer6Ref.current.offsetHeight || window.innerHeight;
        const vh = window.innerHeight;
        const startY = vh;
        const endY = -(ctaHeight - vh);

        const currentY = startY + (endY - startY) * ctaProgress;
        layer6Ref.current.style.transform = `translate3d(0, ${currentY}px, 0)`;
      }

      // Layer 7 (Footer)
      if (layer7Ref.current) {
        const footerHeight = layer7Ref.current.offsetHeight || window.innerHeight;
        const vh = window.innerHeight;
        const startY = vh;
        const endY = vh - footerHeight;

        const translateY = startY + (endY - startY) * footerProgress;
        layer7Ref.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
      }

      // Parallax effect on Section 5 background
      const s5Bg = scopeRef.current?.querySelector<HTMLElement>(".s5-bg");
      if (s5Bg) {
        const parallaxProg = Math.min(Math.max((stepProgress - 4.0) / 4.0, 0), 1);
        s5Bg.style.transform = `translate3d(0, ${-parallaxProg * 50}%, 0)`;
      }

      // Section 5 pinned slider trigger boundaries
      if (stepProgress >= 4.5 && stepProgress < 8.0) {
        setIsSectionFiveActive(true);

        if (stepProgress < 6.0) {
          triggerSec5Hook(0);
        } else if (stepProgress < 7.0) {
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
      const vh = window.innerHeight;
      const totalScrollable = trackRect.height - vh;

      if (totalScrollable <= 0) return;

      const buffer = 8;

      if (trackRect.top <= 0 && trackRect.bottom >= vh - buffer) {
        if (fixedFrameRef.current.style.position !== "fixed") {
          fixedFrameRef.current.style.position = "fixed";
          fixedFrameRef.current.style.top = "0px";
          fixedFrameRef.current.style.bottom = "auto";
        }
      } else if (trackRect.bottom < vh - buffer) {
        if (
          fixedFrameRef.current.style.position !== "absolute" ||
          fixedFrameRef.current.style.bottom !== "0px"
        ) {
          fixedFrameRef.current.style.position = "absolute";
          fixedFrameRef.current.style.top = "auto";
          fixedFrameRef.current.style.bottom = "0px";
        }
      } else {
        if (
          fixedFrameRef.current.style.position !== "absolute" ||
          fixedFrameRef.current.style.top !== "0px"
        ) {
          fixedFrameRef.current.style.position = "absolute";
          fixedFrameRef.current.style.top = "0px";
          fixedFrameRef.current.style.bottom = "auto";
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
  }, [introDone, preloaderDone, shouldLoadRest, smootherRef, triggerSec5Hook]);

  const isReady = preloaderDone && introDone;

  return (
    <div ref={scopeRef} className="w-full bg-[#162D24]">
      <div
        ref={trackRef}
        className="about-track-container relative w-full"
        style={{ height: "1300vh" }}
      >
        <div
          ref={fixedFrameRef}
          className="fixed top-0 left-0 w-full overflow-hidden bg-[#162D24] z-10 h-[100dvh]"
        >
          {/* Layer 0: Hero (Renders instantly) */}
          <div className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-10 gpu-accelerated transform-gpu will-change-transform">
            <Hero isMobile={true} />
          </div>

          {/* Deferred Downstream Stack Layers */}
          {shouldLoadRest && (
            <>
              {/* Layer 1 */}
              <div
                className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-20 gpu-accelerated"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionOne />
              </div>

              {/* Layer 2 */}
              <div
                className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-30 gpu-accelerated"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionTwo />
              </div>

              {/* Layer 3 */}
              <div
                className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-40 gpu-accelerated"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionThree />
              </div>

              {/* Layer 4 */}
              <div
                className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-50 gpu-accelerated"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionFour />
              </div>

              {/* Layer 5 */}
              <div
                className="about-stack-layer absolute inset-0 w-full h-[100dvh] z-[60] gpu-accelerated"
                style={{ transform: "translate3d(0, 100%, 0)" }}
              >
                <SectionFive isActive={isSectionFiveActive} />
              </div>

              {/* Layer 6: Section CTA */}
              <div
                ref={layer6Ref}
                className="about-stack-layer layer-auto-height gpu-accelerated absolute left-0 top-0 w-full z-[150]"
                style={{ transform: "translate3d(0, 100vh, 0)" }}
              >
                <SectionCTA preloaderDone={isReady} />
              </div>

              {/* Layer 7: Footer */}
              <div
                ref={layer7Ref}
                className="layer-auto-height gpu-accelerated absolute left-0 top-0 w-full z-[151]"
                style={{ transform: "translate3d(0, 100vh, 0)" }}
              >
                <Footer />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}