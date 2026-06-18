"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSite } from "./context/SiteContext";

// Define the common prop type required by both layout types
interface HomeLayoutProps {
  preloaderDone: boolean;
}

// Pass the interface types inside the dynamic generic angle brackets <...>
const HomeDesktop = dynamic<HomeLayoutProps>(() => import("./HomeDesktop"), { ssr: false });
const HomeMobile  = dynamic<HomeLayoutProps>(() => import("./HomeMobile"),  { ssr: false });

export default function Home() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const { preloaderDone } = useSite();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1025);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <>
      {isMobile !== null && (
        isMobile ? (
          <HomeMobile preloaderDone={preloaderDone} />
        ) : (
          <HomeDesktop preloaderDone={preloaderDone} />
        )
      )}
    </>
  );
}