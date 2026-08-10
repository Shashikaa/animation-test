"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "../app/context/SiteContext";
import Preloader from "./Preloader";
import FadePreloader from "./FadePreloader";

export default function PreloaderToggle() {
  const pathname = usePathname();
  const { setPreloaderDone, markBrandPreloaderSeen } = useSite();
  const [mounted, setMounted] = useState(false);
  const [loaderType, setLoaderType] = useState<"brand" | "fade" | "none">("none");
  const isPopStateRef = useRef(false);
  const prevPathnameRef = useRef(pathname);

  // Monitor browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      isPopStateRef.current = true;
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    setMounted(true);

    // Skip preloader on Back/Forward navigation
    if (isPopStateRef.current) {
      isPopStateRef.current = false;
      prevPathnameRef.current = pathname;
      setLoaderType("none");
      document.documentElement.classList.remove("show-brand-preloader", "show-fade-preloader", "preloading");
      document.body.classList.remove("preloading");
      setPreloaderDone(true);
      return;
    }

    // Skip on exempt routes
    if (pathname === "/terms" || pathname === "/privacy-policy" || pathname === "/not-found") {
      setLoaderType("none");
      document.documentElement.classList.remove("show-brand-preloader", "show-fade-preloader", "preloading");
      document.body.classList.remove("preloading");
      setPreloaderDone(true);
      prevPathnameRef.current = pathname;
      return;
    }

    // Check if brand loader should show (First Home Visit)
    const isSeen = sessionStorage.getItem("hasSeenBrandPreloader") === "true";
    if (pathname === "/" && !isSeen) {
      setLoaderType("brand");
      document.documentElement.classList.add("show-brand-preloader", "preloading");
      document.body.classList.add("preloading");
      setPreloaderDone(false);
    } 
    // Trigger Fade Loader on client route change or initial page hit
    else if (pathname !== prevPathnameRef.current || loaderType === "none") {
      setLoaderType("fade");
      document.documentElement.classList.add("show-fade-preloader", "preloading");
      document.body.classList.add("preloading");
      setPreloaderDone(false);
    }

    prevPathnameRef.current = pathname;
  }, [pathname, setPreloaderDone]);

  // Brand Preloader Complete
  const handleBrandComplete = useCallback(() => {
    markBrandPreloaderSeen();
    document.documentElement.classList.remove("show-brand-preloader", "preloading");
    document.body.classList.remove("preloading");
    setPreloaderDone(true);
    setLoaderType("none");
  }, [markBrandPreloaderSeen, setPreloaderDone]);

  // Fade Preloader Exit Start
  const handleFadeExitStart = useCallback(() => {
    document.documentElement.classList.remove("preloading");
    document.body.classList.remove("preloading");
  }, []);

  // Fade Preloader Complete
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