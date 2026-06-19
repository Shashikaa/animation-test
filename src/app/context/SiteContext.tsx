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

  useEffect(() => {
    const isMainHomeRoute = pathname === "/";
    const hasCustomLoader = PAGES_WITH_OWN_PRELOADER.includes(pathname ?? "");

    // 1. If it's a completely custom heavy loader page
    if (hasCustomLoader) {
      setPreloaderDone(false);
      document.body.classList.add("preloading");
    } 
    // 2. If it's your regular inner pages (e.g. /about, /contact)
    else if (!isMainHomeRoute) {
      // Keep it false! Let the FadePreloaderWrapper tell us when it is finished.
      setPreloaderDone(false); 
      document.body.classList.add("preloading");
    }
    // 3. For the main homepage route
    else {
      // Your separate home preloader setup manages state for the "/" path
      setPreloaderDone(false);
      document.body.classList.add("preloading");
    }
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