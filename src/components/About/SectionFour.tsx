"use client";

export default function SectionFour() {
  // Define the overlay color
  const overlayColor = "rgba(25, 33, 28, 0.24)";

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Desktop image with color overlay */}
      <div
        className="s1-bg s4-img-bg absolute left-0 right-0 bg-cover bg-center will-change-transform hidden lg:block"
        style={{ 
          top: "-0%", 
          bottom: "-0%", 
          backgroundImage: `linear-gradient(${overlayColor}, ${overlayColor}), url('/about.webp')`,
          transform: "scale(1.15)" // Starts oversized to cushion the zoom out
        }}
      />

      {/* Mobile + Tablet image with color overlay */}
      <div
        className="s1-bg s4-img-bg absolute left-0 right-0 bg-cover bg-top will-change-transform block lg:hidden"
        style={{ 
          top: "-0%", 
          bottom: "-0%", 
          backgroundImage: `linear-gradient(${overlayColor}, ${overlayColor}), url('/about-mob.webp')`,
          transform: "scale(1.15)" // Starts oversized to cushion the zoom out
        }}
      />
{/* ── Black Overlay ── */}
      <div 
        className="absolute inset-0 bg-black/20 pointer-events-none z-[1]" 
      />
      <div className="section-container relative z-[1] h-full flex items-start lg:items-end !pb-26 md:!pb-32 lg:!pb-50 !pt-42 md:!pt-32 lg:!pt-32">
        <div
          className=" w-full max-w-[250px] md:max-w-[340px] lg:max-w-[360px] h-auto md:h-[148px] lg:h-[164px] flex flex-col justify-center gap-4 will-change-transform"
        >
          <p className=" reveal-text text-[#F4EEDF] font-body font-normal ">
Built with premium materials and proven techniques, each pool is tailored to your vision and space, with clear communication to keep the process smooth from start to finish.          </p>
        </div>
      </div>
    </section>
  );
}