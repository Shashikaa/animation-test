"use client";

import { createContext, useContext, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";

type SiteContextType = {
  preloaderDone:    boolean;
  setPreloaderDone: (v: boolean) => void;
  menuOpen:         boolean;
  setMenuOpen:      (v: boolean) => void;
  lenisRef:         React.RefObject<Lenis | null>;
};

const SiteContext = createContext<SiteContextType>({} as SiteContextType);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome   = pathname === "/";

  const [preloaderDone, setPreloaderDone] = useState(!isHome);
  const [menuOpen,      setMenuOpen]      = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  return (
    <SiteContext.Provider value={{ preloaderDone, setPreloaderDone, menuOpen, setMenuOpen, lenisRef }}>
      {children}
    </SiteContext.Provider>
  );
}

export const useSite = () => useContext(SiteContext);