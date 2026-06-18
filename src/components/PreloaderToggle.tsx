"use client";

import { usePathname } from "next/navigation";
import PreloaderWrapper from "./PreloaderWrapper";
import FadePreloaderWrapper from "./FadePreloaderWrapper";

export default function PreloaderToggle() {
  const pathname = usePathname();
  
  return pathname === "/" ? <PreloaderWrapper /> : <FadePreloaderWrapper />;
}