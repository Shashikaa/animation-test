"use client";

import { useState, useEffect, useRef } from "react";

type FadePreloaderProps = {
  onExitStart?: () => void;
  onComplete?: () => void;
};

// Set both to 0 for an absolute instant appearance and disappearance
const HOLD_DURATION_MS = 0; 
const EXIT_DURATION_MS = 0; 

export default function FadePreloader({
  onExitStart,
  onComplete,
}: FadePreloaderProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

    // Reduced the fallback delay to 0 since there is no transition time to wait for
    const fallback = setTimeout(() => {
      onComplete?.();
      setVisible(false);
    }, EXIT_DURATION_MS);

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
      {/* Background Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #162D24 0%, #094146 100%)",
        }}
      />

      {/* SVG Static Glow Orb */}
      <svg
        className="absolute"
        width="900"
        height="900"
        viewBox="0 0 900 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          top: "-300px",
          right: "-150px",
          opacity: 0.9,
        }}
      >
        <g filter="url(#blur-glow)">
          <circle cx="450" cy="450" r="230" fill="#7C8C2D" />
        </g>
        <defs>
          <filter
            id="blur-glow"
            x="0"
            y="0"
            width="900"
            height="900"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="110" result="effect1_foregroundBlur" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}