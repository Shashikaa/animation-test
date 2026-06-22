"use client";

import { usePathname } from "next/navigation";
import { useSite } from "../app/context/SiteContext";
import PreloaderWrapper from "./PreloaderWrapper";
import FadePreloaderWrapper from "./FadePreloaderWrapper";

export default function PreloaderToggle() {
  const pathname = usePathname();
  const { preloaderDone } = useSite();

  // 🌟 CRITICAL FIX: If the preloader is marked done, completely remove it from the DOM.
  // This prevents it from overlaying and freezing on back/forward actions.
  if (preloaderDone) return null;
  
  return pathname === "/" ? (
    <PreloaderWrapper key={pathname} />
  ) : (
    <FadePreloaderWrapper key={pathname} />
  );
}