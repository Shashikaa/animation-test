"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    img: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80",
    label: "Residential Pool Construction",
    desc: "Whether you're creating a peaceful backyard retreat or an entertainer’s dream, we bring your vision to life with tailored designs, expert craftsmanship, and a seamless building process from start to finish.",
  },
  {
    img: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80",
    label: "Pool Equipment & Installation",
    desc: "Upgrade and protect your pool with high-performance equipment and professional installation. From energy-efficient pumps and advanced filtration systems to smart automation, we ensure seamless setup and reliable performance for crystal-clear water.",
  },
  {
    img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
    label: "Commercial Pool Construction",
    desc: "We design and build large-scale pools for hotels, resorts, apartment complexes, and public facilities, delivering premium quality and durability.",
  },
]

type SectionTwoProps = {
  isActive: boolean;
};

// Hardware-accelerated cubic-bezier ease for fluid transitions
const CUBIC_EASE = [0.65, 0, 0.35, 1];

// Curtain reveal animation variants for slide containers
const slideVariants = {
  initial: (direction: number) => ({
    y: direction > 0 ? "100%" : "-100%",
    zIndex: 2,
  }),
  animate: {
    y: "0%",
    zIndex: 2,
    transition: { duration: 0.6, ease: CUBIC_EASE as any },
  },
  exit: (direction: number) => ({
    y: direction > 0 ? "-20%" : "20%",
    zIndex: 1,
    transition: { duration: 0.6, ease: CUBIC_EASE as any },
  }),
};

// Counter-parallax transition for inner image
const imageVariants = {
  initial: (direction: number) => ({
    y: direction > 0 ? "-100%" : "100%",
    scale: 1.08,
  }),
  animate: {
    y: "0%",
    scale: 1,
    transition: { duration: 0.6, ease: CUBIC_EASE as any },
  },
};

// Staggered line mask animation for text
const textLineVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: (delay: number) => ({
    y: "0%",
    opacity: 1,
    transition: {
      duration: 0.45,
      delay: 0.15 + delay,
      ease: [0.25, 1, 0.5, 1] as any,
    },
  }),
  exit: {
    y: "-50%",
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" as any },
  },
};

export default function SectionTwo({ isActive }: SectionTwoProps) {
  const [state, setState] = useState({ current: 0, direction: 1 });
  const currentRef = useRef(0);

  const goTo = useCallback((next: number) => {
    const prev = currentRef.current;
    if (next === prev || next < 0 || next >= slides.length) return;

    const direction = next > prev ? 1 : -1;
    currentRef.current = next;
    setState({ current: next, direction });
  }, []);

  // Maintain window trigger compatibility for parent scroll controllers
  useEffect(() => {
    (window as any)._sec2GoTo = (targetIdx: number) => {
      goTo(targetIdx);
    };
    return () => {
      delete (window as any)._sec2GoTo;
    };
  }, [goTo]);

  const activeSlide = slides[state.current];

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#19211C]">
      {/* ── 1. PARALLAX SLIDE BACKGROUNDS ── */}
      <AnimatePresence initial={false} custom={state.direction}>
        <motion.div
          key={state.current}
          custom={state.direction}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0 w-full h-full overflow-hidden will-change-transform"
        >
          <motion.div
            custom={state.direction}
            variants={imageVariants}
            className="absolute inset-0 w-full h-full overflow-hidden will-change-transform"
          >
            <img
              src={activeSlide.img}
              alt={activeSlide.label}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Desktop Gradient */}
            <div
              className="hidden md:block absolute inset-0 z-[2] pointer-events-none"
              style={{
                background:
                  "linear-gradient(2.13deg, #19211C 3.01%, rgba(21, 40, 31, 0) 59.11%)",
              }}
            />
            {/* Mobile Gradient */}
            <div className="block md:hidden absolute inset-0 z-[2] pointer-events-none bg-gradient-to-t from-[#19211C]/95 via-[#19211C]/40 to-transparent" />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* ── 2. STAGGERED TEXT CONTENT ── */}
      <div className="absolute bottom-[10%] left-[5%] md:left-[8%] right-[5%] z-30 pointer-events-none max-w-6xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.current}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-start gap-4 md:gap-8 lg:gap-12"
          >
            {/* Title with Masked Reveal */}
            <div className="overflow-hidden py-1">
              <motion.h2
                custom={0}
                variants={textLineVariants}
                className="font-display text-[#F4EEDF] text-3xl md:text-5xl lg:text-[70px] !leading-[1] font-light"
              >
                {activeSlide.label}
              </motion.h2>
            </div>

            <div className="flex flex-row items-stretch gap-4 md:gap-6">
              {/* Active Indicator Bars */}
              <div className="flex flex-col gap-[4px] py-1 justify-center pointer-events-auto">
                {slides.map((_, barIdx) => (
                  <div
                    key={barIdx}
                    onClick={() => goTo(barIdx)}
                    className={`w-[2px] cursor-pointer transition-all duration-500 ease-out ${
                      state.current === barIdx
                        ? "bg-white h-5 opacity-100"
                        : "bg-white/30 h-3 opacity-40 hover:opacity-75"
                    }`}
                  />
                ))}
              </div>

              {/* Description with Masked Reveal */}
              <div className="flex-1 overflow-hidden py-1">
                <motion.p
                  custom={0.1}
                  variants={textLineVariants}
                  className="font-body text-[#F4EEDF]/80 text-[13px] md:text-[16px] leading-relaxed max-w-[420px]"
                >
                  {activeSlide.desc}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}