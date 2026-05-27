"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const ref = useRef(null);

  useEffect(() => {
    gsap.from(ref.current, {
      opacity: 0,
      y: 50,
      scrollTrigger: {
        trigger: ref.current,
        start: "top 90%",
      },
    });
  }, []);

  return (
    <footer
      ref={ref}
      className="h-screen flex items-center justify-center bg-black text-white"
    >
      <p>© 2026 Your Brand</p>
    </footer>
  );
}