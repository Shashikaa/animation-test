"use client";
import { useEffect } from "react";
import Preloader from "./Preloader";
import { useSite } from "../app/context/SiteContext";

export default function PreloaderWrapper() {
  const { setPreloaderDone } = useSite();

  useEffect(() => {
    // Wait for preloader to actually paint before revealing content beneath
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.remove("preloading");
      });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Preloader onComplete={() => setPreloaderDone(true)} />
  );
}