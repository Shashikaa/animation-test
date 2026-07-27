"use client";

import { usePathname } from "next/navigation";
import FadePreloader from "./FadePreloader";
import { useSite } from "../app/context/SiteContext";

export default function FadePreloaderWrapper() {
  const { setPreloaderDone } = useSite();
  const pathname = usePathname();

  const handleExitStart = () => {
    document.body.classList.remove("preloading");
    setPreloaderDone(true);
  };

  const handleComplete = () => {
    document.body.classList.remove("preloading");
    setPreloaderDone(true);
  };

  return (
    <FadePreloader 
      key={pathname}
      onExitStart={handleExitStart} 
      onComplete={handleComplete} 
    />
  );
}