"use client";

interface HeroProps {
  hideText?: boolean;
}

export default function ContactHero({ hideText = false }: HeroProps) {
  return (
    <div className="relative w-full h-full bg-[#F4EEDF]">
      


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
            <div className="hero-text-wrap section-container relative z-10 h-full flex flex-col justify-end !pb-22 will-change-[opacity,transform]">
              <div className="flex flex-col !gap-2 lg:!gap-6">
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
                <p className="hero-desc text-[#F4EEDF] !mt-1 max-w-[434px]">
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