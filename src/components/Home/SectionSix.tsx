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

// ─── Mobile prev/next layout ──────────────────────────────────────────────────
function SectionSixMobile() {
  const [active, setActive] = useState(0);
  const bgRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const h2Refs   = useRef<(HTMLHeadingElement | null)[]>([]);
  const numRefs  = useRef<(HTMLSpanElement | null)[]>([]);
  const descRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const prevRef  = useRef(0);

  useEffect(() => {
    PROJECTS.forEach((_, i) => {
      gsap.set(bgRefs.current[i], { opacity: i === 0 ? 1 : 0 });
      if (i !== 0) {
        gsap.set(
          [h2Refs.current[i], numRefs.current[i], descRefs.current[i]],
          { opacity: 0, y: 10 }
        );
      }
    });
  }, []);

  function go(idx: number) {
    if (idx === active) return;
    const prev = prevRef.current;

    gsap.to(bgRefs.current[prev], { opacity: 0, duration: 0.6, ease: "power2.inOut" });
    gsap.to(bgRefs.current[idx],  { opacity: 1, duration: 0.7, ease: "power2.inOut" });

    gsap.to(
      [h2Refs.current[prev], numRefs.current[prev], descRefs.current[prev]],
      { opacity: 0, y: -8, duration: 0.25, ease: "power2.in", stagger: 0.04 }
    );
    gsap.fromTo(
      [h2Refs.current[idx], numRefs.current[idx], descRefs.current[idx]],
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", delay: 0.2, stagger: 0.07 }
    );

    prevRef.current = idx;
    setActive(idx);
  }

  function handlePrev() { go((active - 1 + PROJECTS.length) % PROJECTS.length); }
  function handleNext() { go((active + 1) % PROJECTS.length); }

  return (
    <section className="!relative !w-full !overflow-hidden section-six-wrapper !h-[100svh] !pointer-events-auto">

      {/* Backgrounds */}
      {PROJECTS.map((p, i) => (
        <div
          key={p.id}
          ref={(el) => { bgRefs.current[i] = el; }}
          className="!absolute !inset-0 !bg-cover !bg-center !will-change-[opacity]"
          style={{
            backgroundImage: `url('${p.image}')`,
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
          }}
        />
      ))}

      {/* Gradient overlay */}
      <div
        className="!absolute !inset-0 !z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.60) 45%, rgba(0,0,0,0.72) 100%)",
          transform: "translateZ(0)",
        }}
      />

      {/* Content */}
      <div className="!relative !z-[2] !h-full !flex !flex-col !justify-end section-continer">

        {/* Number + Title */}
        <div className="!mb-[30px]">
          <div className="!relative !h-7">
            {PROJECTS.map((p, i) => (
              <span
                key={p.id}
                ref={(el) => { numRefs.current[i] = el; }}
                className="font-body !absolute !top-0 !left-0 !text-[#F4EEDF] !text-[14px] !font-light !tracking-[0.04em] !pointer-events-none"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                ({i + 1})
              </span>
            ))}
          </div>

          <div className="!relative !h-[72px]">
            {PROJECTS.map((p, i) => (
              <h2
                key={p.id}
                ref={(el) => { h2Refs.current[i] = el; }}
                className="!absolute !top-0 !left-0 !m-0 !text-[#F4EEDF] !font-thin !max-w-[66%] !pointer-events-none"
                style={{
                  fontFamily: "var(--font-display, inherit)",
                  opacity: i === 0 ? 1 : 0,
                }}
              >
                {p.label}
              </h2>
            ))}
          </div>
        </div>

        {/* Glass card */}
        <div
          className="!self-end !w-[72%]  md:!w-[52%] !will-change-transform !mt-5 !px-[25px] !pb-[25px] !pt-[40px]"
          style={{
            backdropFilter: "blur(42px)",
            WebkitBackdropFilter: "blur(42px)",
            background:
              "radial-gradient(100% 100% at 0% 0%, rgba(25,33,28,0.72) 0%, rgba(25,33,28,0.32) 100%)",
            boxShadow: "-5px -5px 25px rgba(255,255,255,0.02) inset",
            transform: "translateZ(0)",
          }}
        >
          {/* Description */}
          <div className="!relative !min-h-[100px]">
            {PROJECTS.map((p, i) => (
              <p
                key={p.id}
                ref={(el) => { descRefs.current[i] = el; }}
                className="font-body !absolute !top-0 !left-0 !text-[#F4EEDF] !text-[14px] !font-normal !leading-[1.6] !m-0"
                style={{
                  opacity: i === 0 ? 1 : 0,
                  pointerEvents: i === active ? "auto" : "none",
                }}
              >
                {p.description}
              </p>
            ))}
          </div>

          {/* Prev / Next */}
          <div className="!flex !items-center !justify-between !mt-[54px]">
            <button
              type="button"
              onClick={handlePrev}
              className="group font-body !cursor-pointer !text-[14px] !text-[#F4EEDF] !flex !items-center !gap-2 !transition-opacity !duration-200 hover:!opacity-70 !bg-transparent !border-none !p-0"
            >
              <img src="/arrow-right.svg" alt="Previous" className="!w-4 !h-4 !rotate-180" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="group font-body !cursor-pointer !text-[14px] !text-[#F4EEDF] !flex !items-center !gap-2 !transition-opacity !duration-200 hover:!opacity-70 !bg-transparent !border-none !p-0"
            >
              <span>Next</span>
              <img src="/arrow-right.svg" alt="Next" className="!w-4 !h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Desktop tab-bar layout (original) ───────────────────────────────────────
