"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const HomeDesktop = dynamic(() => import("./HomeDesktop"), { ssr: false });
const HomeMobile  = dynamic(() => import("./HomeMobile"),  { ssr: false });

export default function Home() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      setIsMobile(ScrollTrigger.isTouch === 1);
    });
  }, []);

  if (isMobile === null) return null;

  return isMobile ? <HomeMobile /> : <HomeDesktop />;
}