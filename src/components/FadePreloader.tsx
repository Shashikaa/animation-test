"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

type FadePreloaderProps = {
  onExitStart?: () => void;
  onComplete?: () => void;
};

const HOLD_DURATION_MS = 1500;
const EXIT_DURATION_MS = 600;

export default function FadePreloader({
  onExitStart,
  onComplete,
}: FadePreloaderProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!orbRef.current) return;

    // Create a GSAP matchMedia instance
    const mm = gsap.matchMedia();

    // Only run the animation on desktop (screens wider than 1024px)
    mm.add("(min-width: 1025px)", () => {
      gsap.fromTo(
        orbRef.current,
        {
          y: "-20vh",
        },
        {
          y: "140vh",
          duration: 2.5,
          ease: "power2.out",
          force3D: true,
        }
      );
    });

    // Cleanup matchMedia when component unmounts
    return () => mm.revert();
  }, []);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFading(true);
      onExitStart?.();
    }, HOLD_DURATION_MS);

    return () => clearTimeout(fadeTimer);
  }, [onExitStart]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !fading) return;

    const handleEnd = (e: TransitionEvent) => {
      if (e.propertyName !== "opacity") return;

      onComplete?.();
      setVisible(false);
    };

    el.addEventListener("transitionend", handleEnd);

    const fallback = setTimeout(() => {
      onComplete?.();
      setVisible(false);
    }, EXIT_DURATION_MS + 200);

    return () => {
      el.removeEventListener("transitionend", handleEnd);
      clearTimeout(fallback);
    };
  }, [fading, onComplete]);

  if (!visible) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[9999] overflow-hidden"
      style={{
        opacity: fading ? 0 : 1,
        transition: `opacity ${EXIT_DURATION_MS}ms ease-out`,
        pointerEvents: "none",
      }}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #162D24 0%, #094146 100%)",
        }}
      />

      {/* Moving Glow - Hidden by default on mobile/tablet, shown on desktop */}
      <div
        ref={orbRef}
        className="hidden lg:block absolute rounded-full"
        style={{
          width: "900px",
          height: "900px",
          top: "-500px",
          right: "-150px",
          background: "#7C8C2D",
          filter: "blur(220px)",
          opacity: 0.9,
          willChange: "transform",
        }}
      />
    </div>
  );
}