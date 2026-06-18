"use client";

import { useEffect, useState } from "react";
import { useSite } from "@/src/app/context/SiteContext";
import ServiceMobile from "./ServiceMobile";
import ServiceDesktop from "./ServiceDesktop";

export default function ServicePage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const { preloaderDone } = useSite();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1025);
    check();
    
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Prevent flash or hydration mismatch while window width resolves
  if (isMobile === null) {
    return <div className="h-screen w-full" />;
  }

  return (
    <>
      {isMobile ? (
        <ServiceMobile preloaderDone={preloaderDone} />
      ) : (
        <ServiceDesktop preloaderDone={preloaderDone} />
      )}
    </>
  );
}