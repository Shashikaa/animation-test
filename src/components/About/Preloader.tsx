import { useState, useEffect } from "react";

type PreloaderProps = {
  onComplete?: () => void;
};

export default function Preloader({ onComplete }: PreloaderProps) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // 1. Kick off visual fadeout AND alert parent instantly to initiate Hero Zoom
    const fadeTimer = setTimeout(() => {
      setFading(true);
      onComplete?.(); // Triggers `start={true}` synchronously at the start of visual crossfade
    }, 600);

    // 2. Clear element securely from physical memory DOM node list
    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 1400); // 600ms display + 800ms transition duration match

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-10000000 w-full h-screen overflow-hidden transition-opacity duration-[800ms]"
      style={{ opacity: fading ? 0 : 1, pointerEvents: fading ? "none" : "auto" }}
    >
      <img
        src="preloader.webp"
        alt="Grand Pools"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}