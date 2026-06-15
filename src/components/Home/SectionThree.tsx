"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import gsap from "gsap";

const slides = [
  {
    img: "/pool-renovation.webp",
    label: "Concrete Pool Renovation",
    desc: "Restore and modernise your pool with high-quality finishes and functional upgrades for a fresh, stylish, and long-lasting look.",
    tab: "Concrete",
  },
  {
    img: "/hero.webp",
    label: "Pool Equipment & Installation",
    desc: "We provide and install premium pool pumps, filters, heating systems, and automation solutions.",
    tab: "Equipment",
  },
  {
    img: "/pool-new.webp",
    label: "New Pool Construction",
    desc: "From concept to completion, we build bespoke pools tailored to your space, lifestyle, and vision.",
    tab: "New Pool",
  },
];

const CLIP_DURATION = 1.0;
const TEXT_DURATION = 0.7;

function animateTextIn(selector: string) {
  document.querySelectorAll(selector).forEach((el) => {
    const inners = Array.from(
      el.querySelectorAll(":scope > .s3-line-wrap > .s3-line-inner")
    ) as HTMLElement[];
    inners.forEach((inner, idx) => {
      gsap.killTweensOf(inner);
      gsap.fromTo(
        inner,
        { y: 10, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: TEXT_DURATION,
          ease: "elastic.out(1, 0.5)",
          delay: idx * 0.08,
        }
      );
    });
  });
}

function animateTextOut(selector: string) {
  document.querySelectorAll(selector).forEach((el) => {
    const inners = Array.from(
      el.querySelectorAll(":scope > .s3-line-wrap > .s3-line-inner")
    ) as HTMLElement[];
    inners.forEach((inner, idx) => {
      gsap.killTweensOf(inner);
      gsap.to(inner, {
        y: -10,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        delay: idx * 0.03,
      });
    });
  });
}

