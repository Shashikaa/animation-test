"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

const slides = [
  {
    stat: "25+ Years",
    label: "Industry Experience",
    desc: "Decades of knowledge in pool design and construction.",
  },
  {
    stat: "100+",
    label: "Completed Projects",
    desc: "Stunning pools crafted for homes and businesses.",
  },
  {
    stat: "100%",
    label: "Client Satisfaction",
    desc: "Trusted for quality, service, and seamless execution.",
  },
];

type SectionFiveProps = {
  isActive?: boolean;
};

// Fast letter-by-letter wave motion variant
const letterVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 12, 
    rotateX: -40,
    filter: "blur(2px)" 
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    rotateX: 0,
    filter: "blur(0px)",
    transition: { 
      duration: 0.22, 
      ease: [0.16, 1, 0.3, 1] // Explicit tuple typed via Variants
    } 
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    filter: "blur(1px)",
    transition: { duration: 0.12, ease: "easeIn" } 
  },
};

// Controls fast stagger wave between letters inside each block
const blockVariants: Variants = {
  initial: {},
  animate: (customDelay: number) => ({
    transition: {
      staggerChildren: 0.008, // Ultra-fast stagger between characters
      delayChildren: customDelay,
    },
  }),
  exit: {
    transition: {
      staggerChildren: 0.004,
      staggerDirection: -1,
    },
  },
};

/**
 * Component that splits string into snappy wavy characters
 */
const FastWavyText = ({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) => {
  const letters = Array.from(text);

  return (
    <motion.span className={`inline-block overflow-hidden ${className}`} style={{ ...style, perspective: 800 }}>
      {letters.map((char, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          className="inline-block will-change-transform"
          style={{ transformOrigin: "0% 50%" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default function SectionFive({ isActive = true }: SectionFiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<number>(0);
  const [current, setCurrent] = useState(0);

  const goTo = useCallback((next: number) => {
    if (next === currentRef.current) return;
    currentRef.current = next;
    setCurrent(next);
  }, []);

  useEffect(() => {
    (window as any)._sec5GoTo = (targetIdx: number) => {
      goTo(targetIdx);
    };
    return () => {
      delete (window as any)._sec5GoTo;
    };
  }, [goTo]);

  const activeSlide = slides[current];

  return (
    <section ref={containerRef} className="relative w-full h-full overflow-hidden flex flex-col lg:grid lg:grid-cols-2 bg-[#F4EEDF]">
      
      {/* TOP / LEFT SIDE */}
      <div className="relative w-full h-[65svh] lg:h-full lg:min-h-screen overflow-hidden bg-[#19211C]">
        <div 
          className="s5-bg absolute -top-[0%] left-0 w-full h-[200%] bg-cover bg-center will-change-transform"
          style={{
            backgroundImage: `url('https://i.pinimg.com/1200x/c2/2a/07/c22a07cd8a4b2539fd215da26b807e80.jpg')`
          }}
        />        
        <div className="absolute inset-0 bg-black/40 pointer-events-none z-[1]" />
        
        <div className="absolute z-10 bottom-[30px] md:bottom-[60px] left-[24px] md:left-[65px] flex flex-col !gap-2 md:!gap-4 overflow-hidden">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl !font-[100] text-[#F4EEDF]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Decades of Expertise
          </h2>
          <p 
            className="text-sm sm:text-base md:text-lg text-[#F4EEDF]" 
            style={{ fontFamily: "var(--font-body)" }}
          >
            Unmatched Craftsmanship
          </p>
        </div>
      </div>

      {/* BOTTOM / RIGHT SIDE */}
      <div className="s5-right-panel relative w-full flex-1 lg:h-full lg:min-h-screen bg-[#F4EEDF] flex items-center justify-center px-6 py-8 md:px-12">
        <div className="relative w-full max-w-[320px] h-[180px] sm:h-[220px] lg:h-[250px] bg-[#F4EEDF]">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 flex flex-col justify-center gap-2 md:gap-4 w-full h-full"
            >
              {/* Stat Number */}
              <motion.div variants={blockVariants} custom={0}>
                <h3 className="font-normal text-[#19211C] font-body text-4xl sm:text-5xl lg:text-3xl">
                  <FastWavyText text={activeSlide.stat} />
                </h3>
              </motion.div>

              {/* Text Block */}
              <div className="flex flex-col gap-1">
                <motion.div variants={blockVariants} custom={0.04}>
                  <p className="font-medium text-sm sm:text-base text-[#19211C]">
                    <FastWavyText text={activeSlide.label} />
                  </p>
                </motion.div>

                <motion.div variants={blockVariants} custom={0.08}>
                  <p className="text-xs sm:text-sm md:text-base text-[#19211C]/80" style={{ fontFamily: "var(--font-body)" }}>
                    <FastWavyText text={activeSlide.desc} />
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </div>

    </section>
  );
}