"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "./context/SiteContext";

import Hero from "../components/Hero";
import SectionOne from "../components/SectionOne";
import SectionTwo from "../components/SectionTwo";
import SectionThree from "../components/SectionThree";
import PreloaderWrapper from "../components/PreloaderWrapper";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { preloaderDone } = useSite();

  useEffect(() => {
    if (!preloaderDone) return;

    const id = setTimeout(() => {
      ScrollTrigger.getAll().forEach((t) => t.kill());

      // Initial states
      gsap.set(".hero", {
        yPercent: 0,
        visibility: "visible",
        zIndex: 30,
      });

      gsap.set(".section-1", {
        yPercent: 0,
        visibility: "visible",
        zIndex: 20,
      });

      gsap.set(".section-2", {
        yPercent: 100,
        visibility: "visible",
        zIndex: 30,
      });

      gsap.set(".section-3", {
        visibility: "hidden",
        clipPath: "inset(100% 0% 0% 0%)",
        zIndex: 40,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".scroll-container",
          start: "top top",
          end: "+=8000",
          scrub: 1,
          pin: true,
          pinSpacing: true,
        },
      });

      // HERO -> SECTION 1
      // Hero slides away upward, revealing Section 1 underneath
      tl.to(".hero", {
        yPercent: -100,
        duration: 1,
        ease: "none",
      });

      // Small pause
      tl.to({}, { duration: 0.1 });

      // SECTION 1 -> SECTION 2
      // Section 2 slides up from bottom over Section 1
      tl.to(".section-2", {
        yPercent: 0,
        duration: 1,
        ease: "none",
      });

      // SECTION 2 -> SECTION 3 (UNCHANGED)
      tl.set(".section-3", {
        visibility: "visible",
      });

      tl.to(
        ".section-3",
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.5,
          ease: "power2.inOut",
        },
        "<"
      );

      tl.to(
        ".section-2",
        {
          scale: 1.05,
          duration: 1.5,
          ease: "power2.inOut",
        },
        "<"
      );

      ScrollTrigger.refresh();
    }, 50);

    return () => {
      clearTimeout(id);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [preloaderDone]);

  return (
    <main style={{ overflow: "hidden" }}>
      <PreloaderWrapper />

      <div
        className="scroll-container"
        style={{
          height: "100vh",
          position: "relative",
        }}
      >
        <Hero />
        <SectionOne />
        <SectionTwo />
        <SectionThree />
      </div>
    </main>
  );
}