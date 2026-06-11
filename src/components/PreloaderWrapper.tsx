"use client";

import { useEffect } from "react";
import Preloader from "./Preloader";
import { useSite } from "../app/context/SiteContext";

export default function PreloaderWrapper() {
  const { setPreloaderDone } = useSite();
  // NOTE: We intentionally do NOT call lenisRef.current?.start() here.
  // Lenis will be started by page.tsx's onScrollReady callback, which fires
  // only after the GSAP pin timeline is fully built and ScrollTrigger has
  // refreshed. Starting Lenis before that causes a window where scroll input
  // is accepted but the pin isn't listening yet — producing the "dead scroll"
  // gap after the preloader finishes.

  useEffect(() => {
    // Remove the preloading lock class only after the component mounts —
    // not on a racing rAF that could fire before the pin is ready.
    // The actual overflow is controlled by the preloading CSS class; we
    // remove it here so layout is correct, but Lenis stays stopped until
    // onScrollReady fires.
    document.body.classList.remove("preloading");
  }, []);

  const handleComplete = () => {
    // Signal React that the preloader is done. This causes page.tsx's
    // useEffect([preloaderDone]) to run, which builds the timeline and
    // calls onScrollReady() at the end — that's when Lenis starts.
    setPreloaderDone(true);
  };

  return <Preloader onComplete={handleComplete} />;
}