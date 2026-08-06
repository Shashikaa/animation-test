"use client";

import { useState, useEffect } from "react";

type FadePreloaderProps = {
  onExitStart?: () => void;
  onComplete?: () => void;
};

const HOLD_DURATION_MS = 150;
const EXIT_DURATION_MS = 150;

export default function FadePreloader({
  onExitStart,
  onComplete,
}: FadePreloaderProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFading(true);
      onExitStart?.();
    }, HOLD_DURATION_MS);

    return () => clearTimeout(fadeTimer);
  }, [onExitStart]);

  useEffect(() => {
    if (!fading) return;

    const completeTimer = setTimeout(() => {
      onComplete?.();
      setVisible(false);
    }, EXIT_DURATION_MS);

    return () => clearTimeout(completeTimer);
  }, [fading, onComplete]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] overflow-hidden pointer-events-none"
      style={{
        opacity: fading ? 0 : 1,
        transition: `opacity ${EXIT_DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
      }}
    >
      {/* Updated SVG Background */}
      <svg
        className="h-full w-full object-cover"
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect width="1920" height="1080" fill="url(#paint0_linear_6224_4460)" />
        <rect width="1920" height="1080" fill="url(#paint1_linear_6224_4460)" />
        <defs>
          <linearGradient
            id="paint0_linear_6224_4460"
            x1="0"
            y1="0"
            x2="1899.94"
            y2="1059.79"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#162D24" />
            <stop offset="1" stopColor="#094146" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_6224_4460"
            x1="0"
            y1="0"
            x2="1899.94"
            y2="1059.79"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#162D24" />
            <stop offset="1" stopColor="#094146" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}