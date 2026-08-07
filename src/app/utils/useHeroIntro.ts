"use client";

import { useState, useEffect, useLayoutEffect, RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";

interface UseHeroIntroOptions {
  isMobile?: boolean;
}

export function useHeroIntro(
  scopeRef: RefObject<HTMLElement | null>,
  options: UseHeroIntroOptions = {}
) {
  const { setPreloaderDone, preloaderDone } = useSite();
  const [introDone, setIntroDone] = useState(false);

  // 1. Initial scroll restoration setup and preloader signal
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);
    document.body.classList.remove("preloading");
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  // 2. Lock body scroll during intro sequence
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isFullyReady = preloaderDone && introDone;

    if (!isFullyReady) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [preloaderDone, introDone]);

  // 3. Handle window resize and orientation changes safely
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
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  // 4. Initial GSAP transform state setup before paint
  useLayoutEffect(() => {
    if (!scopeRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.config({
        ignoreMobileResize: true,
        autoRefreshEvents: "DOMContentLoaded,load,visibilitychange",
      });

      const initialScale = options.isMobile ? 1.3 : 1.4;

      // Target background images
      gsap.set([".about-hero-bg", ".contact-hero-bg", ".projects-hero-bg", ".hero-bg-anim"], {
        scale: initialScale,
        force3D: true,
      });

      // Target split panels (Desktop)
      gsap.set(".about-hero-panel-left", {
        clipPath: "inset(0% 0% 0% 0%)",
        WebkitClipPath: "inset(0% 0% 0% 0%)",
        force3D: true,
      });
      gsap.set(".about-hero-panel-right", {
        clipPath: "inset(0% 0% 0% 0%)",
        WebkitClipPath: "inset(0% 0% 0% 0%)",
        force3D: true,
      });

      // Target hero title and description elements across all components
      gsap.set([".hero-title", ".hero-desc", ".hero-description"], {
        opacity: 0,
        y: 30,
        force3D: true,
      });
    }, scopeRef);

    return () => ctx.revert();
  }, [scopeRef, options.isMobile]);

  // 5. Execute Hero entrance timeline sequence
  useEffect(() => {
    if (!scopeRef.current) return;

    const ctx = gsap.context(() => {
      const targetScale = options.isMobile ? 1.1 : 1.15;
      const scaleDuration = options.isMobile ? 2.2 : 1.5;
      const textDuration = options.isMobile ? 1.4 : 1.0;
      const textStagger = options.isMobile ? 0.2 : 0.15;

      const introTl = gsap.timeline({
        onComplete: () => {
          setIntroDone(true);
          setTimeout(() => ScrollTrigger.refresh(), 50);
        },
      });

      // Hero Image Zoom Out
      introTl.to(
        [".about-hero-bg", ".contact-hero-bg", ".projects-hero-bg", ".hero-bg-anim"],
        {
          scale: targetScale,
          duration: scaleDuration,
          ease: "power2.out",
        },
        0
      );

      // Hero Text Staggered Fade & Slide Up (includes title + description)
      introTl.to(
        [".hero-title", ".hero-desc", ".hero-description"],
        {
          opacity: 1,
          y: 0,
          duration: textDuration,
          stagger: textStagger,
          ease: options.isMobile ? "power3.out" : "power2.out",
        },
        options.isMobile ? 0.4 : 0.2
      );
    }, scopeRef);

    return () => ctx.revert();
  }, [scopeRef, options.isMobile]);

  return { introDone, preloaderDone };
}