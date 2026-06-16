import { useState, useEffect } from "react";

type PreloaderProps = {
  onComplete?: () => void;
};

export default function Preloader({ onComplete }: PreloaderProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background image — fills the screen */}
      <img
        src="preloader.webp"
        alt="Grand Pools"
        className="absolute inset-0 w-full h-full object-cover"
      />


    
    </div>
  );
}