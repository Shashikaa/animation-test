"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";

const PROJECTS = [
  {
    id: "mernda",
    label: "Mernda Ave Bonbeach",
    tag: "Exceptional Pools,",
    tagline: "Built to Impress",
    description:
      "This custom residential oasis seamlessly blends sun-drenched outdoor living with sleek, modern concrete pool design.",
    image: "/mernda-ave-bonbeach.webp",
  },
  {
    id: "dennett",
    label: "Dennett st Carrum",
    tag: "A flawless blend",
    tagline: "of luxury",
    description:
      "This custom concrete pool transforms a classic Carrum backyard into a private, light-filled family sanctuary.",
    image: "/pool-renovation.webp",
  },
  {
    id: "kooyong",
    label: "Kooyong Rd Toorak",
    tag: "High-End",
    tagline: "Architectural Vibe",
    description:
      "This stunning Toorak build creates a sophisticated, resort-style escape tailored for elite inner-city living.",
    image: "/kooyong-rd-toorak.webp",
  },
  {
    id: "corner",
    label: "'The Como' Toorak",
    tag: "Showcase luxury",
    tagline: "at its finest",
    description:
      "'The Como' project in Toorak showcases our commitment to custom engineering, sophisticated integration, and master craftsmanship.",
    image: "/the-corner-toorak.webp",
  },
  {
    id: "murray",
    label: "Murray st Prahran",
    tag: "When master",
    tagline: "craftsmanship meets smart",
    description:
      "Our Murray St, Prahran project masterfully conquers a compact, inner-city space with a striking, custom-engineered concrete pool.",
    image: "/murray-st-prahran.webp",
  },
  {
    id: "rosy",
    label: "Rosy Rd Mooroolbark",
    tag: "Masterfully blends premium",
    tagline: "concrete craftsmanship",
    description:
      "Blending rugged outer-suburban terrain with premium concrete craftsmanship, it creates the ultimate resort-style backyard retreat.",
    image: "/rosy-rd-mooroolbark.webp",
  },
];

