"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export const PAGES_WITH_OWN_PRELOADER = ["/about"];

interface SiteContextProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  preloaderDone: boolean;
  setPreloaderDone: (done: boolean) => void;
}

const SiteContext = createContext<SiteContextProps | undefined>(undefined);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const isMainHomeRoute = pathname === "/";
    const hasCustomLoader = PAGES_WITH_OWN_PRELOADER.includes(pathname ?? "");

    if (hasCustomLoader) {
      // Force reset everything so About Page handles its own lifecycle entry
      setPreloaderDone(false);
      document.body.classList.add("preloading");
    } else if (!isMainHomeRoute) {
      // Standard interior subpages bypass loading entirely
      setPreloaderDone(true);
      document.body.classList.remove("preloading");
    }
  }, [pathname]);

  return (
    <SiteContext.Provider value={{ menuOpen, setMenuOpen, preloaderDone, setPreloaderDone }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) throw new Error("useSite must be used within a SiteProvider");
  return context;
}