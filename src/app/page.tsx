"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "./context/SiteContext";

import Hero from "../components/Hero";
import SectionOne from "../components/SectionOne";
import SectionTwo from "../components/SectionTwo";
import SectionThree from "../components/SectionThree";
import SectionFour from "../components/SectionFour";
import SectionFive from "../components/SectionFive";
import PreloaderWrapper from "../components/PreloaderWrapper";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { preloaderDone } = useSite();

  useEffect(() => {
    if (!preloaderDone) return;

    const id = setTimeout(async () => {
      // Wait for fonts so layout is fully stable before ScrollTrigger measures anything
      await document.fonts.ready;

      ScrollTrigger.getAll().forEach((t) => t.kill());

      // ── Initial states ──────────────────────────────────────
      gsap.set(".hero", {
        yPercent: 0,
        zIndex: 20,
      });

      gsap.set(".section-1", {
        yPercent: 0,
        zIndex: 10,
      });

      gsap.set(".section-3", {
        visibility: "hidden",
        clipPath: "inset(100% 0% 0% 0%)",
        zIndex: 40,
      });

      gsap.set(".section-4", {
        yPercent: 100,
        visibility: "visible",
        zIndex: 50,
      });

      gsap.set(".section-5", {
        visibility: "hidden",
        clipPath: "inset(100% 0% 0% 0%)",
        zIndex: 60,
      });

      // ── Timeline 1: Hero → Section 1 (pinned) ──────────────
      const tl1 = gsap.timeline({
        scrollTrigger: {
          trigger: ".pin-hero-s1",
          start: "top top",
          end: "+=1500",
          scrub: true,
          pin: true,
          pinSpacing: true,
        },
      });

      tl1.to(".hero", {
        yPercent: -100,
        duration: 1,
        ease: "none",
      });
      tl1.to(".section-1", {
        filter: "blur(4px)",
        opacity: 0.9,
        duration: 0.5,
        ease: "power2.inOut",
      });

      // ── Timeline 2: S2 bg → S3 → S4 → S5 (pinned) ─────────
      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: ".pin-s3-s5",
          start: "top top",
          end: "+=5000",
          scrub: true,
          pin: true,
          pinSpacing: true,
        },
      });

      // S2 → S3
      tl2.set(".section-3", { visibility: "visible" });

      tl2.to(".section-3", {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.5,
        ease: "power2.inOut",
      });

      tl2.to(
        ".section-2",
        {
          scale: 1.05,
          duration: 1.5,
          ease: "power2.inOut",
        },
        "<"
      );

      // S3 → S4
      tl2.to(".section-4", {
        yPercent: 0,
        duration: 1,
        ease: "none",
      });

      tl2.to(
        ".section-3",
        {
          scale: 1.05,
          duration: 1,
          ease: "power2.inOut",
        },
        "<"
      );

      // S4 → S5
      tl2.to(".section-4", {
        scale: 1.05,
        duration: 1.5,
        ease: "power2.inOut",
      });

      tl2.set(".section-5", { visibility: "visible" });

      tl2.to(
        ".section-5",
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.5,
          ease: "power2.inOut",
        },
        "<"
      );

      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(id);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [preloaderDone]);

  return (
    <main>
      <PreloaderWrapper />



        {/* ── Pin 1: Hero slides up to reveal Section 1 ── */}
        <div
          className="pin-hero-s1"
          style={{ position: "relative", height: "100vh", overflow: "hidden" }}
        >
          <div className="section-1 absolute inset-0" style={{ zIndex: 10 }}>
            <SectionOne />
          </div>
          <div className="hero absolute inset-0" style={{ zIndex: 20 }}>
            <Hero />
          </div>
        </div>

        {/* ── Pin 2: S2 bg → S3 → S4 → S5 ── */}
        <div
          className="pin-s3-s5"
          style={{ position: "relative", height: "100vh", overflow: "hidden" }}
        >
          <div className="section-2 absolute inset-0" style={{ zIndex: 10 }}>
            <SectionTwo />
          </div>
          <SectionThree />
          <SectionFour />
          <SectionFive />
        </div>

      
    </main>
  );
}