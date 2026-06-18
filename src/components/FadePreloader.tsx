"use client";

import { useState, useEffect, useRef } from "react";

type FadePreloaderProps = {
  onExitStart?: () => void;
  onComplete?:  () => void;
};

const EXIT_DURATION_MS = 100;

export default function FadePreloader({ onExitStart, onComplete }: FadePreloaderProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading]   = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFading(true);
      onExitStart?.(); // header starts its opacity transition in this same tick
    }, 100);
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
        transition: `opacity ${EXIT_DURATION_MS}ms cubic-bezier(0.76,0,0.24,1)`,
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <img
        src="/preloader.webp"
        alt="Grand Pools"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}