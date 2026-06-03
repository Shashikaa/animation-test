"use client";

export default function SectionOne() {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/pool-house.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.01)",
        }}
      />

      <div
        className="section-continer"
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          alignItems: "center",
          paddingBottom: "225px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 572,
            height: 264,
            backdropFilter: "blur(42px)",
            WebkitBackdropFilter: "blur(42px)",
            background: "rgba(25, 33, 28, 0.4)",
            paddingLeft: 50,
            paddingRight: 80,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 16,
            boxShadow: "-5px -5px 25px rgba(255,255,255,0.02) inset",
          }}
        >
          <p className="text-[#F4EEDF] text-body leading-[1.5] font-light">
            With expert craftsmanship and attention to detail, we bring your
            vision to life. Whether you need a backyard retreat or a high-end
            commercial pool, our team ensures a seamless experience from design
            to completion.
          </p>

<a
  href="/contact"
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
    marginTop: 44,
  }}
  className="group transition-opacity duration-200 hover:opacity-70"
>
  Get a free consultation
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
      </div>
    </section>
  );
}