"use client";

import { useSite } from "../app/context/SiteContext";
import WaveCanvas from "./WaveCanvas";

export default function WaveCanvasWrapper() {
  const { preloaderDone } = useSite();

  // If the complete sequence finished, unmount the canvas completely to save GPU cycles
  if (preloaderDone) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none transition-opacity duration-700 ease-out"
      style={{ 
        zIndex: 9998, // Placed directly right underneath the layout text elements
        backgroundColor: "transparent"
      }}
    >
      <WaveCanvas />
    </div>
  );
}