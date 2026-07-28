"use client";

import LazyWaveCanvas from "@/src/components/LazyWaveCanvas";
import CtaForm from "@/src/components/CtaForm";

type SectionCTAProps = {
  preloaderDone?: boolean;
  imageSrcDesktop?: string;
  imageSrcMobile?: string;
};

export default function SectionCTA({
  preloaderDone,
  imageSrcDesktop = "/CTAFORM.png",
  imageSrcMobile = "/CTAFORM.png",
}: SectionCTAProps) {
  return (
    <section
      className="section-cta !min-h-screen relative w-full h-screen overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #19211c 0%, #094146 100%)",
      }}
    >
      {/* Background Layer */}
      <div className="absolute inset-0 z-[1] pointer-events-auto w-full h-full">
        <div className="hidden lg:block absolute inset-0 z-[1] pointer-events-auto w-full h-full">
          <LazyWaveCanvas imageSrc={imageSrcDesktop} preloaderDone={preloaderDone} />
        </div>

        <div className="block lg:hidden w-full h-full">
          <img
            src={imageSrcMobile}
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex section-container cta-inner-desktop relative z-10 items-center justify-between gap-[44px] h-full max-w-[1440px] px-[48px]">
        <div className="flex-none max-w-[620px] flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-[#F4EEDF] font-[100] m-0">
              Ready to Build Your Dream
            </h2>
          </div>
          <p className="font-body text-[#F4EEDF] text-[16px] leading-[1.2] m-0 max-w-[400px]">
            Let&apos;s bring your vision to life with a custom-designed pool
            crafted for your space and lifestyle. Reach out to get started today.
          </p>
        </div>

        <div className="flex-1 max-w-[560px]">
          <CtaForm isMobile={false} />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex lg:hidden section-container cta-inner-mobile relative z-10 flex-col justify-center h-full px-[20px]">
        <h2 className="font-display text-[#F4EEDF] m-0 !mb-5 !max-w-[300px] md:!max-w-[430px]">
          Ready to Build Your Dream
        </h2>
        <p className="font-body text-[#F4EEDF] m-0 !mb-4 max-w-[500px]">
          Let&apos;s bring your vision to life with a custom-designed pool
          crafted for your space and lifestyle. Reach out to get started today.
        </p>

            <CtaForm isMobile={true} nameSuffix="mobile" />
      </div>
    </section>
  );
}