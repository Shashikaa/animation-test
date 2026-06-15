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

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ── Preloader state ────────────────────────────────────────────────────────
  // Always start false on the server — SSR/static prerender must never touch
  // sessionStorage or window. The correct value is set in the useEffect below
  // before the first paint, so there is no visible flash.
  const [preloaderDone, setPreloaderDone] = useState<boolean>(false);

  // ── Hydrate from sessionStorage on the client only ────────────────────────
  useEffect(() => {
    const isHome = pathname === "/";

    if (!isHome) {
      // Non-home pages never show the preloader — mark done immediately
      setPreloaderDone(true);
      return;
    }

    try {
      if (sessionStorage.getItem(PRELOADER_KEY) === "1") {
        setPreloaderDone(true);
      }
      // else stays false: preloader runs, calls setPreloaderDone(true) when done
    } catch {
      // sessionStorage blocked (private browsing etc.) — treat as first visit
      setPreloaderDone(false);
    }
  // Run once on mount; pathname is stable at this point
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

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
        lenisRef,
        onScrollReady,
        setOnScrollReady,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export const useSite = () => useContext(SiteContext);