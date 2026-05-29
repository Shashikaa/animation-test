"use client";
import { useEffect, useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { gsap } from "gsap";
import RippleCanvas from "./Ripplecanvas";

interface PreloaderProps {
  onComplete?: () => void;
}

export const LOGO_FONT_SIZE      = 28;
export const LOGO_LETTER_SPC     = "0.32em";
export const LOGO_FONT_FAMILY    = "'Cormorant Garamond', 'Didot', 'Georgia', serif";
export const LOGO_FONT_WEIGHT    = 300;
export const LOGO_COLOR          = "#F4EEDF";
export const LOGO_ICON_W         = 84;
export const LOGO_ICON_H         = 68;
export const LOGO_GAP            = 8;
export const LOGO_WORD_BOX       = 200;
export const LOGO_ICON_SLOT_FULL = 100;
export const HEADER_LOGO_SCALE   = 0.52;

const PRE_FONT_SIZE      = LOGO_FONT_SIZE;
const PRE_GAP            = LOGO_GAP;
const PRE_WORD_BOX       = LOGO_WORD_BOX;
const PRE_ICON_SLOT_FULL = LOGO_ICON_SLOT_FULL;
const LINE_TEXT_GAP      = 18;

export const IconMark = ({ style }: { style?: React.CSSProperties }) => (
  <img
    src="/icon-center.svg"
    width={LOGO_ICON_W}
    height={LOGO_ICON_H}
    alt=""
    draggable={false}
    style={{
      display: "block",
      flexShrink: 0,
      userSelect: "none",
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      ...style,
    }}
  />
);

// ─── Phase types ───────────────────────────────────────────────────────────
type Phase =
  | "idle"
  | "line-appear"
  | "text-reveal"
  | "line-fadeout"
  | "icon-appear"
  | "hold"
  | "fly-out"
  | "done";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Preloader ─────────────────────────────────────────────────────────────
export default function Preloader({ onComplete }: PreloaderProps) {
  const [phase, setPhase]     = useState<Phase>("idle");
  const [mounted, setMounted] = useState(true);
  const [bgFade, setBgFade]   = useState(false);
  const assemblyRef           = useRef<HTMLDivElement>(null);
  const iconRef               = useRef<HTMLDivElement>(null);

  const [flyTarget, setFlyTarget] = useState<{
    x: number; y: number; scale: number;
  } | null>(null);

  const iconProgress = useMotionValue(0);
  const iconSlotW    = useTransform(iconProgress, [0, 1], [0, PRE_ICON_SLOT_FULL]);
  const iconOpacity  = useTransform(iconProgress, [0, 0.15, 1], [0, 0, 1]);

  useEffect(() => {
    const run = async () => {
      await wait(400);
      setPhase("line-appear");
      await wait(1800);

      setPhase("text-reveal");
      await wait(1600);

      setPhase("line-fadeout");
      await wait(700);

      setPhase("icon-appear");
      iconProgress.set(0);
      animate(iconProgress, 1, { duration: 2.0, ease: [0.22, 1, 0.36, 1] });

      requestAnimationFrame(() => {
        if (iconRef.current) {
          gsap.fromTo(
            iconRef.current,
            { scale: 0.7, filter: "blur(16px)", transformOrigin: "center center" },
            { scale: 1,   filter: "blur(0px)",  duration: 2.0, ease: "power3.out" }
          );
        }
      });

      await wait(2400);
      setPhase("hold");
      await wait(600);

      const headerEl   = document.getElementById("header-logo-inner");
      const assemblyEl = assemblyRef.current;
      if (headerEl && assemblyEl) {
        const hRect = headerEl.getBoundingClientRect();
        const aRect = assemblyEl.getBoundingClientRect();
        setFlyTarget({
          x:     (hRect.left + hRect.width  / 2) - (aRect.left + aRect.width  / 2),
          y:     (hRect.top  + hRect.height / 2) - (aRect.top  + aRect.height / 2),
          scale: hRect.width / aRect.width,
        });
      }

      setPhase("fly-out");
      await wait(700);

      onComplete?.();
      setBgFade(true);
      await wait(800);

      setPhase("done");
      setMounted(false);
    };

    run();
  }, [onComplete]);

  useEffect(() => {
    return () => { if (iconRef.current) gsap.killTweensOf(iconRef.current); };
  }, []);

  if (!mounted) return null;

  const showLine   = ["line-appear", "text-reveal", "line-fadeout"].includes(phase);
  const lineFading = phase === "line-fadeout";
  const showText   = !["idle", "line-appear"].includes(phase);
  const iconActive = ["icon-appear", "hold", "fly-out", "done"].includes(phase);
  const isFlyOut   = phase === "fly-out" || phase === "done";

  return (
    <motion.div
      animate={bgFade ? { opacity: 0 } : { opacity: 1 }}
      transition={bgFade ? { duration: 0.75, ease: "easeInOut" } : undefined}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        pointerEvents: isFlyOut ? "none" : "auto",
      }}
    >
      {/* ── WebGL ripple canvas ── */}
      <RippleCanvas
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
        seedRipples={[
          [0.5,  0.5,  300],
          [0.28, 0.38, 1100],
          [0.72, 0.62, 1900],
        ]}
      />

      {/* ── VERTICAL LINE ── */}
      <AnimatePresence>
        {showLine && (
          <motion.div
            key="vline"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              left: "50%", top: "45%",
              transform: "translateX(-50%)",
              width: "1px", height: "10%",
              transformOrigin: "center center",
              pointerEvents: "none",
              overflow: "hidden",
              zIndex: 2,
            }}
          >
            <motion.div
              initial={{ clipPath: "inset(0% 0 0% 0)" }}
              animate={lineFading
                ? { clipPath: "inset(100% 0 0% 0)" }
                : { clipPath: "inset(0% 0 0% 0)" }}
              transition={{ duration: 0.45, ease: "easeIn" }}
              style={{
                width: "100%", height: "100%",
                background: "linear-gradient(180deg, transparent 0%, #F4EEDF 20%, #F4EEDF 80%, transparent 100%)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ASSEMBLED LOGO ── */}
      <motion.div
        ref={assemblyRef}
        animate={
          isFlyOut && flyTarget
            ? { x: flyTarget.x, y: flyTarget.y, scale: flyTarget.scale }
            : { x: 0, y: 0, scale: 1 }
        }
        transition={isFlyOut ? { duration: 0.85, ease: [0.76, 0, 0.24, 1] } : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          transformOrigin: "center center",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* LEFT word slot */}
        <div
          style={{
            width: PRE_WORD_BOX + PRE_GAP,
            flexShrink: 0,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <motion.span
            initial={{ x: PRE_WORD_BOX + PRE_GAP }}
            animate={showText
              ? { x: -(PRE_GAP + LINE_TEXT_GAP) }
              : { x: PRE_WORD_BOX + PRE_GAP }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: LOGO_FONT_FAMILY,
              fontWeight: LOGO_FONT_WEIGHT,
              fontSize: PRE_FONT_SIZE,
              color: LOGO_COLOR,
              letterSpacing: LOGO_LETTER_SPC,
              userSelect: "none",
              whiteSpace: "nowrap",
              display: "inline-block",
              lineHeight: 1,
            }}
          >
            GRAND
          </motion.span>
        </div>

        {/* ICON slot */}
        <motion.div
          style={{
            width: iconSlotW,
            flexShrink: 0,
            overflow: "visible",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            visibility: iconActive ? "visible" : "hidden",
          }}
        >
          <motion.div
            style={{
              opacity: iconOpacity,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div ref={iconRef}>
              <IconMark />
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT word slot */}
        <div
          style={{
            width: PRE_WORD_BOX + PRE_GAP,
            flexShrink: 0,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <motion.span
            initial={{ x: -(PRE_WORD_BOX + PRE_GAP) }}
            animate={showText
              ? { x: PRE_GAP + LINE_TEXT_GAP }
              : { x: -(PRE_WORD_BOX + PRE_GAP) }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: LOGO_FONT_FAMILY,
              fontWeight: LOGO_FONT_WEIGHT,
              fontSize: PRE_FONT_SIZE,
              color: LOGO_COLOR,
              letterSpacing: LOGO_LETTER_SPC,
              userSelect: "none",
              whiteSpace: "nowrap",
              display: "inline-block",
              lineHeight: 1,
            }}
          >
            POOLS
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  );
}