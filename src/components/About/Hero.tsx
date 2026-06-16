"use client";

export default function SectionOne() {
  return (
    <section className="relative w-full h-screen overflow-hidden">

      {/* ── Background images ── */}
      <div
        className="s1-bg absolute left-0 right-0 bg-cover bg-center will-change-transform hidden lg:block"
        style={{ top: "-10%", bottom: "-10%", backgroundImage: "url('/mernda-ave-bonbeach.webp')" }}
      />
      <div
        className="s1-bg absolute left-0 right-0 bg-cover bg-top will-change-transform block lg:hidden"
        style={{ top: "-10%", bottom: "-10%", backgroundImage: "url('/mernda-ave-bonbeach.webp')" }}
      />

      {/* ── Gradient overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0) 51.72%, rgba(0,0,0,0.32) 86.09%)",
        }}
      />

      {/* ── Bottom-left text ── */}
      <div className="section-continer relative z-10 h-full flex flex-col justify-end">
        <div className="flex flex-col gap-2">
          <h1
            className="text-[#F4EEDF] !font-[100]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Designing Pools,
          </h1>
          <p
            className="text-[#F4EEDF] !mt-3"
   
          >
            Creating Experiences
          </p>
        </div>
      </div>

    </section>
  );
}