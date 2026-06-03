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
      await document.fonts.ready;

      ScrollTrigger.getAll().forEach((t) => t.kill());

      // ── Initial states ──────────────────────────────────────
      gsap.set(".hero",      { yPercent: 0, zIndex: 20 });
      gsap.set(".section-1", { yPercent: 0, zIndex: 10 });

      gsap.set(".section-3", {
        visibility: "hidden",
        clipPath: "inset(100% 0% 0% 0%)",
        zIndex: 40,
      });

      gsap.set(".s3-bg-1",   { opacity: 1 });
      gsap.set(".s3-bg-2",   { opacity: 0 });
      gsap.set(".s3-bg-3",   { opacity: 0 });

      gsap.set(".s3-text-1", { opacity: 1 });
      gsap.set(".s3-text-2", { opacity: 0 });
      gsap.set(".s3-text-3", { opacity: 0 });

      gsap.set(".s3-bar-1",  { background: "#F4EEDF" });
      gsap.set(".s3-bar-2",  { background: "rgba(244,238,223,0.3)" });
      gsap.set(".s3-bar-3",  { background: "rgba(244,238,223,0.3)" });

      gsap.set(".section-4", { yPercent: 100, visibility: "visible", zIndex: 50 });
      gsap.set(".section-5", { yPercent: 100, visibility: "visible", zIndex: 60 });

      gsap.set(".s5-card", {
        scaleX: 1,
        scaleY: 1,
        transformOrigin: "center center",
      });

      // ── Timeline 1: Hero → Section 1 ───────────────────────
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

      tl1.to(".hero", { yPercent: -100, duration: 1, ease: "none" });
      tl1.to(".section-1", {
        filter: "blur(4px)",
        opacity: 0.9,
        duration: 0.5,
        ease: "power2.inOut",
      });

      // ── Shared card scale values ───────────────────────────
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cardW = 577;
      const cardH = 623;
      const scaleX = vw / cardW;
      const scaleY = vh / cardH;

      const FADE = 0.4;

      // ── Timeline 2: S2 → S3(×3) → S4 → S5 (scrubbed) ─────
      // Ends exactly when S5 has fully entered. Card expand is NOT here.
      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: ".pin-s2-s5",
          start: "top top",
          end: "+=5000",
          scrub: true,
          pin: true,
          pinSpacing: true,
        },
      });

      // S3 clips in over S2
      tl2.set(".section-3", { visibility: "visible" });
      tl2.to(".section-3", {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.5,
        ease: "power2.inOut",
      });
      tl2.to(
        ".section-2",
        { scale: 1.05, duration: 1.5, ease: "power2.inOut" },
        "<"
      );

      // Dwell on slide 1
      tl2.to({}, { duration: 0.8 });

      // Slide 1 → 2
      tl2.to(".s3-bg-1",   { opacity: 0, duration: FADE, ease: "power1.inOut" });
      tl2.to(".s3-bg-2",   { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<");
      tl2.to(".s3-text-1", { opacity: 0, duration: FADE, ease: "power1.inOut" }, "<");
      tl2.to(".s3-text-2", { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<");
      tl2.to(".s3-bar-1",  { background: "rgba(244,238,223,0.3)", duration: FADE }, "<");
      tl2.to(".s3-bar-2",  { background: "#F4EEDF", duration: FADE }, "<");

      // Dwell on slide 2
      tl2.to({}, { duration: 0.8 });

      // Slide 2 → 3
      tl2.to(".s3-bg-2",   { opacity: 0, duration: FADE, ease: "power1.inOut" });
      tl2.to(".s3-bg-3",   { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<");
      tl2.to(".s3-text-2", { opacity: 0, duration: FADE, ease: "power1.inOut" }, "<");
      tl2.to(".s3-text-3", { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<");
      tl2.to(".s3-bar-2",  { background: "rgba(244,238,223,0.3)", duration: FADE }, "<");
      tl2.to(".s3-bar-3",  { background: "#F4EEDF", duration: FADE }, "<");

      // Dwell on slide 3
      tl2.to({}, { duration: 0.8 });

      // S4 slides up
      tl2.to(".section-4", { yPercent: 0, duration: 1, ease: "power2.inOut" });
      tl2.to(".section-4", { scale: 1, duration: 0.5, ease: "power2.inOut" });

      // S3 + S4 exit up; S5 enters — tl2 ends here
      tl2.to(".section-3", { yPercent: -100, duration: 1.5, ease: "power2.inOut" });
      tl2.to(".section-4", { yPercent: -100, duration: 1.5, ease: "power2.inOut" }, "<");
      tl2.to(".section-5", { yPercent: 0,    duration: 1.5, ease: "power2.inOut" }, "<");

      // ── Card expand: auto-plays on enter, reverses on leave back ──
      // Fires as a real tween (not scrubbed) so it always completes
      // fully regardless of scroll speed. onEnterBack reverses it.
      let cardTween: gsap.core.Tween | null = null;

      ScrollTrigger.create({
        trigger: ".pin-s2-s5",
        // Fires right at the end of tl2's pinned scroll distance
        start: "top top",
        end: "+=5000",
        onLeave: () => {
          // Kill any in-progress reverse, play forward to fullscreen
          if (cardTween) cardTween.kill();
          cardTween = gsap.to(".s5-card", {
            scaleX,
            scaleY,
            duration: 1.2,
            ease: "power2.inOut",
          });
        },
        onEnterBack: () => {
          // User scrolled back into the section — collapse the card
          if (cardTween) cardTween.kill();
          cardTween = gsap.to(".s5-card", {
            scaleX: 1,
            scaleY: 1,
            duration: 1.2,
            ease: "power2.inOut",
          });
        },
      });

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

      {/* ── Pin 2: S2 → S3(×3) → S4 → S5 → card expand ── */}
      <div
        className="pin-s2-s5"
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