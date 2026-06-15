"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const HomeDesktop      = dynamic(() => import("./HomeDesktop"), { ssr: false });
const HomeMobile       = dynamic(() => import("./HomeMobile"),  { ssr: false });

// Its own tiny chunk — loads fast, independent of HomeDesktop's big bundle
const PreloaderWrapper = dynamic(() => import("../components/PreloaderWrapper"), { ssr: false });

export default function Home() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1025);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      {/* mounts immediately on first render, doesn't wait for isMobile or HomeDesktop */}
      <PreloaderWrapper />

      {isMobile !== null && (isMobile ? <HomeMobile /> : <HomeDesktop />)}
    </>
  );
}