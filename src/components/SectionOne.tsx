"use client";

export default function SectionOne() {
  return (
    <section
      className="section-1"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 20,
        overflow: "hidden",
        visibility: "hidden",   // ← hidden until GSAP sets it visible
      }}
    >
      <img
        src="https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=1800"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", alignItems: "center", paddingLeft: "5rem" }}>
        <h2 style={{ color: "#fff", fontSize: "5rem", fontWeight: 700 }}>Section One</h2>
      </div>
    </section>
  );
}