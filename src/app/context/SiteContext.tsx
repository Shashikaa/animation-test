// app/context/SiteContext.tsx
"use client";

import { createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";

type SiteContextType = {
  preloaderDone:    boolean;
  setPreloaderDone: (v: boolean) => void;
  menuOpen:         boolean;
  setMenuOpen:      (v: boolean) => void;
};

const SiteContext = createContext<SiteContextType>({} as SiteContextType);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const pathname   = usePathname();
  const isHome     = pathname === "/";

  // Non-home pages skip the preloader entirely — logo is immediately visible
  const [preloaderDone, setPreloaderDone] = useState(!isHome);
  const [menuOpen,      setMenuOpen]      = useState(false);

  return (
    <SiteContext.Provider value={{ preloaderDone, setPreloaderDone, menuOpen, setMenuOpen }}>
      {children}
    </SiteContext.Provider>
  );
}

export const useSite = () => useContext(SiteContext);