"use client";

import { createContext, useContext, useState } from "react";

type SiteContextType = {
  preloaderDone:    boolean;
  setPreloaderDone: (v: boolean) => void;
  menuOpen:         boolean;
  setMenuOpen:      (v: boolean) => void;
};

const SiteContext = createContext<SiteContextType>({} as SiteContextType);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [menuOpen,      setMenuOpen]      = useState(false);

  return (
    <SiteContext.Provider value={{ preloaderDone, setPreloaderDone, menuOpen, setMenuOpen }}>
      {children}
    </SiteContext.Provider>
  );
}

export const useSite = () => useContext(SiteContext);