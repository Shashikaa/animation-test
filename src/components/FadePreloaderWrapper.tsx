"use client";

import { usePathname } from "next/navigation";
import FadePreloader from "./FadePreloader";
import { useSite } from "../app/context/SiteContext";

export default function FadePreloaderWrapper() {
  const { setPreloaderDone } = useSite();
  const pathname = usePathname();

  // Reset/Trigger updates when opacity animation starts dropping
  const handleExitStart = () => {
    // Optional: add a hook here if your header needs a class when fade begins
  };

  const handleComplete = () => {
    document.body.classList.remove("preloading");
    setPreloaderDone(true);
  };

  // We add a key tied to pathname to force a fresh mount on every page transition
  return (
    <FadePreloader 
      key={pathname}
      onExitStart={handleExitStart} 
      onComplete={handleComplete} 
    />
  );
}