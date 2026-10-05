"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Slide {
  img: string;
  mobileImg?: string;
  label: string;
  desc: string;
  href: string;
}

const slides: Slide[] = [
  {
    img: "/pool-courtyard-bg.webp",
    mobileImg: "/pool-courtyard-bg-mobile.webp", // Mobile-specific image path
    label: "Residential Pool Construction",
    desc: "Whether you’re creating a peaceful backyard retreat or a space made for entertaining, we bring your vision to life with tailored design, expert craftsmanship, and a clear process from start to finish.",
    href: "/services/residential-pools-construction",
  },
  {
    img: "/terrace2-bg.webp",
    mobileImg: "/terrace2-bg-mobile.webp", // Mobile-specific image path
    label: "Pool Equipment & Installation",
    desc: "From pumps and filters to heating systems and automation, we supply and install the latest pool equipment to keep your pool running smoothly.",
    href: "/services/pool-equipment-and-installation",
  },
  {
    img: "/terrace-bg.webp",
    mobileImg: "/terrace-bg-mobile.webp", // Mobile-specific image path
    label: "Commercial Pool Construction",
    desc: "We design and build large-scale pools for hotels, resorts, apartment complexes, and public facilities, delivering premium quality and durability.",
    href: "/services/commercial-pool-construction",
  },
];

type SectionTwoProps = {
  isActive: boolean;
  activeSlideIndex: number;
  onSelectSlide?: (index: number) => void;
};

const CUBIC_EASE = [0.65, 0, 0.35, 1];

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

export default function SectionTwo({
  isActive,
  activeSlideIndex,
  onSelectSlide,
}: SectionTwoProps) {
  const [direction, setDirection] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const prevIndexRef = useRef(activeSlideIndex);

  // Track viewport size to determine if mobile device (< 768px)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (activeSlideIndex !== prevIndexRef.current) {
      setDirection(activeSlideIndex > prevIndexRef.current ? 1 : -1);
      prevIndexRef.current = activeSlideIndex;
    }
  }, [activeSlideIndex]);

  const activeSlide = slides[activeSlideIndex] || slides[0];

  // Fallback to activeSlide.img if no mobileImg is specified
  const currentImageSrc =
    isMobile && activeSlide.mobileImg ? activeSlide.mobileImg : activeSlide.img;

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#19211C]">
      {/* ── 1. PARALLAX SLIDE BACKGROUNDS ── */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={activeSlideIndex}
          custom={direction}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0 w-full h-full overflow-hidden will-change-transform"
        >
          <motion.div
            custom={direction}
            variants={imageVariants}
            className="absolute inset-0 w-full h-full overflow-hidden will-change-transform"
          >
            <img
              src={currentImageSrc}
              alt={activeSlide.label}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div
              className="hidden md:block absolute inset-0 z-[2] pointer-events-none"
              style={{
                background:
                  "linear-gradient(2.13deg, #19211C 3.01%, rgba(21, 40, 31, 0) 59.11%)",
              }}
            />
            <div className="block md:hidden absolute inset-0 z-[2] pointer-events-none bg-gradient-to-t from-[#19211C]/95 via-[#19211C]/40 to-transparent" />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* ── 2. STAGGERED TEXT CONTENT ── */}
      <div className="absolute bottom-[10%] left-[5%] md:left-[8%] right-[5%] z-30 pointer-events-none max-w-7xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlideIndex}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-start gap-4 md:gap-6 lg:gap-8"
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

            {/* Description Bar & Right-aligned Button */}
            <div className="w-full flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="flex flex-row items-stretch gap-4 md:gap-6">
                {/* Active Indicator Bars */}
                <div className="flex flex-col gap-[4px] py-1 justify-center pointer-events-auto">
                  {slides.map((_, barIdx) => (
                    <div
                      key={barIdx}
                      onClick={() => onSelectSlide?.(barIdx)}
                      className={`w-[2px] cursor-pointer transition-all duration-500 ease-out ${
                        activeSlideIndex === barIdx
                          ? "bg-white h-5 opacity-100"
                          : "bg-white/30 h-3 opacity-40 hover:opacity-75"
                      }`}
                    />
                  ))}
                </div>

                {/* Description */}
                <div className="flex-1 overflow-hidden py-1">
                  <motion.p
                    custom={0.1}
                    variants={textLineVariants}
                    className="font-body text-[#F4EEDF] text-[13px] md:text-[16px] leading-relaxed max-w-[420px]"
                  >
                    {activeSlide.desc}
                  </motion.p>
                </div>
              </div>

              {/* Bottom-Right Link */}
              <div className="overflow-hidden py-1 self-start sm:self-end pointer-events-auto">
                <motion.div custom={0.2} variants={textLineVariants}>
                  <Link
                    href={activeSlide.href}
                    className="group btn-underline font-body text-[#F4EEDF]"
                  >
                    LEARN MORE
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}