"use client";

import { useState, useEffect } from "react";
import ContactDesktop from "./ContactDesktop";
import ContactMobile from "./ContactMobile";

export default function ContactPage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1025);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Avoid rendering a blank state while checking window width on the very first frame
  if (isMobile === null) {
    return null; // Avoid rendering an artificial 100vh spacer div
  }

  return isMobile ? <ContactMobile /> : <ContactDesktop />;
}