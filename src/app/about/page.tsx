"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Preloader from "@/src/components/About/Preloader";
import { useSite } from "@/src/app/context/SiteContext";
import HeaderWrapper from "../../components/HeaderWrapper";
import NavMenuWrapper from "../../components/NavMenuWrapper";

const AboutDesktop = dynamic(() => import("./AboutDesktop"), { ssr: false });
const AboutMobile  = dynamic(() => import("./AboutMobile"),  { ssr: false });

export default function AboutPage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [localPreloaderDone, setLocalPreloaderDone] = useState(false);
  const { setPreloaderDone: setGlobalPreloaderDone } = useSite();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1025);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleComplete = () => {
    setLocalPreloaderDone(true);
    setGlobalPreloaderDone(true);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#111]">
      {/* ── 1. NATIVE PRELOADER: Mounts instantly on frame 1 without waiting for chunks ── */}
      {!localPreloaderDone && (
        <Preloader onComplete={handleComplete} />
      )}

      {/* ── 2. CONDITIONAL HEADER & NAV: Revealed frame-perfect alongside page elements ── */}
      {localPreloaderDone && (
        <>
          <HeaderWrapper />
          <NavMenuWrapper />
        </>
      )}

      {/* ── 3. SEAMLESS REVEAL LAYOUT: Renders safely hidden behind the preloader ── */}
      {isMobile !== null && (
        <div style={{ opacity: localPreloaderDone ? 1 : 0, visibility: localPreloaderDone ? "visible" : "hidden" }}>
          {isMobile ? <AboutMobile /> : <AboutDesktop />}
        </div>
      )}
    </div>
  );
}