function SectionSixDesktop() {
  const [active, setActive]  = useState(0);
  const bgRefs       = useRef<(HTMLDivElement | null)[]>([]);
  const btnRefs      = useRef<(HTMLButtonElement | null)[]>([]);
  const h2Refs       = useRef<(HTMLHeadingElement | null)[]>([]);
  const descRefs     = useRef<(HTMLParagraphElement | null)[]>([]);
  const prevRef      = useRef(0);
  const tabRowRef    = useRef<HTMLDivElement>(null);
  const activeBarRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    // Double RAF: first frame triggers layout, second reads correct DOMRects
    let raf1: number, raf2: number;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        measureAllBars();
        const m = barMetricsCache.current[0];
        if (m && activeBarRef.current) {
          // Use setProperty with "important" so no stylesheet can override GSAP
          activeBarRef.current.style.setProperty("left",  `${m.left}px`,  "important");
          activeBarRef.current.style.setProperty("width", `${m.width}px`, "important");
        }
      });
    });

    const onResize = () => {
      measureAllBars();
      const m = barMetricsCache.current[active];
      if (m && activeBarRef.current) {
        activeBarRef.current.style.setProperty("left",  `${m.left}px`,  "important");
        activeBarRef.current.style.setProperty("width", `${m.width}px`, "important");
      }
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.removeEventListener("resize", onResize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    PROJECTS.forEach((_, i) => {
      gsap.set(bgRefs.current[i], { opacity: i === 0 ? 1 : 0 });
      if (i !== 0) {
        gsap.set([h2Refs.current[i], descRefs.current[i]], { opacity: 0, y: 10 });
      }
    });
  }, []);

  function handleSelect(idx: number) {
    if (idx === active) return;
    const prev = prevRef.current;

    gsap.to(bgRefs.current[prev], { opacity: 0, duration: 0.6, ease: "power2.inOut" });
    gsap.to(bgRefs.current[idx],  { opacity: 1, duration: 0.7, ease: "power2.inOut" });

    const m = barMetricsCache.current[idx];
    if (m && activeBarRef.current) {
      // Animate via GSAP but seed the starting values with setProperty so they can't be overridden
      gsap.to(activeBarRef.current, {
        left: m.left,
        width: m.width,
        duration: 0.4,
        ease: "power2.inOut",
        onUpdate() {
          const el = activeBarRef.current;
          if (!el) return;
          el.style.setProperty("left",  el.style.left,  "important");
          el.style.setProperty("width", el.style.width, "important");
        },
      });
    }

    gsap.to(
      [h2Refs.current[prev], descRefs.current[prev]],
      { opacity: 0, y: -8, duration: 0.25, ease: "power2.in", stagger: 0.04 }
    );
    gsap.fromTo(
      [h2Refs.current[idx], descRefs.current[idx]],
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", delay: 0.2, stagger: 0.07 }
    );

    prevRef.current = idx;
    setActive(idx);
  }

  return (
    <section className="!relative !w-full !h-screen !overflow-hidden section-six-wrapper !pointer-events-auto">

      {/* Backgrounds */}
      {PROJECTS.map((p, i) => (
        <div
          key={p.id}
          ref={(el) => { bgRefs.current[i] = el; }}
          className="!absolute !inset-0 !bg-cover !bg-center !will-change-[opacity]"
          style={{
            backgroundImage: `url('${p.image}')`,
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
          }}
        />
      ))}

      {/* Gradient overlay */}
      <div
        className="!absolute !inset-0 !z-[1]"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0.64) 100%)",
          transform: "translateZ(0)",
        }}
      />

      {/* Content */}
      <div className="section-continer !relative !z-[2] !h-full !flex !flex-col !justify-center !pb-40 !gap-6">
        <div className="!relative !h-20">
          {PROJECTS.map((p, i) => (
            <h2
              key={p.id}
              ref={(el) => { h2Refs.current[i] = el; }}
              className="!absolute !top-0 !left-0 !m-0 !text-[#F4EEDF] !font-thin !pointer-events-none"
              style={{
                fontFamily: "var(--font-display, inherit)",
                opacity: i === 0 ? 1 : 0,
              }}
            >
              {p.label}
            </h2>
          ))}
        </div>

        {/* Glass card */}
        <div
          className="!w-full !max-w-[345px] !will-change-transform !p-[30px] !grid !grid-rows-[1fr_auto] !min-h-[160px]"
          style={{
            backdropFilter: "blur(42px)",
            WebkitBackdropFilter: "blur(42px)",
            background:
              "radial-gradient(100% 100% at 0% 0%, rgba(25, 33, 28, 0.64) 0%, rgba(25, 33, 28, 0.24) 100%)",
            boxShadow: "-5px -5px 25px rgba(255,255,255,0.02) inset",
            transform: "translateZ(0)",
          }}
        >
          <div className="!relative">
            {PROJECTS.map((p, i) => (
              <p
                key={p.id}
                ref={(el) => { descRefs.current[i] = el; }}
                className="font-body !top-0 !left-0 !text-[#F4EEDF] !text-[14px] !font-normal !m-0 !mb-[17px]"
                style={{
                  position: i === 0 ? "relative" : "absolute",
                  opacity: i === 0 ? 1 : 0,
                  pointerEvents: i === active ? "auto" : "none",
                }}
              >
                {p.description}
              </p>
            ))}
          </div>

          <a
            href="/projects"
            className="group !inline-block !w-fit !pb-2 !mt-6 !text-[14px] !font-medium !uppercase !text-[#F4EEDF] !no-underline !relative !transition-opacity !duration-200 hover:!opacity-70"
          >
            VIEW OUR PROJECTS
            <span className="!absolute !left-0 !right-0 !bottom-0 !h-px !bg-[#F4EEDF] !transition-transform !duration-200 !ease-in-out group-hover:!-translate-y-[2px]" />
          </a>
        </div>
      </div>

      {/* Bottom tab bar */}
      <div className="!absolute !bottom-20 !left-0 !right-0 !z-[3] !flex !justify-center">
        <div className="!relative">
          <div ref={tabRowRef} className="!flex !gap-8">
            {PROJECTS.map((p, i) => (
              <button
                key={p.id}
                ref={(el) => { btnRefs.current[i] = el; }}
                onClick={() => handleSelect(i)}
                className="!bg-transparent !border-none !cursor-pointer !px-0 !pt-0 !pb-5"
              >
                <span
                  className="!transition-[opacity,font-weight] !duration-300 font-body !text-[#F4EEDF] !text-[14px] !tracking-[0.04em] !whitespace-nowrap !block"
                  style={{
                    fontWeight: active === i ? 500 : 300,
                    opacity: active === i ? 1 : 0.55,
                  }}
                >
                  {p.label}
                </span>
              </button>
            ))}
          </div>

          {/* Track */}
          <div className="!absolute !bottom-0 !left-0 !right-0 !h-[3px] !bg-[rgba(244,238,223,0.24)]" />

          {/* Active indicator */}
          <div
            ref={activeBarRef}
            className="!absolute !bottom-0 !h-[3px] !bg-[#F4EEDF] !will-change-transform"
            style={{ width: 0, left: 0, transform: "translateZ(0)" }}
          />
        </div>
      </div>
    </section>
  );
}

// ─── Root — CSS breakpoint swap, no DOM bleed ─────────────────────────────────
export default function SectionSix() {
  return (
    <>
      <div className="!block lg:!hidden">
        <SectionSixMobile />
      </div>
      <div className="!hidden lg:!block">
        <SectionSixDesktop />
      </div>
    </>
  );
}