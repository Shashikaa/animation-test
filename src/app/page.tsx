"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import PreloaderWrapper from "../components/PreloaderWrapper"; // ← normal static import

const HomeDesktop = dynamic(() => import("./HomeDesktop"), { ssr: false });
const HomeMobile  = dynamic(() => import("./HomeMobile"),  { ssr: false });

export default function Home() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

useEffect(() => {
  const vv = typeof visualViewport !== "undefined" ? visualViewport : null;
  const h = vv ? vv.height : window.innerHeight;
  document.documentElement.style.setProperty("--vh", `${h}px`);

  setIsMobile(window.innerWidth < 1025);
}, []);

  return (
    <>
      <PreloaderWrapper />
      {isMobile !== null && (isMobile ? <HomeMobile /> : <HomeDesktop />)}
    </>
  );
}