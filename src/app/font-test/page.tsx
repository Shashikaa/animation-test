"use client";

export default function FontTestPage() {
  return (
    <div className="min-h-screen w-full bg-[#162D24] text-[#F4EEDF] p-8 md:p-16 flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-bold mb-2">Font &amp; Symbol Test</h1>
        <p className="text-white/60">
          Inspecting automatic Spectral ampersand override for Canela headings.
        </p>
      </div>

      <section className="border border-white/10 p-6 rounded-lg bg-black/20">
        <span className="text-xs uppercase tracking-widest text-amber-400 font-mono block mb-2">
          Canela Display with Spectral Ampersand
        </span>
        <h2 className="font-display text-4xl md:text-6xl font-light leading-tight">
          Pool Equipment &amp; Installation
        </h2>
      </section>
    </div>
  );
}