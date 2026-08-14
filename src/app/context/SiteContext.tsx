"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  MutableRefObject,
} from "react";
import { usePathname } from "next/navigation";

export const PAGES_WITH_OWN_PRELOADER: string[] = [];

interface SiteContextProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  preloaderDone: boolean;
  setPreloaderDone: (done: boolean) => void;
  hasSeenBrandPreloader: boolean;
  markBrandPreloaderSeen: () => void;
  smootherRef: MutableRefObject<any>;
}

const SiteContext = createContext<SiteContextProps | undefined>(undefined);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [hasSeenBrandPreloader, setHasSeenBrandPreloader] = useState<boolean>(false);

  // Reference pointer to Lenis instance created in SmoothScroll.tsx
  const smootherRef = useRef<any>(null);
  const pathname = usePathname();

  // Reset Lock States & Trigger Lenis Start on Navigation
  useEffect(() => {
    document.body.classList.remove("preloading");
    document.documentElement.classList.remove("preloading");

    const lenis = smootherRef.current;
    if (lenis && typeof lenis.start === "function") {
      lenis.start();
      requestAnimationFrame(() => {
        if (typeof lenis.resize === "function") lenis.resize();
        window.scrollTo(0, 0);
      });
    }

    setMenuOpen(false);
  }, [pathname]);

  // Handle Browser History & Popstate Actions
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasSeenBrandPreloader(
        sessionStorage.getItem("hasSeenBrandPreloader") === "true"
      );
    }

    const handlePopState = () => {
      setPreloaderDone(true);
      document.body.classList.remove("preloading");
      document.documentElement.classList.remove("preloading");

      const lenis = smootherRef.current;
      if (lenis) {
        if (typeof lenis.start === "function") lenis.start();
        if (typeof lenis.resize === "function") lenis.resize();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const markBrandPreloaderSeen = () => {
    try {
      sessionStorage.setItem("hasSeenBrandPreloader", "true");
    } catch (e) {}
    setHasSeenBrandPreloader(true);
  };

  return (
    <SiteContext.Provider
      value={{
        menuOpen,
        setMenuOpen,
        preloaderDone,
        setPreloaderDone,
        hasSeenBrandPreloader,
        markBrandPreloaderSeen,
        smootherRef,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) throw new Error("useSite must be used within a SiteProvider");
  return context;
}