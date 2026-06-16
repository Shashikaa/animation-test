"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { usePathname } from "next/navigation";
import type { ScrollSmoother } from "gsap/ScrollSmoother";

type SiteContextType = {
  preloaderDone:    boolean;
  setPreloaderDone: (v: boolean) => void;
  menuOpen:         boolean;
  setMenuOpen:      (v: boolean) => void;
  smootherRef:      React.RefObject<ScrollSmoother | null>;
  onScrollReady:    () => void;
  setOnScrollReady: (fn: () => void) => void;
};

const SiteContext = createContext<SiteContextType>({} as SiteContextType);

export const PRELOADER_KEY = "gp_preloader_done";

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [preloaderDone, setPreloaderDone] = useState<boolean>(false);

  useEffect(() => {
    const isHome = pathname === "/";
    if (!isHome) {
      setPreloaderDone(true);
      return;
    }
    try {
      if (sessionStorage.getItem(PRELOADER_KEY) === "1") {
        setPreloaderDone(true);
      }
    } catch {
      setPreloaderDone(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const smootherRef = useRef<ScrollSmoother | null>(null);

  const scrollReadyCallbackRef = useRef<(() => void) | null>(null);

  const setOnScrollReady = useCallback((fn: () => void) => {
    scrollReadyCallbackRef.current = fn;
  }, []);

  const onScrollReady = useCallback(() => {
    scrollReadyCallbackRef.current?.();
  }, []);

  return (
    <SiteContext.Provider
      value={{
        preloaderDone,
        setPreloaderDone,
        menuOpen,
        setMenuOpen,
        smootherRef,
        onScrollReady,
        setOnScrollReady,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export const useSite = () => useContext(SiteContext);