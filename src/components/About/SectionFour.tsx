"use client";

export default function SectionFour() {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Desktop image - Added s4-img-bg class and initial scale styling */}
      <div
        className="s1-bg s4-img-bg absolute left-0 right-0 bg-cover bg-center will-change-transform hidden lg:block"
        style={{ 
          top: "-10%", 
          bottom: "-10%", 
          backgroundImage: "url('/about.webp')",
          transform: "scale(1.15)" // Starts oversized to cushion the zoom out
        }}
      />

      {/* Mobile + Tablet image - Added s4-img-bg class and initial scale styling */}
      <div
        className="s1-bg s4-img-bg absolute left-0 right-0 bg-cover bg-top will-change-transform block lg:hidden"
        style={{ 
          top: "-10%", 
          bottom: "-10%", 
          backgroundImage: "url('/about.webp')",
          transform: "scale(1.15)" // Starts oversized to cushion the zoom out
        }}
      />

      <div className="section-continer relative z-[1] h-full flex items-end md:items-end px-4 md:px-8 lg:px-0 !pb-26 md:!pb-32 lg:!pb-50">
        <div
          className="s4-glass-card w-full max-w-[250px] md:max-w-[340px] lg:max-w-[360px] h-auto md:h-[148px] lg:h-[164px] !pl-6 md:!pl-6 lg:!pl-6 !pr-6 md:!pr-6 lg:!pr-6 !py-6 md:!py-7 lg:!py-8 flex flex-col justify-center gap-4 will-change-transform"
          style={{
            background: "rgba(25, 33, 28, 0.4)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(42px)",
            boxShadow: "-5px -5px 25px rgba(255,255,255,0.02) inset",
          }}
        >
          <p className="s4-reveal-text text-[#F4EEDF] font-body leading-[1.5] font-normal text-sm md:text-[15px] lg:text-base">
            Built using premium materials and proven techniques, tailored to your vision and space, with clear communication ensuring a smooth, stress-free experience.
          </p>
        </div>
      </div>
    </section>
  );
}