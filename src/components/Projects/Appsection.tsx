"use client";

export default function Appsection() {
  return (
    <section className="relative w-full h-full min-h-screen overflow-hidden flex items-center justify-center  lg:py-0">
      
      {/* ── Background Image ── */}
      <div 
        className="appsec-bg absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat bg-[url('/appsection-mobile.webp')] lg:bg-[url('/Service1.webp')]"
      />

      {/* ── Main Content Container ── */}
      <div className="appsec-content section-container relative z-10 w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-20">
        
        {/* Title */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between items-start text-left lg:h-[450px]">
          <div className="flex flex-col gap-2 w-full">
            <span className="hidden lg:inline-block text-[#F4EEDF] text-xs md:text-[14px] font-normal">
              Pool Care +
            </span>
            <h2 
              className="text-[#F4EEDF] !font-[100] text-3xl md:text-5xl lg:text-6xl max-w-[320px] sm:max-w-none !mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Stay Updated at Every Stage
            </h2>
          </div>

          <div className="hidden lg:flex flex-col items-center w-full gap-6">
            <p className="font-body text-[#F4EEDF] text-sm md:text-base  self-start">
              Pool Care+ keeps you informed and involved from start to finish. Track progress, receive live updates, and follow each stage of your pool project — all in one place.
            </p>
          </div>
        </div>

        {/* Device Mockup */}
        <div className="appsec-phone-wrapper w-full lg:w-1/2 flex justify-center items-center">
          <div className="w-[360px] md:w-[360px] lg:w-[85%] max-w-[380px]">
            <img 
              src="/phone-mockup.webp" 
              alt="Pool Care Mobile App Mockup" 
              className="w-full h-auto max-h-[55vh] md:max-h-[50vh] lg:!max-h-[60vh] block object-contain !mb-12 !mt-12"
            />
          </div>
        </div>

        {/* Mobile Info Block */}
        <div className="flex flex-col items-center lg:hidden w-full text-center">
          <span className="text-[#F4EEDF] text-sm md:text-[16px] font-medium tracking-wide self-start text-left !mb-4">
            Pool Care +
          </span>

          <p className="font-body text-[#F4EEDF] text-sm md:text-base leading-relaxed text-left !mb-12">
            Pool Care+ keeps you informed and involved from start to finish. Track progress, receive live updates, and follow each stage of your pool project — all in one place.
          </p>

          <a
            href="#"

            className="group btn-underline font-body mt-2"
          >
            DOWNLOAD

          </a>
        </div>

      </div>

    </section>
  );
}