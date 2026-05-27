"use client";

export default function Hero() {
  return (
    <section
      className="hero"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10,          // lowest — stays pinned at bottom of stack
        overflow: "hidden",
      }}
    >
      <img
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1800"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <h1 style={{ color: "#fff", fontSize: "6rem", fontWeight: 700 }}>Hero</h1>
      </div>
    </section>
  );
}