export default function SectionSix() {
  const [active, setActive]     = useState(0);
  const bgRefs       = useRef<(HTMLDivElement | null)[]>([]);
  const btnRefs      = useRef<(HTMLButtonElement | null)[]>([]);
  const tagRefs      = useRef<(HTMLParagraphElement | null)[]>([]);
  const taglineRefs  = useRef<(HTMLParagraphElement | null)[]>([]);
  const descRefs     = useRef<(HTMLParagraphElement | null)[]>([]);
  const prevRef      = useRef(0);
  const tabRowRef    = useRef<HTMLDivElement>(null);
  const activeBarRef = useRef<HTMLDivElement>(null);

  // FIX: Cache bar metrics in a ref so we never call getBoundingClientRect
  // during a scroll event. getBCR forces a synchronous layout flush —
  // calling it inside a resize listener that fires while Lenis is scrolling
  // caused layout thrash on every frame = the primary FPS drop on S6.
  const barMetricsCache = useRef<{ left: number; width: number }[]>([]);

  const measureAllBars = useCallback(() => {
    const row = tabRowRef.current;
    if (!row) return;
    const rowRect = row.getBoundingClientRect();
    barMetricsCache.current = btnRefs.current.map((btn) => {
      if (!btn) return { left: 0, width: 0 };
      const r = btn.getBoundingClientRect();
      return { left: r.left - rowRect.left, width: r.width };
    });
  }, []);

  // Initial measure + bar snap — runs once after mount
  useEffect(() => {
    // rAF ensures DOM has painted before we read layout
    const raf = requestAnimationFrame(() => {
      measureAllBars();
      const m = barMetricsCache.current[0];
      if (m && activeBarRef.current) {
        gsap.set(activeBarRef.current, { left: m.left, width: m.width });
      }
    });

    // FIX: Resize handler reads from cache, not live BCR.
    // We remeasure only on resize (rare), never during scroll.
    const onResize = () => {
      measureAllBars();
      const m = barMetricsCache.current[active];
      if (m && activeBarRef.current) {
        gsap.set(activeBarRef.current, { left: m.left, width: m.width });
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initial GSAP states
  useEffect(() => {
    PROJECTS.forEach((_, i) => {
      gsap.set(bgRefs.current[i], { opacity: i === 0 ? 1 : 0 });
      if (i !== 0) {
        gsap.set(
          [tagRefs.current[i], taglineRefs.current[i], descRefs.current[i]],
          { opacity: 0, y: 10 }
        );
      }
    });
  }, []);

  function handleSelect(idx: number) {
    if (idx === active) return;
    const prev = prevRef.current;

    gsap.to(bgRefs.current[prev], { opacity: 0, duration: 0.6, ease: "power2.inOut" });
    gsap.to(bgRefs.current[idx],  { opacity: 1, duration: 0.7, ease: "power2.inOut" });

    // FIX: Use cached metrics — no live BCR call during interaction
    const m = barMetricsCache.current[idx];
    if (m) gsap.to(activeBarRef.current, { left: m.left, width: m.width, duration: 0.4, ease: "power2.inOut" });

    gsap.to(
      [tagRefs.current[prev], taglineRefs.current[prev], descRefs.current[prev]],
      { opacity: 0, y: -8, duration: 0.25, ease: "power2.in", stagger: 0.04 }
    );
    gsap.fromTo(
      [tagRefs.current[idx], taglineRefs.current[idx], descRefs.current[idx]],
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", delay: 0.2, stagger: 0.07 }
    );

    prevRef.current = idx;
    setActive(idx);
  }

  return (
    <section
      className="relative w-full h-screen overflow-hidden section-six-wrapper"
      /*
       * FIX: section-six-wrapper class applies:
       *   will-change: transform + translateZ(0)
       * from globals.css — promotes this section to its own GPU layer
       * so entering/leaving the S5→S6→S7 boundaries doesn't cause a
       * full-page raster invalidation.
       */
    >

      {/* ── Backgrounds ── */}
      {PROJECTS.map((p, i) => (
        <div
          key={p.id}
          ref={(el) => { bgRefs.current[i] = el; }}
          /*
           * FIX: will-change-[opacity] replaced with explicit will-change
           * via inline style. Tailwind's will-change-[opacity] can generate
           * a non-standard property string on some build configs.
           * Also added translateZ(0) to ensure each bg is its own GPU layer —
           * without this, opacity transitions cause full-section repaints.
           */
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url('${p.image}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            willChange: "opacity",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
          }}
        />
      ))}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0.64) 100%)",
          // FIX: promote overlay to its own layer so it doesn't merge
          // with the background divs and force a combined repaint
          transform: "translateZ(0)",
        }}
      />

      {/* ── Content ── */}
      <div
        className="section-continer relative z-[2] h-full flex flex-col justify-center"
        style={{ paddingBottom: "160px" }}
      >
        {/* Glass card
            FIX: backdropFilter is expensive but unavoidable here for the
            design. Mitigate by:
            1. Adding will-change:transform so it gets its own compositor layer
            2. Adding translateZ(0) to prevent it merging with scroll layer
            3. NOT animating this element — static blur is fine, animated blur is not
        */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 455,
            minHeight: 270,
            backdropFilter: "blur(42px)",
            WebkitBackdropFilter: "blur(42px)",
            background:
              "radial-gradient(100% 100% at 0% 0%, rgba(25, 33, 28, 0.64) 0%, rgba(25, 33, 28, 0.24) 100%)",
            boxShadow: "-5px -5px 25px rgba(255,255,255,0.02) inset",
            willChange: "transform",
            transform: "translateZ(0)",
          }}
        >
          {PROJECTS.map((p, i) => (
            <div
              key={p.id}
              className="absolute inset-0 flex flex-col justify-center"
              style={{
                paddingLeft: 50,
                paddingRight: 80,
                paddingTop: 40,
                paddingBottom: 100,
                gap: 0,
                pointerEvents: i === active ? "auto" : "none",
              }}
            >
              <p
                ref={(el) => { tagRefs.current[i] = el; }}
                style={{
                  color: "#F4EEDF",
                  fontSize: "24px",
                  fontWeight: 400,
                  lineHeight: 1.2,
                  margin: 0,
                  fontFamily: "var(--font-display, inherit)",
                }}
              >
                {p.tag}
              </p>
              <p
                ref={(el) => { taglineRefs.current[i] = el; }}
                style={{
                  color: "#F4EEDF",
                  fontStyle: "italic",
                  fontSize: "24px",
                  fontWeight: 400,
                  lineHeight: 1.2,
                  margin: 0,
                  fontFamily: "var(--font-cormorant)",
                }}
              >
                {p.tagline}
              </p>
              <p
                className="font-body !mt-5"
                ref={(el) => { descRefs.current[i] = el; }}
                style={{
                  color: "#F4EEDF",
                  fontSize: 14,
                  fontWeight: 400,
                  lineHeight: 1.2,
                  margin: "4px 0 0",
                  fontFamily: "var(--font-body)",
                }}
              >
                {p.description}
              </p>
            </div>
          ))}

          <a
            href="/projects"
            style={{
              position: "absolute",
              bottom: 30,
              left: 50,
              display: "inline-block",
              width: "fit-content",
              paddingBottom: 8,
              fontSize: 14,
              fontWeight: 500,
              textTransform: "uppercase",
              color: "#F4EEDF",
              textDecoration: "none",
              zIndex: 10,
            }}
            className="group transition-opacity duration-200 hover:opacity-70"
          >
            VIEW OUR PROJECTS
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

      {/* ── Bottom tab bar ── */}
      <div className="absolute bottom-20 left-0 right-0 z-[3] flex justify-center">
        <div style={{ position: "relative" }}>
          <div ref={tabRowRef} style={{ display: "flex", columnGap: 32 }}>
            {PROJECTS.map((p, i) => (
              <button
                key={p.id}
                ref={(el) => { btnRefs.current[i] = el; }}
                onClick={() => handleSelect(i)}
                className="bg-transparent border-none cursor-pointer px-0"
                style={{ paddingTop: 0, paddingBottom: 20 }}
              >
                <span
                  className="transition-[opacity,font-weight] duration-300 font-body"
                  style={{
                    color: "#F4EEDF",
                    fontSize: 14,
                    fontWeight: active === i ? 500 : 300,
                    letterSpacing: "0.04em",
                    opacity: active === i ? 1 : 0.55,
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                >
                  {p.label}
                </span>
              </button>
            ))}
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "rgba(244,238,223,0.24)",
            }}
          />

          <div
            ref={activeBarRef}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: 3,
              width: 0,
              background: "#F4EEDF",
              willChange: "transform",
              transform: "translateZ(0)",
            }}
          />
        </div>
      </div>
    </section>
  );
}