"use client";

interface HeroProps {
  hideText?: boolean;
}

export default function ProjectsHero({ hideText = false }: HeroProps) {
  return (
    <div className="relative w-full h-full bg-[#F4EEDF]">
      <div 
        className="projects-hero-top-layer absolute inset-0 w-full h-full overflow-hidden z-10 will-change-[clip-path]"
        style={{ clipPath: "inset(0px 0px 0px 0px)" }}
      >
        <section className="relative w-full h-full bg-[#111]">
          <div
            className="projects-hero-bg absolute left-0 right-0 bg-cover bg-center will-change-transform"
            style={{
              top: "-10%",
              bottom: "-10%",
              backgroundImage: "url('/projectshero.webp')", 
              backfaceVisibility: "hidden",
            }}
          />
     
          {!hideText && (
            <>
              {/* Left-Aligned Initial Content Block */}
              <div className="hero-text-wrap section-container absolute inset-0 z-10 h-full flex flex-col justify-end pb-12 md:pb-16 lg:pb-22 pl-6 md:pl-12 lg:pl-20 will-change-[opacity,transform]">
                <div className="flex flex-col !gap-4 lg:!gap-4">
                  <h1
                    className="hero-title text-[#F4EEDF] font-[100]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Projects
                  </h1>
                  <p className="hero-desc text-[#F4EEDF] !mt-1 max-w-[380px] ">
                    That Truly Speak for Themselves
                    <br />
                    Take a look at some of our completed projects across Melbourne
                  </p>
                </div>
              </div>

              {/* Right-Aligned Dynamic Scroll Blocks */}
              <div className="scroll-text-container section-container absolute inset-0 z-20 h-full flex items-end justify-end pointer-events-none">
                <div className="relative w-full max-w-[310px] md:max-w-[400px] lg:max-w-[440px] mb-12 md:mb-16 lg:mb-22 pr-6 md:pr-12 lg:pr-20 text-[#F4EEDF] text-sm md:text-base font-[300] leading-relaxed">
                  
                  <div className="relative w-full h-full min-h-[150px]">
                    
                    {/* FIX: Added 'invisible' to completely block initial browser flashing */}
                    <p className="scroll-para-1 invisible absolute top-0 left-0 w-full pointer-events-auto">
                      Our projects showcase the quality, craftsmanship, and attention to detail that define Grand Pools. From luxury backyard retreats to large-scale custom builds across Melbourne, every pool is designed to complement its surroundings while delivering lasting beauty, functionality, and value.
                    </p>

                    {/* FIX: Added 'invisible' to completely block initial browser flashing */}
                    <p className="scroll-para-2 invisible absolute top-0 left-0 w-full pointer-events-auto">
                      We work closely with each client to create tailored solutions that transform outdoor spaces into stunning environments for relaxation, entertaining, and everyday enjoyment.
                    </p>

                  </div>

                </div>
              </div>
            </>
          )}
        </section>
      </div>

    </div>
  );
}