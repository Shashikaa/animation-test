"use client";

import { useState, useEffect } from "react";
import ProjectsDesktop from "./ProjectsDesktop";
import ProjectsMobile from "./ProjectsMobile";
import { useSite } from "@/src/app/context/SiteContext";
export default function ContactPage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const { preloaderDone } = useSite();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1025);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Avoid rendering a blank state while checking window width on the very first frame
  if (isMobile === null) {
    return <div className="h-screen w-full " />;
  }

  return isMobile ? (
    <ProjectsMobile preloaderDone={preloaderDone} />
  ) : (
    <ProjectsDesktop preloaderDone={preloaderDone} />
  );
}