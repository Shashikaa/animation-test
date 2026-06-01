"use client";

export default function Hero() {
  return (
    <section className="fixed inset-0 z-10 overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1800"
        alt="Hero background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-6">

        {/* Canela Text Trial */}
        <h1 className="text-white text-[64px] leading-none font-display">
          Premium Pool Solutions for
        </h1>

        {/* Cormorant Garamond italic */}
        <h2 className="text-white text-[48px] leading-none font-cormorant italic">
          Every Need
        </h2>

        {/* Instrument Sans */}
        <p className="text-white text-[24px] leading-none font-body  
      ">
          From renovations to new builds, we design and construct pools that combine style, functionality, and durability.
        </p>

      </div>
    </section>
  );
}