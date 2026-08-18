"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "../app/context/SiteContext";
import Preloader from "./Preloader";
import FadePreloader from "./FadePreloader";

export default function PreloaderToggle() {
  const pathname = usePathname();

  const {
    setPreloaderDone,
    markBrandPreloaderSeen,
  } = useSite();

  const [mounted, setMounted] = useState(false);

  const [loaderType, setLoaderType] =
    useState<"brand" | "fade" | "none">("none");

  const isPopStateNav = useRef(false);

  const handleRouteLoader = useCallback(
    (currentPath: string) => {

      // BACK / FORWARD
      if (isPopStateNav.current) {
        // Let browser restore previous scroll position
        window.history.scrollRestoration = "auto";
      } else {
        // Normal Next.js navigation
        window.history.scrollRestoration = "manual";
        window.scrollTo(0, 0);
      }

      // Routes without loader
      if (
        currentPath === "/terms" ||
        currentPath === "/privacy-policy" ||
        currentPath === "/not-found"
      ) {
        setLoaderType("none");

        document.documentElement.classList.remove(
          "show-brand-preloader",
          "show-fade-preloader",
          "preloading"
        );

        document.body.classList.remove("preloading");

        setPreloaderDone(true);
        return;
      }

      // Brand loader — first homepage visit only
      const isSeen =
        sessionStorage.getItem("hasSeenBrandPreloader") === "true";

      if (
        currentPath === "/" &&
        !isSeen &&
        !isPopStateNav.current
      ) {
        setPreloaderDone(false);
        setLoaderType("brand");
        return;
      }

      // Fade loader
      setPreloaderDone(false);

      document.documentElement.classList.add(
        "show-fade-preloader",
        "preloading"
      );

      document.body.classList.add("preloading");

      setLoaderType("fade");
    },
    [setPreloaderDone]
  );

  // Browser Back / Forward
  useEffect(() => {
    const handlePopState = () => {
      isPopStateNav.current = true;

      // Important: browser controls restoration
      window.history.scrollRestoration = "auto";

      handleRouteLoader(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [handleRouteLoader]);

  // Route change
  useEffect(() => {
    setMounted(true);

    handleRouteLoader(pathname);

    // IMPORTANT:
    // Do NOT reset isPopStateNav here.
  }, [pathname, handleRouteLoader]);

  // Brand loader finished
  const handleBrandComplete = useCallback(() => {
    markBrandPreloaderSeen();

    document.documentElement.classList.remove(
      "show-brand-preloader",
      "preloading"
    );

    document.body.classList.remove("preloading");

    window.scrollTo(0, 0);

    setPreloaderDone(true);
    setLoaderType("none");
  }, [markBrandPreloaderSeen, setPreloaderDone]);

  // Fade starts exiting
  const handleFadeExitStart = useCallback(() => {
    document.documentElement.classList.remove("preloading");
    document.body.classList.remove("preloading");

    setPreloaderDone(true);
  }, [setPreloaderDone]);

  // Fade completely finished
  const handleFadeComplete = useCallback(() => {
    document.documentElement.classList.remove(
      "show-fade-preloader"
    );

    // ONLY scroll top for normal navigation
    if (!isPopStateNav.current) {
      window.scrollTo(0, 0);
    }

    setLoaderType("none");

    // Back/forward navigation is finished.
    // Reset flag AFTER scroll restoration has had a chance to happen.
    if (isPopStateNav.current) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isPopStateNav.current = false;
        });
      });
    }
  }, []);

  return (
    <>
      <div id="brand-preloader-root">
        {(!mounted || loaderType === "brand") && (
          <Preloader
            key="brand-preloader"
            onComplete={handleBrandComplete}
          />
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