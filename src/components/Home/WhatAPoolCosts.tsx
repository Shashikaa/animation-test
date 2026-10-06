"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";

// l / w are pool length and width in metres. spa is 0 or 1 (1 = spa attached,
// infinity edge shown). The plan drawing morphs between them.
const BANDS = [
  {
    label: "Standard",
    range: "$80k – $120k",
    spec: "8 x 4m, fully tiled",
    desc: "A full residential build with quality finishes and in-house construction.",
    l: 8,
    w: 4,
    spa: 0,
  },
  {
    label: "Expanded",
    range: "$120k – $160k",
    spec: "10 x 5m or larger footprints",
    desc: "More water volume, feature finishes and upgraded plant packages.",
    l: 10,
    w: 5,
    spa: 0,
  },
  {
    label: "Premium",
    range: "$160k+",
    spec: "Spa, infinity edge or custom shape",
    desc: "Architectural forms, imported tiles, automated covers and resort-level spec.",
    l: 11,
    w: 5,
    spa: 1,
  },
];

const CREAM = "#F4EEDF";
const WATER = "#8FD0C8";

const ICONS: Record<string, ReactNode> = {
  volume: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  finish: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M12 3v18M3 12h18" />
    </>
  ),
  access: (
    <>
      <path d="M2 7h11v9H2zM13 10h4l3 3v3h-7" />
      <circle cx="6" cy="17.5" r="1.8" />
      <circle cx="16.5" cy="17.5" r="1.8" />
    </>
  ),
  type: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 12q3-2.5 6 0t6 0t6 0" />
    </>
  ),
  landscape: <path d="M5 19c0-8 5-13 14-14 0 9-5 14-14 14zM5 19l8-8" />,
  automation: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
};

const BASIS = [
  { icon: "volume", label: "Water volume and size" },
  { icon: "finish", label: "Finish and tile system" },
  { icon: "access", label: "Site access and logistics" },
  { icon: "type", label: "Pool type and structure" },
  { icon: "landscape", label: "Landscaping and decking" },
  { icon: "automation", label: "Plant and automation packages" },
];

// ─── To-scale plan view of the pool ──────────────────────────────────────────
// `compact` (phones) draws the pool larger inside the viewBox and bumps the
// label sizes, because the whole 600-unit-wide drawing is shrunk to ~330px.
function PoolPlan({ l, w, spa, compact }: { l: number; w: number; spa: number; compact: boolean }) {
  // Unique ids: this component is rendered twice (phone slot + desktop slot),
  // and url(#id) breaks if the first match sits inside a display:none svg.
  const uid = useId().replace(/:/g, "");
  const tileId = `wpc-tile-${uid}`;
  const waterId = `wpc-water-${uid}`;

  const S = compact ? 36 : 30; // svg units per metre
  const W = l * S;
  const H = w * S;
  const R = 40; // spa radius
  const GAP = 10;
  const total = W + spa * (GAP + 2 * R);
  const x = (600 - total) / 2;
  const y = (300 - H) / 2 + 8;
  const fsLabel = compact ? 22 : 14;
  const fsSmall = compact ? 19 : 13;
  const dim = { stroke: CREAM, strokeWidth: compact ? 1.5 : 1, opacity: 0.7 };

  return (
    <svg
      viewBox="0 0 600 300"
      role="img"
      aria-label={`Pool plan, ${l.toFixed(1)} metres by ${w.toFixed(1)} metres`}
      style={{ display: "block", width: "100%", height: "auto" }}
    >
      <defs>
        <pattern id={tileId} width="15" height="15" patternUnits="userSpaceOnUse">
          <path d="M15 0H0V15" fill="none" stroke={CREAM} strokeOpacity="0.16" strokeWidth="0.7" />
        </pattern>
        <linearGradient id={waterId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={WATER} stopOpacity="0.6" />
          <stop offset="1" stopColor={WATER} stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* coping */}
      <rect x={x - 6} y={y - 6} width={W + 12} height={H + 12} rx="6" fill="none" stroke={CREAM} strokeOpacity="0.3" strokeWidth="1" />
      {/* water + tile grid */}
      <rect x={x} y={y} width={W} height={H} rx="3" fill={`url(#${waterId})`} stroke={CREAM} strokeWidth="1.8" />
      <rect x={x} y={y} width={W} height={H} rx="3" fill={`url(#${tileId})`} />

      {/* infinity edge (premium) */}
      <line x1={x} x2={x + W} y1={y + H} y2={y + H} stroke={WATER} strokeWidth="4" opacity={spa} />
      <text x={x + W / 2} y={y + H + (compact ? 28 : 24)} textAnchor="middle" fontSize={fsSmall} fill={WATER} opacity={spa}>
        Infinity edge
      </text>

      {/* spa (premium) */}
      <g opacity={spa}>
        <circle cx={x + W + GAP + R} cy={y + H / 2} r={R * spa} fill={`url(#${waterId})`} stroke={CREAM} strokeWidth="1.8" />
        <circle cx={x + W + GAP + R} cy={y + H / 2} r={R * spa} fill={`url(#${tileId})`} />
        <text x={x + W + GAP + R} y={y + H / 2 + 6} textAnchor="middle" fontSize={fsSmall} fill={CREAM}>
          Spa
        </text>
      </g>

      {/* length dimension */}
      <g {...dim}>
        <line x1={x} x2={x + W} y1={y - 20} y2={y - 20} />
        <line x1={x} x2={x} y1={y - 25} y2={y - 15} />
        <line x1={x + W} x2={x + W} y1={y - 25} y2={y - 15} />
      </g>
      <text x={x + W / 2} y={y - 28} textAnchor="middle" fontSize={fsLabel} fill={CREAM}>
        {l.toFixed(1)}m
      </text>

      {/* width dimension */}
      <g {...dim}>
        <line x1={x - 22} x2={x - 22} y1={y} y2={y + H} />
        <line x1={x - 27} x2={x - 17} y1={y} y2={y} />
        <line x1={x - 27} x2={x - 17} y1={y + H} y2={y + H} />
      </g>
      <text transform={`translate(${x - 32} ${y + H / 2}) rotate(-90)`} textAnchor="middle" fontSize={fsLabel} fill={CREAM}>
        {w.toFixed(1)}m
      </text>
    </svg>
  );
}

