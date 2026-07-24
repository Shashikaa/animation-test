"use client";

import { useState, useEffect } from "react";
import ProjectsDesktop from "./ProjectsDesktop";
import ProjectsMobile from "./ProjectsMobile";

export default function ProjectPage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1025);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile === null) {
    return null;
  }

  return isMobile ? <ProjectsMobile /> : <ProjectsDesktop />;
}