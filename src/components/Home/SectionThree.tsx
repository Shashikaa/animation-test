"use client";

const slides = [
  {
    img: "/pool-renovation.webp",
    label: "Concrete Pool Renovation",
    desc: "Restore and modernise your pool with high-quality finishes and functional upgrades for a fresh, stylish, and long-lasting look.",
  },
  {
    img: "/hero.webp",
    label: "Pool Equipment & Installation",
    desc: "We provide and install premium pool pumps, filters, heating systems, and automation solutions.",
  },
  {
    img: "/pool-new.webp",
    label: "New Pool Construction",
    desc: "From concept to completion, we build bespoke pools tailored to your space, lifestyle, and vision.",
  },
];

export default function SectionThree() {
  return (
    <section
      className="section-3 "
      style={{
        // Must be absolute to sit inside .pin-s3-s5 without pushing layout
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        // GSAP sets visibility:hidden + clipPath initially — don't fight it
        zIndex: 30,
      }}
    >
      {/* ── Base fill ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#0a0a0a",
          zIndex: 0,
        }}
      />

      {/* ── Background images — opacity driven by GSAP ── */}
      {slides.map((slide, i) => (
        <img
          key={i}
          className={`s3-bg s3-bg-${i + 1}`}
          src={slide.img}
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
            // Initial opacity set by GSAP in page.tsx — don't set here
            // to avoid flash before gsap.set() fires
            opacity: 0,
          }}
        />
      ))}

      {/* ── Gradient overlay ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(2.13deg, #19211C 6.01%, rgba(21, 40, 31, 0) 59.11%)",
          zIndex: 2,
        }}
      />

      {/* ── Bottom bar ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          padding: "0 65px 85px 65px",
        }}
      >
        {/* ── Left: indicator bars + text ── */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
          {/* Indicator bars — background driven by GSAP */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              paddingBottom: 4,
            }}
          >
            {slides.map((_, i) => (
              <div
                key={i}
                className={`s3-bar s3-bar-${i + 1}`}
                style={{
                  width: 2,
                  height: 24,
                  background: "rgba(244,238,223,0.3)",
                }}
              />
            ))}
          </div>

          {/* Text block — opacity driven by GSAP */}
          <div style={{ position: "relative", maxWidth: 420 }}>
            {slides.map((slide, i) => (
              <div
                key={i}
                className={`s3-text s3-text-${i + 1}`}
                style={{
                  position: i === 0 ? "relative" : "absolute",
                  top: 0,
                  left: 30,
                  // Initial opacity set by GSAP — start all at 0 to avoid flash
                  opacity: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 25,
                }}
              >
                <h2
                  className="font-display"
                  style={{
                    color: "#F4EEDF",
                    fontSize: "20px",
                    lineHeight: 1.1,
                    margin: 0,
                  }}
                >
                  {slide.label}
                </h2>

                <p
                  style={{
                    color: "#F4EEDF",
                    fontSize: 16,
                    lineHeight: 1.2,
                    margin: 0,
                    maxWidth: 340,
                  }}
                >
                  {slide.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── LEARN MORE ── */}
        <a
          href="/services"
          style={{
            position: "relative",
            display: "inline-block",
            width: "fit-content",
            paddingBottom: 8,
            fontSize: 14,
            fontWeight: 500,
            textTransform: "uppercase",
            color: "#F4EEDF",
            textDecoration: "none",
          }}
          className="group transition-opacity duration-200 hover:opacity-70 font-body"
        >
          LEARN MORE
          <span
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 1,
              background: "#F4EEDF",
              transition: "transform 0.2s ease",
            }}
            className="group-hover:-translate-y-[2px]"
          />
        </a>
      </div>
    </section>
  );
}