"use client";

import WaveCanvas from "../../components/WaveCanvas"; // Adjust the path based on where WaveCanvas lives

export default function TestWavePage() {
  return (
    <main className="relative w-screen h-screen bg-[#0F3735] flex flex-col items-center justify-center overflow-hidden">
      
      {/* 1. Direct Canvas Container */}
      <div className="absolute inset-0 w-full h-full z-0">
        <WaveCanvas />
      </div>
      <div 
        className="absolute inset-0 z-10 mix-blend-multiply" 
        style={{
          background: "linear-gradient(135deg, #162D24 0%, #094146 100%)",
          opacity: 1 // Adjust this value to let more or less of the water texture show through
        }}
      />
      {/* 2. Simple UI Overlay for testing interaction */}

      
    </main>
  );
}