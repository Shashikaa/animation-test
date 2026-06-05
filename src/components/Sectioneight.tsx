"use client";

import WaterBackground from "./Ripplecanvas";

export default function SectionEight() {
  return (
    <div className="relative w-full h-full overflow-hidden">

      {/* LEFT panel — clips top → bottom (bottom inset grows, wipes panel downward) */}
      <div
        className="s8-panel-left absolute inset-0"
        style={{ clipPath: "inset(0% 50% 0% 0%)" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/Wellness.webp')" }}
        />
        <div className="absolute inset-0 z-10">
          <WaterBackground />
        </div>
      </div>

      {/* RIGHT panel — clips bottom → top (top inset grows, wipes panel upward)
          Text lives inside here so it clips along with the panel */}
      <div
        className="s8-panel-right absolute inset-0"
        style={{ clipPath: "inset(0% 0% 0% 50%)" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/Wellness.webp')" }}
        />
        <div className="absolute inset-0 z-10">
          <WaterBackground />
        </div>

        {/*
          Text is INSIDE the clipped panel — it clips along with the panel
          so it never bleeds onto S7 or S9.
          Positioned to appear visually centred on the full image.
        */}
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            right: "2rem",
            top: 0,
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingRight: "10rem",
          }}
        >
          <div className="flex flex-col gap-5">
            <h2 className="text-[#F4EEDF] text-[24px] leading-[1.2] font-display">
              Water as<br />
              <em className="font-cormorant italic">Sanctuary.</em>
            </h2>
            <p className="text-[#F4EEDF] leading-[1.2] max-w-[300px] font-body text-[16px]">
              Designed to disappear into the landscape, not announce itself.
              The result isn't a pool. It's a quiet room you walk outside to find.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}