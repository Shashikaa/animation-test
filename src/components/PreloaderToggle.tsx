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

  const isPopStateNav = useRef(false);

  const handleRouteLoader = useCallback(
    (currentPath: string) => {
      if (isPopStateNav.current) {
        window.history.scrollRestoration = "auto";
      } else {
        window.history.scrollRestoration = "manual";
        window.scrollTo(0, 0);
      }

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

      const isSeen = sessionStorage.getItem("hasSeenBrandPreloader") === "true";

      if (currentPath === "/" && !isSeen && !isPopStateNav.current) {
        setPreloaderDone(false);
        setLoaderType("brand");

        document.documentElement.classList.add(
          "show-brand-preloader",
          "preloading"
        );

        document.body.classList.add("preloading");
        return;
      }

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

  useEffect(() => {
    const handlePopState = () => {
      isPopStateNav.current = true;
      window.history.scrollRestoration = "auto";
      handleRouteLoader(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [handleRouteLoader]);

  useEffect(() => {
    setMounted(true);
    handleRouteLoader(pathname);
  }, [pathname, handleRouteLoader]);

  const handleBrandComplete = useCallback(() => {
    markBrandPreloaderSeen();
    sessionStorage.setItem("hasSeenBrandPreloader", "true");

    window.scrollTo(0, 0);

    setPreloaderDone(true);
    setLoaderType("none");

    document.documentElement.classList.remove(
      "show-brand-preloader",
      "show-fade-preloader",
      "preloading"
    );

    document.body.classList.remove("preloading");
  }, [markBrandPreloaderSeen, setPreloaderDone]);

  const handleFadeExitStart = useCallback(() => {
    setPreloaderDone(true);

    document.documentElement.classList.remove("preloading");
    document.body.classList.remove("preloading");
  }, [setPreloaderDone]);

  const handleFadeComplete = useCallback(() => {
    document.documentElement.classList.remove("show-fade-preloader");

    if (!isPopStateNav.current) {
      window.scrollTo(0, 0);
    }

    setLoaderType("none");

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