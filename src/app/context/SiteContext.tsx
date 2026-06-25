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
  const isFirstMountRef = useRef(true);

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

    if (isFirstMountRef.current && pathname === "/") {
      isFirstMountRef.current = false;
      return; 
    }

    // Standard Navigation Configuration resets safely
    setPreloaderDone(false);
    document.body.classList.add("preloading");

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