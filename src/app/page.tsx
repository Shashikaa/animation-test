"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "./context/SiteContext";

import Hero from "../components/Hero";
import SectionOne from "../components/SectionOne";
import SectionTwo from "../components/SectionTwo";
import SectionThree from "../components/SectionThree";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { preloaderDone } = useSite();

  useEffect(() => {
    if (!preloaderDone) return;

    const id = setTimeout(() => {
      gsap.set(".hero", { yPercent: 0, visibility: "visible" });
      gsap.set(".section-1", { yPercent: 100, visibility: "visible" });
      gsap.set(".section-2", { yPercent: 100, visibility: "visible" });
      gsap.set(".section-3", { visibility: "hidden", clipPath: "inset(100% 0% 0% 0%)" });

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

      tl.to(".section-1", { yPercent: 0, duration: 1, ease: "none" });
      tl.set(".section-2", { yPercent: 0 });
      tl.to({}, { duration: 0.1 });
      tl.to(".section-1", { yPercent: -100, duration: 1, ease: "none" });
      tl.set(".section-3", { visibility: "visible" });
      tl.to(".section-3", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "power2.inOut" }, "<");
      tl.to(".section-2", { scale: 1.05, duration: 1.5, ease: "power2.inOut" }, "<");
    }, 50);

    return () => {
      clearTimeout(id);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [preloaderDone]);

  return (
    <main style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <div className="scroll-container" style={{ height: "100vh" }}>
        <Hero />
        <SectionOne />
        <SectionTwo />
        <SectionThree />
      </div>
    </main>
  );
}