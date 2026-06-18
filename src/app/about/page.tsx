"use client";

import { useEffect, useState } from "react";
import { useSite } from "@/src/app/context/SiteContext";
// Import normally so the code is already bundled and ready to execute instantly
import AboutDesktop from "./AboutDesktop";
import AboutMobile from "./AboutMobile";

export default function AboutPage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const { preloaderDone } = useSite();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1025);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Avoid rendering a blank state while checking window width on the very first frame
  if (isMobile === null) {
    return <div className="h-screen w-full bg-[#111]" />;
  }

  return (
    <>
      {isMobile 
        ? <AboutMobile preloaderDone={preloaderDone} />
        : <AboutDesktop preloaderDone={preloaderDone} />
      }
    </>
  );
}