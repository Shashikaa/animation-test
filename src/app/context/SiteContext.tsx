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
  // Default to false so the preloader can render on first paint
  const [preloaderDone, setPreloaderDone] = useState(false);
  const pathname = usePathname();
  const smootherRef = useRef<any>(null);
  
  const isBrowserNavRef = useRef(false);
  const isFirstMountRef = useRef(true); // Track if this is the initial site load

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
    // 1. Handle browser back/forward buttons cleanly
    if (isBrowserNavRef.current) {
      isBrowserNavRef.current = false;
      return;
    }

    // 2. Prevent initial landing page layout from triggering standard router transitions
    if (isFirstMountRef.current && pathname === "/") {
      isFirstMountRef.current = false;
      return; 
    }

    // Standard Navigation configuration (subsequent routes or subpages)
    setPreloaderDone(false);
    document.body.classList.add("preloading");

    // FAIL-SAFE TIMEOUT: For interior subpages transitions
    const failSafe = setTimeout(() => {
      document.body.classList.remove("preloading");
      setPreloaderDone(true);
    }, 2500);

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