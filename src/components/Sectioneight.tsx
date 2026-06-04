"use client";

import WaterBackground from "./Ripplecanvas";

export default function SectionEight() {
  return (
    <section className="relative w-full h-full overflow-hidden">

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/Wellness.webp')" }}
      />

<div className="absolute inset-0 z-10 ">
    <WaterBackground  />
    </div>
      {/* ─── Right-side centered text block ─── */}
      <div className="absolute inset-y-0 right-0 w-[33%] flex items-center pr-16 pl-8">
        <div className="flex flex-col gap-5">

          {/* Eyebrow */}
          <h2
            className="text-[#F4EEDF] text-[24px] leading-[1.2] font-display "
          
          >
            Water as<br/>
            
            <em className="font-cormorant italic">Sanctuary.</em>
          </h2>


       

         

          {/* Body copy */}
          <p
            className="text-[#F4EEDF] leading-[1.2] max-w-[300px] font-body text-[16px] "

          >
Designed to disappear into the landscape, not announce itself. The result isn't a pool. It's a quiet room you walk outside to find.
          </p>


        </div>
      </div>

    </section>
  );
}