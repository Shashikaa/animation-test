"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InfoSlide } from "../../app/projects/[slug]/data";

interface ProjectInfoSlideProps {
  slides: InfoSlide[];
  isActive?: boolean;
}

// Staggered text animation variants for title & description
const textContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" as any },
  },
};

const textItemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] as any },
  },
  exit: {
    y: -15,
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" as any },
  },
};

export default function ProjectInfoSlide({ slides }: ProjectInfoSlideProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const currentRef = useRef(0);

  const goTo = useCallback(
    (next: number) => {
      const prev = currentRef.current;
      if (next === prev || next < 0 || next >= slides.length) return;
      currentRef.current = next;
      setCurrentIdx(next);
    },
    [slides.length]
  );

  // Sync window hook with main page render loops (Desktop & Mobile)
  useEffect(() => {
    (window as any)._projectInfoGoTo = (targetIdx: number) => {
      goTo(targetIdx);
    };
    return () => {
      delete (window as any)._projectInfoGoTo;
    };
  }, [goTo]);

  if (!slides || slides.length === 0) return null;

  const activeSlide = slides[currentIdx];

  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden bg-[#131313] project-info-master z-[20] gpu-accelerated"
      style={{ contain: "paint" }}
    >
      <div className="w-full h-full flex flex-col lg:grid lg:grid-cols-2">
        {/* ── 1. TEXT COLUMN (Framer Motion Stagger Reveal) ── */}
        <div className="relative w-full h-[50vh] lg:h-full order-1 lg:order-2 bg-[#EFECE6] !p-6 md:!p-16 lg:!p-20 flex flex-col justify-center z-[60] text-[#131313]">
          <div className="relative w-full h-full flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIdx}
                variants={textContainerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="info-text-block absolute inset-0 flex flex-col justify-center gap-3 md:gap-8 pointer-events-auto"
              >
                <motion.h2
                  variants={textItemVariants}
                  className="info-anim-item text-[#242A27] font-display text-2xl sm:text-3xl md:text-5xl font-light leading-tight"
                >
                  {activeSlide.title}
                </motion.h2>

                <motion.div
                  variants={textItemVariants}
                  className="info-anim-item max-w-md pt-1 md:pt-0 pb-0 md:pb-12"
                >
                  <p className="text-xs sm:text-sm md:text-base leading-relaxed text-[#242A27] font-normal">
                    {activeSlide.description}
                  </p>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── 2. IMAGE COLUMN (Continuous Layer Stacking - No Empty Flashes) ── */}
        <div className="relative w-full h-[50vh] lg:h-full order-2 lg:order-1 overflow-hidden bg-[#1e1e1e]">
          {slides.map((slide, index) => (
            <div
              key={`info-img-layer-${index}`}
              className={`info-img-layer info-img-layer-${index} absolute inset-0 w-full h-full overflow-hidden gpu-accelerated`}
              style={{
                zIndex: index + 10,
                willChange: "clip-path",
                // Base layout state: Slide 0 is fully visible, subsequent slides wait for main scroll engine to peel clipPath
                clipPath:
                  index === 0
                    ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
                    : "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
              }}
            >
              <div
                className="info-image-inner w-full h-full bg-cover bg-center gpu-accelerated"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  transform: index === 0 ? "scale(1)" : "scale(1.25)",
                  transformOrigin: "center center",
                  willChange: "transform",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}