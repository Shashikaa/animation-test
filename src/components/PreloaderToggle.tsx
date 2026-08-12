"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "../app/context/SiteContext";
import Preloader from "./Preloader";
import FadePreloader from "./FadePreloader";

export default function PreloaderToggle() {
  const pathname = usePathname();
  const { setPreloaderDone, markBrandPreloaderSeen } = useSite();
  const [mounted, setMounted] = useState(false);
  const [loaderType, setLoaderType] = useState<"brand" | "fade" | "none">("none");

  useEffect(() => {
    setMounted(true);
    
    // Disable native scroll restoration instantly on route change
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    }
    
    if (pathname === "/terms" || pathname === "/privacy-policy" || pathname === "/not-found") {
      setLoaderType("none");
      document.documentElement.classList.remove("show-brand-preloader", "show-fade-preloader", "preloading");
      document.body.classList.remove("preloading");
      setPreloaderDone(true);
      return;
    }

    const isSeen = sessionStorage.getItem("hasSeenBrandPreloader") === "true";
    if (pathname === "/" && !isSeen) {
      setLoaderType("brand");
    } else {
      setLoaderType("fade");
    }
  }, [pathname, setPreloaderDone]);

  // Brand Preloader Complete Callback
  const handleBrandComplete = useCallback(() => {
    markBrandPreloaderSeen();
    document.documentElement.classList.remove("show-brand-preloader", "preloading");
    document.body.classList.remove("preloading");
    window.scrollTo(0, 0);
    setPreloaderDone(true);
    setLoaderType("none");
  }, [markBrandPreloaderSeen, setPreloaderDone]);

  // Fade Preloader Exit Start -> TRIGGER HERO ANIMATION AND UNLOCK HERE
  const handleFadeExitStart = useCallback(() => {
    document.documentElement.classList.remove("preloading");
    document.body.classList.remove("preloading");
    setPreloaderDone(true); // <--- Triggers preloaderDone immediately as the preloader begins fading out
  }, [setPreloaderDone]);

  // Fade Preloader Complete Callback (Unmounts preloader element after opacity reaches 0)
  const handleFadeComplete = useCallback(() => {
    document.documentElement.classList.remove("show-fade-preloader");
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
    setLoaderType("none");
  }, []);

  return (
    <>
      <div id="brand-preloader-root">
        {(!mounted || loaderType === "brand") && (
          <Preloader key="brand-preloader" onComplete={handleBrandComplete} />
        )}
      </div>

      <div id="fade-preloader-root">
        {(!mounted || loaderType === "fade") && (
          <FadePreloader
            key={`fade-loader-${pathname}`}
            onExitStart={handleFadeExitStart}
            onComplete={handleFadeComplete}
          />
        )}
      </div>
    </>
  );
}