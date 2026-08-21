"use client";

import { useEffect, useState } from "react";
import HomeDesktop from "./HomeDesktop";
import HomeMobile from "./HomeMobile";

export default function HomeClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1025);
    };

    checkScreenSize();
    setMounted(true);

    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return isMobile ? <HomeMobile /> : <HomeDesktop />;
}