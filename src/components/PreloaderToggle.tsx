"use client";

import { usePathname } from "next/navigation";
import { useSite } from "../app/context/SiteContext";
import PreloaderWrapper from "./PreloaderWrapper";
import FadePreloaderWrapper from "./FadePreloaderWrapper";

export default function PreloaderToggle() {
  const pathname = usePathname();
  const { preloaderDone } = useSite();

  // 🌟 Bypass preloader on terms/policy pages
  if (pathname === "/terms" || pathname === "/privacy-policy") return null;

  // If the preloader is marked done, completely remove it from the DOM.
  if (preloaderDone) return null;

  return pathname === "/" ? (
    <PreloaderWrapper key={pathname} />
  ) : (
    <FadePreloaderWrapper key={pathname} />
  );
}