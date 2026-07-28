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

    // Yield 1 frame after preloader completes to let UI animations finish setup,
    // then immediately mount WaveCanvas so WebGL is initialized before the user scrolls to CTA.
    let animationFrameId: number;
    
    animationFrameId = requestAnimationFrame(() => {
      setShouldRender(true);
    });

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [preloaderDone]);

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