"use client";

import { useEffect, useState } from "react";
import AboutDesktop from "./AboutDesktop";
import AboutMobile from "./AboutMobile";

export default function AboutPage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    // 1024px and above uses Desktop layout (including iPad Pro in portrait at 1024px)
    const check = () => setIsMobile(window.innerWidth < 1025);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile === null) {
    return null; // Avoid rendering flash during initial context mount
  }

  return (
    <>
      {isMobile 
        ? <AboutMobile />
        : <AboutDesktop />
      }
    </>
  );
}