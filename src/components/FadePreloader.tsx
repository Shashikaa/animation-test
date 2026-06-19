"use client";

import { useState, useEffect, useRef } from "react";

type FadePreloaderProps = {
  onExitStart?: () => void;
  onComplete?:  () => void;
};

const HOLD_DURATION_MS = 50;   // how long it stays fully visible before fading
const EXIT_DURATION_MS = 150;  // how fast it fades out

export default function FadePreloader({ onExitStart, onComplete }: FadePreloaderProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading]   = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFading(true);
      onExitStart?.(); // header starts its opacity transition in this same tick
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

    // Safety net: if transitionend never fires (tab backgrounded mid-fade,
    // element removed by something else, etc.) don't get stuck in "exiting".
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
      className="fixed inset-0 z-[9999] w-full h-screen overflow-hidden"
      style={{
        opacity: fading ? 0 : 1,
        transition: `opacity ${EXIT_DURATION_MS}ms ease-out`,
        pointerEvents: "none", // never blocks interaction, even during the brief hold
      }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_preloader)">
          <rect width="1440" height="800" fill="url(#paint0_linear_preloader)" />
          <g filter="url(#filter0_f_preloader)">
            <circle cx="1040" cy="-230" r="400" fill="#7C8C2D" />
          </g>
        </g>
        <defs>
          <filter
            id="filter0_f_preloader"
            x="240"
            y="-1030"
            width="1600"
            height="1600"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="200" result="effect1_foregroundBlur_preloader" />
          </filter>
          <linearGradient
            id="paint0_linear_preloader"
            x1="0"
            y1="0"
            x2="1416.5"
            y2="800"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#162D24" />
            <stop offset="1" stopColor="#094146" />
          </linearGradient>
          <clipPath id="clip0_preloader">
            <rect width="1440" height="800" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}