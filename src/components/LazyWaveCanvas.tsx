"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const WaveCanvas = dynamic(() => import("./WaveCanvas"), {
  ssr: false,
  loading: () => null,
});

type LazyWaveCanvasProps = {
  imageSrc: string;
  preloaderDone?: boolean;
};

export default function LazyWaveCanvas({ imageSrc, preloaderDone }: LazyWaveCanvasProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!preloaderDone) return;

    let timerId: NodeJS.Timeout;

    // Load Three.js during browser IDLE periods so it never blocks GSAP animations
    const scheduleLoad = () => {
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(() => setShouldRender(true), { timeout: 3000 });
      } else {
        timerId = setTimeout(() => setShouldRender(true), 1500);
      }
    };

    // Trigger idle load after preloader is completely done
    scheduleLoad();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [preloaderDone]);

  return (
    <div className="relative w-full h-full">
      {shouldRender ? (
        <WaveCanvas imageSrc={imageSrc} preloaderDone={preloaderDone} />
      ) : (
        /* Instant image fallback while WebGL compiles silently */
        <img
          src={imageSrc}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}
    </div>
  );
}