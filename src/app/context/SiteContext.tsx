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

// Routes that mount their own local Preloader and must signal completion
// back to this context themselves (via setPreloaderDone from useSite()).
const PAGES_WITH_OWN_PRELOADER = ["/about"];

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [preloaderDone, setPreloaderDone] = useState<boolean>(false);

  useEffect(() => {
    const isHome = pathname === "/";
    const hasOwnPreloader = PAGES_WITH_OWN_PRELOADER.includes(pathname ?? "");

    if (hasOwnPreloader) {
      setPreloaderDone(false);
      return;
    }

    if (!isHome) {
      setPreloaderDone(true);
      return;
    }

    try {
      setPreloaderDone(sessionStorage.getItem(PRELOADER_KEY) === "1");
    } catch {
      setPreloaderDone(false);
    }
  }, [pathname]);

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