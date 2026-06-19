"use client";

interface HeroProps {
  hideText?: boolean;
}

export default function ContactHero({ hideText = false }: HeroProps) {
  return (
    <div className="relative w-full h-full bg-[#F4EEDF]">
      
      {/* UNDERNEATH LAYER: Stationary text block card reveal anchor */}
      <div className="absolute bottom-0 left-0 w-full h-[320px] lg:top-0 lg:right-0 lg:left-auto lg:h-full lg:w-[550px] grid place-items-center !px-12 lg:!px-16 z-0">
        <div className="w-full max-w-[420px] text-left mx-auto">
          <p className="text-[#19211C] !text-[14px] md:!text-[16px]">
            Ready to bring your vision to life? Whether you have a specific project 
            in mind or need expert guidance, our team is here to help you navigate 
            every step of the journey. Let’s create something exceptional together.
          </p>
        </div>
      </div>

      {/* TOP LAYER: Full screen image container clipped with Inset values */}
      <div 
        className="contact-hero-top-layer absolute inset-0 w-full h-full overflow-hidden z-10 will-change-[clip-path]"
        style={{ clipPath: "inset(0px 0px 0px 0px)" }}
      >
        <section className="relative w-full h-full bg-[#111]">
          <div
            className="contact-hero-bg absolute left-0 right-0 bg-cover bg-center will-change-transform"
            style={{
              top: "-10%",
              bottom: "-10%",
              // Assuming you have a specific contact hero image
              backgroundImage: "url('/contacthero.webp')", 
              transform: "scale(1.3) translateZ(0)",
              backfaceVisibility: "hidden",
            }}
          />
     
          
          {!hideText && (
            <div className="hero-text-wrap section-continer relative z-10 h-full flex flex-col justify-end !pb-22 will-change-[opacity,transform]">
              <div className="flex flex-col !gap-2 lg:!gap-6 leading-normal">
                <h1
                  className="hero-title text-[#F4EEDF] !font-[100]"
                  style={{
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Let’s Bring Your
                  <br />
                  Dream Pool to Life
                </h1>
                <p className="hero-desc text-[#F4EEDF] !mt-1 w-[434px]">
                  Have a question or ready to start your project? Get in touch with our friendly team we’re here to help every step of the way, from planning to completion.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

    </div>
  );
}