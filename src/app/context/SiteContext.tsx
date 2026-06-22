"use client";

import React, { createContext, useContext, useState, useEffect, useRef, MutableRefObject } from "react";
import { usePathname } from "next/navigation";

export const PAGES_WITH_OWN_PRELOADER: string[] = [];

interface SiteContextProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  preloaderDone: boolean;
  setPreloaderDone: (done: boolean) => void;
  smootherRef: MutableRefObject<any> | null;
}

const SiteContext = createContext<SiteContextProps | undefined>(undefined);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const pathname = usePathname();
  const smootherRef = useRef<any>(null);
  
  const isBrowserNavRef = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      isBrowserNavRef.current = true;
      setPreloaderDone(true);
      document.body.classList.remove("preloading");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (isBrowserNavRef.current) {
      isBrowserNavRef.current = false;
      return;
    }

    // Standard Navigation
    setPreloaderDone(false);
    document.body.classList.add("preloading");

    // 🌟 FAIL-SAFE TIMEOUT: If your FadePreloader animation fails to finish 
    // or gets hung up during routing transitions, this forces the page open.
    const failSafe = setTimeout(() => {
      document.body.classList.remove("preloading");
      setPreloaderDone(true);
    }, 2500); // 2.5 second max limit layout fallback

    return () => clearTimeout(failSafe);
  }, [pathname]);

  return (
    <SiteContext.Provider 
      value={{ 
        menuOpen, 
        setMenuOpen, 
        preloaderDone, 
        setPreloaderDone, 
        smootherRef 
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