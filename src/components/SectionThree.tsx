"use client";

export default function SectionThree() {
  return (
    <section
      className="section-3"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 20,
        overflow: "hidden",
        visibility: "hidden",
        willChange: "clip-path",
        clipPath: "inset(100% 0% 0% 0%)",
      }}
    >
      <img
        src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1800"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2
          style={{
            color: "#fff",
            fontSize: "5rem",
            fontWeight: 700,
          }}
        >
          Section Three
        </h2>
      </div>
    </section>
  );
}