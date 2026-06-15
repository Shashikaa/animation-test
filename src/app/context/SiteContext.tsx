"use client";

import { createContext, useContext, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";

type SiteContextType = {
  preloaderDone:    boolean;
  setPreloaderDone: (v: boolean) => void;
  menuOpen:         boolean;
  setMenuOpen:      (v: boolean) => void;
  lenisRef:         React.RefObject<Lenis | null>;
  onScrollReady:    () => void;
  setOnScrollReady: (fn: () => void) => void;
};

const SiteContext = createContext<SiteContextType>({} as SiteContextType);

export const PRELOADER_KEY = "gp_preloader_done";

function getInitialPreloaderDone(isHome: boolean): boolean {
  if (!isHome) return true;
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(PRELOADER_KEY) === "1";
  } catch {
    return false;
  }
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome   = pathname === "/";

  const [preloaderDone, setPreloaderDone] = useState<boolean>(
    () => getInitialPreloaderDone(isHome)
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  const scrollReadyCallbackRef = useRef<(() => void) | null>(null);

  // Accepts any fn, including a no-op () => {} for cleanup
  const setOnScrollReady = useCallback((fn: () => void) => {
    scrollReadyCallbackRef.current = fn;
  }, []);

  const onScrollReady = useCallback(() => {
    scrollReadyCallbackRef.current?.();
  }, []);

  return (
    <SiteContext.Provider value={{
      preloaderDone,
      setPreloaderDone,
      menuOpen,
      setMenuOpen,
      lenisRef,
      onScrollReady,
      setOnScrollReady,
    }}>
      {children}
    </SiteContext.Provider>
  );
}

export const useSite = () => useContext(SiteContext);