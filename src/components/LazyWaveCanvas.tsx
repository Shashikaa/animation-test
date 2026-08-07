"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Skip canvas mounting if not home page or preloader isn't ready
    if (!isHome || !preloaderDone) return;

    let animationFrameId: number;

    animationFrameId = requestAnimationFrame(() => {
      setShouldRender(true);
    });

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [preloaderDone, isHome]);

  // Non-home routes instantly return static image (no WebGL or dynamic import overhead)
  if (!isHome) {
    return (
      <div className="relative w-full h-full">
        <img
          src={imageSrc}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {shouldRender ? (
        <WaveCanvas imageSrc={imageSrc} preloaderDone={preloaderDone} />
      ) : (
        <img
          src={imageSrc}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}
    </div>
  );
}