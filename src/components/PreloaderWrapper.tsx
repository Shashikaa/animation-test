"use client";

import { useEffect } from "react";
import Preloader from "./Preloader";
import { useSite } from "../app/context/SiteContext";

export default function PreloaderWrapper() {
  const { setPreloaderDone, lenisRef } = useSite();

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.remove("preloading");
      });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleComplete = () => {
    lenisRef.current?.start();
    setPreloaderDone(true);
  };

  return <Preloader onComplete={handleComplete} />;
}