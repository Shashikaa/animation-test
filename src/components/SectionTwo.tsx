"use client";

export default function SectionTwo() {
  return (
    <section
      className="section-2"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 15,
        overflow: "hidden",
        visibility: "hidden",   // ← hidden until GSAP sets it visible
      }}
    >
      <img
        src="https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1800"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "5rem" }}>
        <h2 style={{ color: "#fff", fontSize: "5rem", fontWeight: 700 }}>Section Two</h2>
      </div>
    </section>
  );
}