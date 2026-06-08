"use client";

/**
 * PIN 1 — Hero → Section 1
 * Replaces GSAP Timeline 1 entirely.
 *
 * What it does (identical to GSAP version):
 *  - Container is sticky-pinned for 1500px of scroll
 *  - Hero slides up (yPercent 0 → -100) as scroll progresses
 *  - Section 1 blurs + fades slightly (filter blur 0→4px, opacity 1→0.9)
 *
 * Dependencies: framer-motion (already in most Next.js stacks)
 *   npm i framer-motion
 */

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Hero from "../components/Hero";
import SectionOne from "../components/SectionOne";

export default function Pin1() {
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * useScroll with a local container ref.
   * offset: ["start start", "end start"] means:
   *   progress=0 when container top hits viewport top
   *   progress=1 when container bottom hits viewport top
   * The container is h-[2500px] so that gives ~1500px of pin travel
   * (first 1000px is dead zone before the sticky kicks in visually).
   * Adjust the container height to match your original `end: "+=1500"`.
   */
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Hero: y moves from 0% → -100% over full scroll range
  // Matches GSAP: .to(".hero", { yPercent: -100, duration: 1, ease: "none" })
  const heroY = useTransform(scrollYProgress, [0, 0.67], ["0%", "-100%"]);

  // Section 1: blur 0 → 4px and opacity 1 → 0.9 in the last third of travel
  // Matches GSAP: .to(".section-1", { filter: "blur(4px)", opacity: 0.9, duration: 0.5 })
  const s1Blur = useTransform(scrollYProgress, [0.67, 1], [0, 4]);
  const s1Opacity = useTransform(scrollYProgress, [0.67, 1], [1, 0.9]);

  // Compose filter string reactively
  const s1Filter = useTransform(s1Blur, (v) => `blur(${v}px)`);

  return (
    /**
     * Outer wrapper: tall enough to create scroll distance.
     * h-[2500px] gives 1500px of scrub travel once the sticky element is pinned.
     * Change this value if you want more/less travel.
     */
    <div ref={containerRef} className="relative" style={{ height: "2500px" }}>
      {/*
       * Sticky pin container — matches GSAP's `pin: true`.
       * `sticky top-0 h-screen overflow-hidden` replaces ScrollTrigger pinning.
       */}
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* Section 1 — behind hero, blurs on exit */}
        <motion.div
          className="section-1 absolute inset-0 z-10"
          style={{
            filter: s1Filter,
            opacity: s1Opacity,
            willChange: "filter, opacity",
          }}
        >
          <SectionOne />
        </motion.div>

        {/* Hero — slides up */}
        <motion.div
          className="hero absolute inset-0 z-20"
          style={{
            y: heroY,
            willChange: "transform",
          }}
        >
          <Hero />
        </motion.div>

      </div>
    </div>
  );
}