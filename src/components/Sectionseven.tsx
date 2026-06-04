"use client";

const PARTNERS = [
  { name: "Socure" },
  { name: "Cedar" },
  { name: "Airtable" },
  { name: "Culture Amp" },
  { name: "Socure" },
  { name: "Cedar" },
];

// Duplicate for seamless infinite loop
const PARTNERS_LOOP = [...PARTNERS, ...PARTNERS];

export default function SectionSeven() {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Background image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/team-photo.webp')", // ← swap with your image
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Subtle dark overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.08)",
        }}
      />

      {/* ─── Glassmorphic card — top 20%, left 40% ─── */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "40%",
          width: 420,
          backdropFilter: "blur(42px)",
          WebkitBackdropFilter: "blur(42px)",
          background: "rgba(25, 33, 28, 0.38)",
          boxShadow:
            "-5px -5px 25px rgba(255,255,255,0.02) inset, 0 4px 4px rgba(0,0,0,0.25)",
          padding: "40px 52px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {/* Heading */}
        <p
          style={{
            fontFamily: "var(--font-serif, Georgia, serif)",
            fontSize: 26,
            fontWeight: 400,
            lineHeight: 1.3,
            color: "#F4EEDF",
            letterSpacing: "0.01em",
          }}
        >
          Meet The Experts of
          <br />
          <em>Grand Pools</em>
        </p>

        {/* Name */}
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#F4EEDF",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginTop: 10,
          }}
        >
          Lachlan Deleeuw
        </p>

        {/* Role */}
        <p
          style={{
            fontSize: 12,
            color: "rgba(244,238,223,0.60)",
            letterSpacing: "0.04em",
          }}
        >
          Founder – Grand Pools
        </p>

        {/* Body */}
        <p
          style={{
            fontSize: 13,
            fontWeight: 300,
            color: "rgba(244,238,223,0.85)",
            lineHeight: 1.7,
            marginTop: 6,
          }}
        >
          Grand Pools founder Lachlan Deleeuw brings expert craftsmanship and
          tailored creativity to luxury pool builds, transforming backyards
          across Melbourne and the Bayside Region.
        </p>
      </div>

      {/* ─── Our Partners — bottom right ─── */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          right: 48,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 12,
        }}
      >
        {/* Label */}
        <p
          style={{
            fontSize: 11,
            color: "rgba(244,238,223,0.50)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Our Partners
        </p>

        {/* Marquee wrapper */}
        <div
          style={{
            width: 420,
            overflow: "hidden",
            maskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <div
            className="partners-track"
            style={{
              display: "flex",
              gap: 20,
              animation: "marqueeScroll 14s linear infinite",
              whiteSpace: "nowrap",
            }}
          >
            {PARTNERS_LOOP.map((p, i) => (
              <div
                key={i}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  background: "rgba(244,238,223,0.07)",
                  border: "1px solid rgba(244,238,223,0.14)",
                  borderRadius: 4,
                  padding: "6px 14px",
                }}
              >
                {/* Placeholder icon — replace with actual SVG logos */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ opacity: 0.55 }}
                >
                  <circle cx="7" cy="7" r="6" stroke="#F4EEDF" strokeWidth="1" />
                  <circle cx="7" cy="7" r="2.5" fill="#F4EEDF" />
                </svg>
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(244,238,223,0.75)",
                    letterSpacing: "0.07em",
                    fontWeight: 500,
                    textTransform: "uppercase",
                  }}
                >
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keyframe injected via style tag */}
      <style>{`
        @keyframes marqueeScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}