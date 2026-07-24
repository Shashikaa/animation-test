"use client";

import { useEffect, useState } from "react";
import ServiceMobile from "./ServiceMobile";
import ServiceDesktop from "./ServiceDesktop";

export default function ServicePage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1025);
    check();
    
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile === null) {
    return null; // Avoid rendering an artificial 100vh spacer div
  }

  return (
    <>
      {isMobile ? (
        <ServiceMobile />
      ) : (
        <ServiceDesktop />
      )}
    </>
  );
}