export default function SectionThree() {
  const currentRef = useRef<number>(0);
  const [current, setCurrent] = useState(0);
  const animating = useRef<boolean>(false);

  // FIX: On mount, register all line-inners with GSAP so the first click
  // has a clean known state. Slide 0 inners = visible, all others = hidden.
  useEffect(() => {
    slides.forEach((_, i) => {
      document
        .querySelectorAll(`.s3-text-${i + 1} > .s3-line-wrap > .s3-line-inner`)
        .forEach((el) => {
          gsap.set(el, i === 0 ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 });
        });
    });
  }, []);

  const goTo = useCallback((next: number, direction: "next" | "prev") => {
    const prev = currentRef.current;
    if (animating.current || next === prev) return;
    animating.current = true;

    currentRef.current = next;
    setCurrent(next);

    const incomingClipStart =
      direction === "next" ? "inset(0 100% 0 0)" : "inset(0 0% 0 100%)";
    const incomingClipEnd = "inset(0 0% 0 0%)";

    gsap.set(`.s3-bg-${next + 1}`, {
      clipPath: incomingClipStart,
      zIndex: 2,
    });
    gsap.set(`.s3-bg-${prev + 1}`, {
      clipPath: "inset(0 0% 0 0)",
      zIndex: 1,
    });

    gsap.to(`.s3-bg-${next + 1}`, {
      clipPath: incomingClipEnd,
      duration: CLIP_DURATION,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set(`.s3-bg-${next + 1}`, { zIndex: 1 });
        gsap.set(`.s3-bg-${prev + 1}`, {
          zIndex: 1,
          clipPath: "inset(0 100% 0 0)",
        });
      },
    });

    // FIX: Snap outgoing inners to fully visible before animating them out,
    // so the out-tween always starts from a known clean state.
    document
      .querySelectorAll(`.s3-text-${prev + 1} > .s3-line-wrap > .s3-line-inner`)
      .forEach((el) => {
        gsap.killTweensOf(el);
        gsap.set(el, { y: 0, opacity: 1 });
      });
    animateTextOut(`.s3-text-${prev + 1}`);

    // FIX: Snap incoming inners to fully hidden before animating them in,
    // so they never bleed through while outgoing is still animating out.
    gsap.set(`.s3-text-${next + 1}`, { opacity: 1 });
    document
      .querySelectorAll(`.s3-text-${next + 1} > .s3-line-wrap > .s3-line-inner`)
      .forEach((el) => {
        gsap.killTweensOf(el);
        gsap.set(el, { y: 10, opacity: 0 });
      });

    // FIX: Delay incoming until outgoing is fully gone (0.2s + ~0.06s stagger = ~0.28s).
    gsap.delayedCall(0.32, () => animateTextIn(`.s3-text-${next + 1}`));

    gsap.to(`.s3-bar-${prev + 1}`, { background: "rgba(244,238,223,0.3)", duration: 0.3 });
    gsap.to(`.s3-bar-${next + 1}`, { background: "#F4EEDF", duration: 0.3 });

    gsap.delayedCall(CLIP_DURATION + 0.15, () => {
      animating.current = false;
    });
  }, []);

  const handlePrev = () => {
    goTo((currentRef.current - 1 + slides.length) % slides.length, "prev");
  };

  const handleNext = () => {
    goTo((currentRef.current + 1) % slides.length, "next");
  };

  const handleTab = (idx: number) => {
    if (idx === currentRef.current) return;
    const direction = idx > currentRef.current ? "next" : "prev";
    goTo(idx, direction);
  };

  return (
    <>
      {/* ── DESKTOP LAYOUT (unchanged) ── */}
      <section
        className="hidden md:block"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          zIndex: 30,
          pointerEvents: "auto",
        }}
      >
        {/* Background images */}
        {slides.map((slide, i) => (
          <img
            key={i}
            className={`s3-bg s3-bg-${i + 1}`}
            src={slide.img}
            alt=""
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 1,
              zIndex: 1,
              clipPath: i === 0 ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
            }}
          />
        ))}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(2.13deg, #19211C 3.01%, rgba(21, 40, 31, 0) 59.11%)",
            zIndex: 2,
          }}
        />

        {/* Bottom Content */}
        <div
          className="section-continer"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          {/* Left Content */}
          <div style={{ display: "flex", alignItems: "center", gap: 44, flex: 1 }}>
            {/* Indicator Bars */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                alignSelf: "stretch",
                justifyContent: "center",
                marginTop: "62px",
              }}
            >
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`s3-bar s3-bar-${i + 1}`}
                  style={{
                    width: 2,
                    height: 24,
                    background: i === 0 ? "#F4EEDF" : "rgba(244,238,223,0.3)",
                  }}
                />
              ))}
            </div>

            {/* Text Block */}
            <div style={{ position: "relative", flex: 1 }}>
              {slides.map((slide, i) => (
                <div
                  key={i}
                  className={`s3-text s3-text-${i + 1}`}
                  style={{
                    position: i === 0 ? "relative" : "absolute",
                    top: 0,
                    left: 0,
                    opacity: i === 0 ? 1 : 0,
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                  }}
                >
                  <div className="s3-line-wrap" style={{ overflow: "hidden" }}>
                    <div className="s3-line-inner">
                      <span className="font-body text-[14px] text-[#F4EEDF] block !mb-2">
                        ({i + 1})
                      </span>
                    </div>
                  </div>
                  <div className="s3-line-wrap" style={{ overflow: "hidden" }}>
                    <div className="s3-line-inner">
                      <h2 className="font-display text-[#F4EEDF]">{slide.label}</h2>
                    </div>
                  </div>
                  <div className="s3-line-wrap" style={{ overflow: "hidden" }}>
                    <div className="s3-line-inner">
                      <p className="!mt-6 max-w-[340px] text-[#F4EEDF]">{slide.desc}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Prev / Next */}
              <div className="!mt-10 flex items-center gap-20">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="group font-body cursor-pointer text-[14px] text-[#F4EEDF] flex items-center gap-2 transition-opacity duration-200 hover:opacity-70"
                >
                  <img
                    src="/arrow-right.svg"
                    alt="Previous"
                    style={{ width: 16, height: 16, transform: "rotate(180deg)" }}
                  />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="group font-body cursor-pointer text-[14px] text-[#F4EEDF] flex items-center gap-2 transition-opacity duration-200 hover:opacity-70"
                >
                  <span>Next</span>
                  <img
                    src="/arrow-right.svg"
                    alt="Next"
                    style={{ width: 16, height: 16 }}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Learn More */}
          <a
            href="/services"
            style={{
              position: "relative",
              display: "inline-block",
              width: "fit-content",
              paddingBottom: 8,
              fontSize: 14,
              fontWeight: 500,
              textTransform: "uppercase",
              color: "#F4EEDF",
              textDecoration: "none",
              flexShrink: 0,
              marginLeft: 40,
            }}
            className="group transition-opacity duration-200 hover:opacity-70 font-body"
          >
            LEARN MORE
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
      </section>

      {/* ── MOBILE LAYOUT ── */}
      <section
        className="flex md:hidden flex-col section-continer"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          zIndex: 30,
          pointerEvents: "auto",
          backgroundImage: "url('/services.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Image container — max 65% of screen height, shrinks to fit content below */}
        <div
          style={{
            position: "relative",
            width: "100%",
            flex: "1 1 62%",
            maxHeight: "62%",
            overflow: "hidden",
            border: "none",
            outline: "none",
            boxShadow: "none",
          }}
        >
          {/* Background images */}
          {slides.map((slide, i) => (
            <img
              key={i}
              className={`s3-bg s3-bg-${i + 1}`}
              src={slide.img}
              alt=""
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                zIndex: 1,
                clipPath: i === 0 ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
              }}
            />
          ))}

          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              background: "linear-gradient(2.13deg, #19211C 6.01%, rgba(21,40,31,0) 59.11%)",
              pointerEvents: "none",
            }}
          />

          {/* Tab buttons — inside image, bottom */}
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              right: 20,
              zIndex: 3,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 44,
            }}
          >
            {slides.map((slide, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleTab(i)}
                className="font-body text-left"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  paddingBottom: 6,
                  cursor: "pointer",
                  fontSize: 14,
                  flex: 1,
                  textAlign: "left",
                  color: current === i ? "#F4EEDF" : "rgba(244,238,223,0.45)",
                  borderBottom: current === i
                    ? "1.5px solid #F4EEDF"
                    : "1.5px solid rgba(244,238,223,0.45)",
                  transition: "color 0.25s, border-color 0.25s",
                  whiteSpace: "nowrap",
                }}
              >
                {slide.tab}
              </button>
            ))}
          </div>
        </div>

        {/* Text content — fills remaining height below image */}
        <div
          style={{
            flex: "0 0 auto",
            position: "relative",
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`s3-text s3-text-${i + 1}`}
              style={{
                position: i === 0 ? "relative" : "absolute",
                top: 0,
                left: "10px",
                right: 20,
                paddingTop: 28,
                paddingBottom: 28,
                opacity: i === 0 ? 1 : 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Title */}
              <div className="s3-line-wrap" style={{ overflow: "hidden" }}>
                <div className="s3-line-inner">
                  <h2 className="font-display text-[#F4EEDF]">
                    {slide.label}
                  </h2>
                </div>
              </div>

              {/* Description */}
              <div className="s3-line-wrap" style={{ overflow: "hidden", marginTop: 16 }}>
                <div className="s3-line-inner">
                  <p
                    className="font-body text-[#F4EEDF]"
                    style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}
                  >
                    {slide.desc}
                  </p>
                </div>
              </div>

              {/* Learn More */}
              <div className="s3-line-wrap" style={{ overflow: "hidden", marginTop: 24 }}>
                <div className="s3-line-inner">
                  <a
                    href="/services"
                    className="font-body"
                    style={{
                      position: "relative",
                      display: "inline-block",
                      paddingBottom: 10,
                      fontSize: 14,
                      fontWeight: 500,
                      textTransform: "uppercase",
                      color: "#F4EEDF",
                      textDecoration: "none",
                    }}
                  >
                    LEARN MORE
                    <span
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: 1,
                        background: "#F4EEDF",
                      }}
                    />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}