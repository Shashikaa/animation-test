// components/SectionFive.tsx
export default function SectionFive() {
  return (
    <section className="section-5 absolute inset-0 z-10 overflow-hidden">
      <img
        src="/hero.webp"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      />
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        {/* your content here */}
        <h2 className="text-white text-4xl">Section Five</h2>
      </div>
    </section>
  );
}