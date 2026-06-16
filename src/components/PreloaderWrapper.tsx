"use client";

import { useEffect } from "react";
import Preloader from "./Preloader";
import { useSite } from "../app/context/SiteContext";

export default function PreloaderWrapper() {
  const { setPreloaderDone } = useSite();

  useEffect(() => {
    document.documentElement.removeAttribute("data-preloading");
    document.body.classList.remove("preloading");
  }, []);

  const handleComplete = () => {
    setPreloaderDone(true);
  };

  return <Preloader onComplete={handleComplete} />;
}