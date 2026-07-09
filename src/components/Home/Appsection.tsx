"use client";

export default function Appsection() {
  return (
    <section className="relative w-full min-h-screen lg:h-screen overflow-hidden flex items-center justify-center py-12 md:py-20 lg:py-0">
      
      {/* ── Extracted Background Image for isolated GSAP scaling/translation ── */}
      <div 
        className="appsec-bg absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/appsection.webp')", 
        }}
      />

      {/* ── Inner content container layer ── */}
      <div className="appsec-content section-container relative z-10 w-full flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-12 md:gap-16 lg:gap-20">
        
        {/* ── Left Column: Text & Titles ── */}
        {/* Added lg:flex-col-reverse so paragraph sits on top on desktop, while mobile retains normal column order */}
        <div className="w-full lg:w-1/2 flex flex-col lg:flex-col-reverse justify-between text-left items-start">
          
          {/* Main Headings */}
          {/* Mobile: order-1. Desktop: normal flow, but flipped by the parent container. Added lg:mt-8 for space below paragraph on desktop */}
          <div className="flex flex-col gap-2 order-1 lg:order-none lg:!mt-16">
            <span className="text-[#F4EEDF] text-xs md:text-[14px] font-normal">
              Pool Care +
            </span>
            <h2 
              className="text-[#F4EEDF] !font-[100]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your pool journey clearly tracked
            </h2>
          </div>

          {/* Top Intro Paragraph */}
          {/* Mobile: order-2 with a top margin. Desktop: normal flow (sits on top), clearing the top margin and using mb-8 instead */}
          <p className="font-body text-[#F4EEDF] text-sm md:text-base max-w-[450px] lg:max-w-[360px] !mt-8 lg:!mt-0 !mb-10 md:!mb-16 lg:mb-0 order-2 lg:order-none">
            Pool Care + keeps you informed and involved from start to finish. Live updates, progress tracking and everything you need, all in one place.
          </p>
          
        </div>

        {/* ── Right Column: Device Mockup ── */}
        <div className="appsec-phone-wrapper w-full lg:w-1/2 flex justify-center items-center order-3 lg:order-none">
          <div className="w-[65%] sm:w-[50%] md:w-[45%] lg:w-[85%] max-w-[380px]">
            <img 
              src="/phone-mockup.webp" 
              alt="Pool Care Mobile App Mockup" 
              className="w-full h-auto max-h-[35vh] md:max-h-[55vh] lg:max-h-[70vh] block object-contain drop-shadow-2xl"
            />
          </div>
        </div>

      </div>

    </section>
  );
}