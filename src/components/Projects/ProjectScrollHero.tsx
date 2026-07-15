"use client";

interface ProjectScrollHeroProps {
  title: string;
  images: string[];
}

export default function ProjectScrollHero({ title, images }: ProjectScrollHeroProps) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#131313] p-8 md:p-16 flex items-end project-hero-master section-container">
      {/* Dynamic Stacking of Passed Images */}
      {images.map((src, index) => (
        <div
          key={`${src}-${index}`}
          className="hero-image-layer absolute inset-0 w-full h-full overflow-hidden"
          style={{
            zIndex: index + 10,
            clipPath: index === 0 ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" : "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
          }}
        >
          {/* FIXED: Standardized transform: "scale(1.6)" inline to match your main Projects page layout perfectly */}
          <div 
            className="hero-image-inner w-full h-full bg-cover bg-center will-change-transform"
            style={{
              backgroundImage: `url(${src})`,
              transform: "scale(1.6)",
              transformOrigin: "center center"
            }}
          />
        </div>
      ))}

      {/* Typography & Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none hero-gradient-overlay"
        style={{ zIndex: 100 }}
      />

      <div className="relative max-w-4xl w-full z-[101] pointer-events-none hero-text-wrap">
        {/* FIXED: Pre-hiding the element from frame zero with opacity-0 and translate-y-[30px] to prevent FOUC */}
        <h1 className="text-white font-display hero-title opacity-0 translate-y-[30px]">
          {title}
        </h1>
      </div>
    </div>
  );
}