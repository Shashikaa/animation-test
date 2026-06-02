"use client";

export default function Hero() {
  return (
    <section
      className="relative min-h-screen overflow-hidden bg-cover bg-center hero absolute inset-0 z-20"
      style={{
        backgroundImage: "url('/hero.webp')",
      }}
    >
      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(107.8deg, rgba(25, 33, 28, 0) 50.32%, rgba(25, 33, 28, 0.72) 78.81%)",
        }}
      />

      {/* Content Container */}
<div className="relative z-10 section-continer min-h-screen flex items-end justify-end pb-[85px]">
  <div className="max-w-[400px] text-right">
    <p className="text-[#F4EEDF] text-body leading-[1.2] font-light">
      At Grand Pools, we create custom swimming pools that blend style,
      function, and quality. Every pool is designed to complement your
      outdoor space, adding value and elegance to your home or business.
    </p>
  </div>
</div>
    </section>
  );
}