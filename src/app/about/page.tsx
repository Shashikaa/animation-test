"use client";

import { useEffect, useState } from "react";
import AboutDesktop from "./AboutDesktop";
import AboutMobile from "./AboutMobile";

export default function AboutPage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    let lastWidth = window.innerWidth;

    const check = () => {
      // Only trigger re-render if horizontal width changes across the breakpoint.
      // Ignores height-only resize events triggered by iOS virtual keyboard open/close.
      const currentWidth = window.innerWidth;
      const mobileState = currentWidth < 1025;

      if (isMobile === null || (currentWidth !== lastWidth && (currentWidth >= 1025) !== (lastWidth >= 1025))) {
        lastWidth = currentWidth;
        setIsMobile(mobileState);
      }
    };

    check();

    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);

    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, [isMobile]);

  if (isMobile === null) {
    return null; // Avoid rendering flash during initial context mount
  }

  return <>{isMobile ? <AboutMobile /> : <AboutDesktop />}</>;
}