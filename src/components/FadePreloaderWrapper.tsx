"use client";

import { usePathname } from "next/navigation";
import FadePreloader from "./FadePreloader";
import { useSite } from "../app/context/SiteContext";

export default function FadePreloaderWrapper() {
  const { setPreloaderDone } = useSite();

  const handleComplete = () => {
    document.body.classList.remove("preloading");
    setPreloaderDone(true);
  };

  return <FadePreloader onComplete={handleComplete} />;
}