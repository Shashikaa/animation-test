// components/SectionFour.tsx
export default function SectionFour() {
  return (
    <section className="section-4 absolute inset-0 z-10 overflow-hidden">
      <img
        src="/your-section-4-bg.webp"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      />
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        {/* your content here */}
        <h2 className="text-white text-4xl">Section Four</h2>
      </div>
    </section>
  );
}