// All spacing is inline / in the <style> block on purpose: the site's global CSS
// resets margin and padding, which was overriding Tailwind's spacing classes here.
export default function WhatAPoolCosts() {
  const [active, setActive] = useState(0);
  const [shape, setShape] = useState({ l: BANDS[0].l, w: BANDS[0].w, spa: BANDS[0].spa });
  const [compact, setCompact] = useState(false);
  const proxy = useRef({ l: BANDS[0].l, w: BANDS[0].w, spa: BANDS[0].spa });

  function pick(i: number) {
    if (i === active) return;
    const b = BANDS[i];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.killTweensOf(proxy.current);
    gsap.to(proxy.current, {
      l: b.l,
      w: b.w,
      spa: b.spa,
      duration: reduced ? 0 : 0.9,
      ease: "power3.inOut",
      onUpdate: () => setShape({ ...proxy.current }),
    });
    setActive(i);
  }

  useEffect(() => {
    const p = proxy.current;
    return () => {
      gsap.killTweensOf(p);
    };
  }, []);

  // Phones: bigger drawing labels
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const band = BANDS[active];

  return (
    <section className="wpc-root relative w-full overflow-hidden bg-[#162D24]">
      <style>{`
        @keyframes wpc-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .wpc-rise { animation: wpc-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @media (prefers-reduced-motion: reduce) { .wpc-rise { animation: none; } }

        /* Below lg the section is at least one screen tall and grows with its
           content (the mobile home scrolls through it). From lg up it fills the
           pinned desktop frame exactly, as before. */
        .wpc-root { min-height: 100svh; }
        .wpc-wrap {
          display: flex;
          align-items: center;
          min-height: 100svh;
          padding-top: clamp(88px, 11vh, 116px);
          padding-bottom: clamp(32px, 6vh, 48px);
        }
        .wpc-bands-btn { min-height: 48px; }
        @media (min-width: 1024px) {
          .wpc-root { min-height: 0; height: 100%; }
          .wpc-wrap {
            height: 100%;
            min-height: 0;
            overflow: hidden;
            padding-top: clamp(96px, 11vh, 116px);
            padding-bottom: clamp(20px, 4vh, 40px);
          }
          .wpc-bands-btn { min-height: 0; }
        }
      `}</style>

      {/* Photo background */}
      <div className="absolute inset-0 z-[1] pointer-events-none" aria-hidden="true">
        <img src="/service3.webp" alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-[#162D24]/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#162D24] via-[#162D24]/30 to-transparent" />
      </div>

      <div className="wpc-wrap section-container relative z-[2]">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center w-full" style={{ gap: "clamp(24px, 6vw, 96px)" }}>
          {/* LEFT: heading, band picker, details (+ plan on phones) */}
          <div>
            <h2
              className="font-display text-[#F4EEDF] text-4xl md:text-[min(3.75rem,7vh)] font-light"
              style={{ margin: 0, marginBottom: 14, lineHeight: 1.05 }}
            >
              What a pool costs
            </h2>
            <p
              className="font-body text-[#F4EEDF]/75 text-base md:text-lg"
              style={{ margin: 0, marginBottom: "clamp(16px, 4vh, 36px)", lineHeight: 1.6, maxWidth: "44ch" }}
            >
              These bands help you check a budget. They aren&apos;t a quote. Send us your yard size
              and we&apos;ll confirm a number within a day.
            </p>

            {/* Band picker: large type, no boxes */}
            <div role="group" aria-label="Price bands" style={{ marginBottom: "clamp(12px, 3vh, 28px)" }}>
              {BANDS.map((b, i) => {
                const on = i === active;
                return (
                  <button
                    key={b.label}
                    type="button"
                    onClick={() => pick(i)}
                    aria-pressed={on}
                    className="wpc-bands-btn hover:!opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4EEDF]"
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      flexWrap: "wrap",
                      columnGap: 8,
                      width: "100%",
                      background: "none",
                      border: 0,
                      padding: "clamp(4px, 1vh, 10px) 0",
                      cursor: "pointer",
                      textAlign: "left",
                      opacity: on ? 1 : 0.42,
                      transition: "opacity 300ms",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: "clamp(18px, 4vw, 32px)",
                        height: 2,
                        marginRight: "clamp(8px, 2.5vw, 16px)",
                        flexShrink: 0,
                        alignSelf: "center",
                        background: WATER,
                        transformOrigin: "left",
                        transform: on ? "scaleX(1)" : "scaleX(0)",
                        transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                    />
                    <span
                      className="font-display text-[#F4EEDF] font-light"
                      style={{
                        fontSize: "clamp(1.6rem, min(7.2vw, 5.4vh), 3.4rem)",
                        lineHeight: 1.1,
                        flex: "1 1 auto",
                      }}
                    >
                      {b.label}
                    </span>
                    <span
                      className="font-body"
                      style={{
                        fontSize: "clamp(0.95rem, 2.3vh, 1.25rem)",
                        color: on ? WATER : CREAM,
                        transition: "color 300ms",
                        marginLeft: "auto",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {b.range}
                    </span>
                  </button>
                );
              })}
            </div>

            <div key={active} className="wpc-rise" style={{ minHeight: 84, marginBottom: "clamp(12px, 3vh, 28px)" }}>
              <p className="font-body text-[#F4EEDF] text-base md:text-lg" style={{ margin: 0, marginBottom: 6 }}>
                {band.spec}
              </p>
              <p
                className="font-body text-[#F4EEDF]/70 text-sm md:text-base"
                style={{ margin: 0, lineHeight: 1.55, maxWidth: "44ch" }}
              >
                {band.desc}
              </p>
            </div>

            {/* Phones / tablets: the plan sits right under the picker so you see it change.
                (On lg+ it lives in the right column instead.) */}
            <div className="lg:hidden" style={{ marginBottom: "clamp(8px, 2vh, 16px)" }}>
              <PoolPlan l={shape.l} w={shape.w} spa={shape.spa} compact={compact} />
            </div>
          </div>

          {/* RIGHT: pool plan (lg+) + what changes the number */}
          <div>
            <div className="hidden lg:block">
              <PoolPlan l={shape.l} w={shape.w} spa={shape.spa} compact={false} />
            </div>

            <p
              className="font-display text-[#F4EEDF] text-xl md:text-2xl font-light"
              style={{ margin: 0, marginTop: "clamp(0px, 2vh, 20px)", marginBottom: 12 }}
            >
              What changes the number
            </p>
            <ul
              className="grid grid-cols-2"
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                gap: "clamp(10px, 1.6vh, 12px) clamp(12px, 3vw, 28px)",
              }}
            >
              {BASIS.map((item) => (
                <li key={item.label} className="flex items-center" style={{ gap: 10 }}>
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke={WATER}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                    aria-hidden="true"
                  >
                    {ICONS[item.icon]}
                  </svg>
                  <span className="font-body text-[#F4EEDF]/85 text-[13px] md:text-[15px]" style={{ lineHeight: 1.3 }}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}