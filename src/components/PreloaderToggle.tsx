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
    
    if (pathname === "/terms" || pathname === "/privacy-policy") {
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

  // Brand Preloader Complete Callback (Triggers when Brand Loader animation finishes)
  const handleBrandComplete = useCallback(() => {
    markBrandPreloaderSeen();
    document.documentElement.classList.remove("show-brand-preloader", "preloading");
    document.body.classList.remove("preloading");
    setPreloaderDone(true);
    setLoaderType("none");
  }, [markBrandPreloaderSeen, setPreloaderDone]);

  // Fade Preloader Exit Start (removes body scrolling lock, keeps preloaderDone false until completely faded)
  const handleFadeExitStart = useCallback(() => {
    document.documentElement.classList.remove("preloading");
    document.body.classList.remove("preloading");
  }, []);

  // Fade Preloader Complete Callback (Triggers ONLY when Fade Loader opacity hits 0)
  const handleFadeComplete = useCallback(() => {
    document.documentElement.classList.remove("show-fade-preloader", "preloading");
    document.body.classList.remove("preloading");
    setPreloaderDone(true);
    setLoaderType("none");
  }, [setPreloaderDone]);

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