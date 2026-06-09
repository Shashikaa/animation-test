"use client";

const PARTNERS = [
  { name: "Socure",      logo: "/partners/logo1.svg" },
  { name: "Cedar",       logo: "/partners/logo2.svg" },
  { name: "Airtable",    logo: "/partners/logo3.svg" },
  { name: "Culture Amp", logo: "/partners/logo4.svg" },
  { name: "Socure",      logo: "/partners/logo5.svg" },
  { name: "Cedar",       logo: "/partners/logo6.svg" },
];

// Duplicate for seamless infinite loop — translateX(-50%) snaps back invisibly
const PARTNERS_LOOP = [...PARTNERS, ...PARTNERS];

export default function SectionSeven() {
  return (
    <section className="relative w-full h-full overflow-hidden">

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/team-photo.webp')" }}
      />


      {/* ─── Glassmorphic card ─── */}
      <div
        className="absolute flex flex-col gap-0.5 !px-[42px] !py-[40px]"
        style={{
          top: "16%",
          left: "50%",
          width: 420,
          backdropFilter: "blur(42px)",
          WebkitBackdropFilter: "blur(42px)",
          background:
            "radial-gradient(100% 100% at 0% 0%, rgba(25,33,28,0.64) 0%, rgba(25,33,28,0.24) 100%)",
          boxShadow:
            "-5px -5px 25px rgba(255,255,255,0.02) inset, 0 4px 4px rgba(0,0,0,0.25)",
        }}
      >
        <h2
          className="text-[#F4EEDF] !text-[24px] font-normal leading-[1.2] "
          style={{ fontFamily: "var(--font-display)" }}
        >
          Meet The Experts of
          <br />
          <em className="font-cormorant">Grand Pools</em>
        </h2>

        <p className="font-body text-[#F4EEDF] text-base font-normal !mt-6">
          Lachlan Deleeuw
        </p>

        <p className="text-[#F4EEDF] text-sm">
          Founder – Grand Pools
        </p>

        <p className="font-body text-[#F4EBE4] text-sm font-normal leading-snug !mt-6 w-full max-w-[90%]" >
          Grand Pools founder Lachlan Deleeuw brings expert craftsmanship and
          tailored creativity to luxury pool builds, transforming backyards
          across Melbourne and the Bayside Region.
        </p>
      </div>

      {/* ─── Our Partners — bottom right ─── */}
      <div className="absolute bottom-9 right-12 flex flex-col items-end gap-5">
        <p className="font-body text-[#F4EBE4] text-sm">Our Partners</p>

        {/* Marquee viewport — fixed width with fade edges */}
        <div
          className="overflow-hidden w-[520px]"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          {/*
            KEY FIX: width is max-content so the track is exactly as wide as
            all items. translateX(-50%) always lands on the seam between the
            original set and the duplicate → seamless loop, zero reset flash.
          */}
          <div className="flex gap-5 w-max animate-marquee">
            {PARTNERS_LOOP.map((p, i) => (
              <div key={i} className="flex-shrink-0">
                <img
                  src={p.logo}
                  alt={p.name}
                  className="block w-[76px] h-[18px] object-contain"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 14s linear infinite;
        }
      `}</style>
    </section>
  );
}