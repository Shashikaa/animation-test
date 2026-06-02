"use client";

export default function Hero() {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundImage: "url('/hero.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background:
            "linear-gradient(107.8deg, rgba(25, 33, 28, 0) 50.32%, rgba(25, 33, 28, 0.72) 78.81%)",
        }}
      />
      <div
        className="section-continer"
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-end",
          paddingBottom: "85px",
        }}
      >
        <div style={{ maxWidth: 400, textAlign: "right" }}>
          <p className="text-[#F4EEDF] text-body leading-[1.2] font-light">
            At Grand Pools, we create custom swimming pools that blend style,
            function, and quality. Every pool is designed to complement your
            outdoor space, adding value and elegance to your home or business.
          </p>
        </div>
      </div>
    </section>
  );
}