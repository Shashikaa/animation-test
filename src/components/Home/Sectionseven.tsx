"use client";

const PARTNERS = [
  { name: "Socure",      logo: "/partners/logo1.svg" },
  { name: "Cedar",       logo: "/partners/logo2.svg" },
  { name: "Airtable",    logo: "/partners/logo3.svg" },
  { name: "Culture Amp", logo: "/partners/logo4.svg" },
  { name: "Socure",      logo: "/partners/logo5.svg" },
  { name: "Cedar",       logo: "/partners/logo6.svg" },
];

const PARTNERS_LOOP = [...PARTNERS, ...PARTNERS];

export default function SectionSeven() {
  return (
    <section className="relative w-full h-full overflow-hidden">

      {/* ── Desktop BG ── */}
      <div
        className="s7-bg-img absolute bg-cover bg-center hidden lg:block"
        style={{
          backgroundImage: "url('/team-photo.webp')",
          top: 0, left: 0, width: "100%", height: "120%",
          willChange: "transform",
        }}
      />

      {/* ── Mobile/Tablet BG ── */}
      {/* FIX: Ensure transform and transformOrigin are defined here so GSAP initializes the values seamlessly */}
      <div
        className="s7-mob-bg absolute bg-cover bg-center block lg:hidden"
        style={{
          backgroundImage: "url('/sectionseven-mobile.webp')",
          top: 0, left: 0, width: "100%", height: "100%",
          transform: "scale(1.35)",
          transformOrigin: "center center",
          willChange: "transform",
        }}
      />

      {/* ── Desktop: Title + Card ── */}
      <div
        className="hidden lg:flex absolute flex-col gap-3"
        style={{ top: "16%", left: "50%", width: 620 }}
      >
        <h2
          className="text-[#F4EEDF] font-[100] s7-title reveal-text"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Meet The Experts
        </h2>

        <div
          className="flex flex-col gap-0.5 !px-[32px] !py-[30px] max-w-[340px] !mt-2 "
        >
          <p className="s7-para font-body text-[#F4EEDF] text-[14px] font-normal reveal-text">
            Lachlan Deleeuw
          </p>
          <p className="s7-para text-[#F4EEDF] text-[14px] mt-2 reveal-text">
            Founder – Grand Pools
          </p>
          <p className="s7-para font-body text-[#F4EBE4] text-[14px] font-normal leading-snug !mt-6 w-full reveal-text">
            Grand Pools founder Lachlan Deleeuw brings expert craftsmanship and tailored creativity to luxury pool builds, transforming backyards across Melbourne and the Bayside Region.
          </p>
        </div>
      </div>

      {/* ── Desktop: Partners ── */}
      <div className="hidden lg:flex absolute bottom-22 right-12 flex-col items-end gap-5">
        <p className="font-body text-[#F4EBE4] text-sm">Our Partners</p>
        <div
          className="overflow-hidden w-[520px]"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <div className="flex gap-5 w-max animate-marquee">
            {PARTNERS_LOOP.map((p, i) => (
              <div key={i} className="flex-shrink-0">
                <img src={p.logo} alt={p.name}
                  className="block w-[76px] h-[18px] object-contain"
                  style={{ filter: "brightness(0) invert(1)" }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════
          MOBILE + TABLET LAYOUT
      ════════════════════ */}
      <div className="lg:!hidden !flex !absolute !inset-0 !flex-col !justify-between !py-[72px]  !m-0 !max-w-none !w-full">

        {/* Title + card — left-aligned */}
        <div className="!flex !flex-col !items-left !gap-4 !pl-14">
          <h2
            className="!text-[#F4EEDF] !font-[100] !text-left  !m-0 !mt-12"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Meet The Expert
          </h2>

          <div
            className="!w-[76%] !max-w-[340px] !flex !flex-col !mt-2 "
          >
            <p className="!text-[#F4EEDF] !text-[14px] !font-normal !m-0">Lachlan Deleeuw</p>
            <p className="!text-[#F4EEDF] !text-[14px] !mt-2.5 !mb-0">Founder – Grand Pools</p>
            <p className="!text-[#F4EBE4] !text-[14px] !font-normal !leading-snug !mt-4 !mb-0">
              Lachlan Deleeuw brings expert craftsmanship and tailored creativity to
              luxury pool builds, transforming backyards across Melbourne and the
              Bayside Region.
            </p>
          </div>
        </div>

        {/* Partners — bottom */}
        <div className="!flex !flex-col !items-end !gap-3 !px-6">
          <p className="!text-[#F4EBE4] !text-[16px] !m-0">Our Partners</p>
          <div
            className="!overflow-hidden !w-full"
            style={{
              maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            }}
          >
            <div className="flex gap-5 w-max animate-marquee">
              {PARTNERS_LOOP.map((p, i) => (
                <div key={i} className="!flex-shrink-0">
                  <img src={p.logo} alt={p.name}
                    className="!block !w-[84px] !h-[26px] !object-contain"
                    style={{ filter: "brightness(0) invert(1)" }} />
                </div>
              ))}
            </div>
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