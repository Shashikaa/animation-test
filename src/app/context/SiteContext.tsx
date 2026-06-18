"use client";

import React, { createContext, useContext, useState, useEffect, useRef, MutableRefObject } from "react";
import { usePathname } from "next/navigation";

export const PAGES_WITH_OWN_PRELOADER = ["/about"];

interface SiteContextProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  preloaderDone: boolean;
  setPreloaderDone: (done: boolean) => void;
  // Added smootherRef to context types (supports Lenis instance or any smooth scroll reference)
  smootherRef: MutableRefObject<any> | null;
}

const SiteContext = createContext<SiteContextProps | undefined>(undefined);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const pathname = usePathname();
  
  // Initialize the ref container here
  const smootherRef = useRef<any>(null);

  useEffect(() => {
    const isMainHomeRoute = pathname === "/";
    const hasCustomLoader = PAGES_WITH_OWN_PRELOADER.includes(pathname ?? "");

    if (hasCustomLoader) {
      setPreloaderDone(false);
      document.body.classList.add("preloading");
    } else if (!isMainHomeRoute) {
      setPreloaderDone(true);
      document.body.classList.remove("preloading");
    }
  }, [pathname]);

  return (
    <SiteContext.Provider 
      value={{ 
        menuOpen, 
        setMenuOpen, 
        preloaderDone, 
        setPreloaderDone, 
        smootherRef // Passed into the provider value
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