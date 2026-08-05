"use client";

import LazyWaveCanvas from "./LazyWaveCanvas";
import CtaForm from "./CtaForm";

type SectionCTAProps = {
  preloaderDone?: boolean;
};

export default function SectionCTA({ preloaderDone }: SectionCTAProps) {
  return (
    <section className="about-section-cta section-cta min-h-screen lg:h-full w-full relative">
      {/* Background Canvas & Fallback Image */}
      <div className="absolute inset-0 z-[1] pointer-events-none w-full h-full">
        <div className="hidden lg:block absolute inset-0 z-[1] pointer-events-auto w-full h-full">
          <LazyWaveCanvas imageSrc="/CTA.webp" preloaderDone={preloaderDone} />
        </div>

        <div className="block lg:hidden w-full h-full">
          <img
            src="/CTAmob.webp"
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Desktop Layout */}
      <div
        className="hidden lg:flex section-container cta-inner-desktop"
        style={{
          position: "relative",
          zIndex: 10,
          alignItems: "center",
          justifyContent: "space-between",
          gap: 44,
          minHeight: "100vh",
          maxWidth: 1440,
          padding: "40px 48px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            flex: "0 0 auto",
            maxWidth: 620,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <h2
              className="font-display"
              style={{ color: "#F4EEDF", fontWeight: 100, margin: 0 }}
            >
              Ready to Build Your Dream
            </h2>
          </div>
          <p
            className="font-body"
            style={{
              color: "#F4EEDF",
              fontSize: 16,
              lineHeight: 1.2,
              margin: 0,
              maxWidth: 400,
            }}
          >
            Let&apos;s bring your vision to life with a custom-designed pool
            crafted for your space and lifestyle. Reach out to get started today.
          </p>
        </div>

        <div style={{ flex: "1 1 auto", maxWidth: 560 }}>
          <CtaForm isMobile={false} />
        </div>
      </div>

      {/* Mobile Layout - Touch Event Propagation Blocked */}
      <div
        className="flex lg:hidden cta-inner-mobile min-h-screen h-auto !pt-12 !pb-16"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => {
          const isInput = (e.target as HTMLElement).tagName === "INPUT";
          if (!isInput) {
            e.stopPropagation();
          }
        }}
        style={{
          position: "relative",
          zIndex: 10,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingLeft: "20px",
          paddingRight: "20px",
          margin: 0,
        }}
      >
        <h2
          className="font-display !max-w-[300px] md:!max-w-[430px]"
          style={{
            color: "#F4EEDF",
            margin: 0,
            marginBottom: 28,
          }}
        >
          Ready to Build Your Dream
        </h2>

        <p
          className="font-body max-w-[500px]"
          style={{
            color: "#F4EEDF",
            margin: 0,
            marginBottom: 28,
          }}
        >
          Let&apos;s bring your vision to life with a custom-designed pool
          crafted for your space and lifestyle. Reach out to get started today.
        </p>

        <CtaForm isMobile={true} nameSuffix="mobile" />
      </div>
    </section>
  );
}