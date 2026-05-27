// Preloader.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";

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
const PRE_ICON_W         = LOGO_ICON_W;
const PRE_ICON_H         = LOGO_ICON_H;
const PRE_GAP            = LOGO_GAP;
const PRE_WORD_BOX       = LOGO_WORD_BOX;
const PRE_ICON_SLOT_FULL = LOGO_ICON_SLOT_FULL;
const LINE_TEXT_GAP      = 18;

export const IconMark = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    width={LOGO_ICON_W}
    height={LOGO_ICON_H}
    viewBox="62 0 52 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={style}
  >
    <path
      d="M106.658 15.6658C106.516 15.6713 106.375 15.6917 106.237 15.7267C105.518 15.9872 104.816 16.3105 104.084 16.5197C103.817 16.5957 103.549 16.6699 103.28 16.7421C103.293 16.4968 103.299 16.2496 103.299 16.0005C103.298 13.6806 102.792 11.389 101.814 9.28623C100.837 7.18348 99.4124 5.32055 97.6409 3.82807C95.8694 2.3356 93.7938 1.24971 91.5595 0.646565C89.3252 0.0434181 86.9863 -0.0623898 84.7069 0.336562C82.4275 0.735513 80.2627 1.62956 78.3644 2.95602C76.4661 4.28248 74.8802 6.00923 73.7178 8.01518C72.5555 10.0211 71.845 12.2577 71.636 14.5681C71.427 16.8785 71.7247 19.2068 72.5081 21.3896L72.3716 21.4524C72.0425 21.596 71.6862 21.6658 71.3274 21.657C70.9686 21.6482 70.6161 21.561 70.2944 21.4015C69.9728 21.2419 69.6897 21.0139 69.465 20.7334C69.2403 20.4528 69.0795 20.1264 68.9936 19.7771C68.8583 19.3112 68.9086 18.8108 69.134 18.3813C69.2383 18.1912 69.2838 18.0257 69.0467 17.9002C69.004 17.8683 68.9543 17.847 68.9018 17.8382C68.8492 17.8293 68.7953 17.8332 68.7446 17.8493C68.6938 17.8655 68.6476 17.8935 68.6097 17.9312C68.5719 17.9688 68.5435 18.0149 68.527 18.0656C68.4405 18.2154 68.3705 18.3742 68.3184 18.5391C68.0528 19.5926 68.1477 20.5948 68.9651 21.3725C69.7826 22.1503 70.7708 22.7036 71.9752 22.4526C72.265 22.3915 72.5497 22.3083 72.8268 22.2035C74.1979 25.4503 76.6062 28.1483 79.6731 29.8734C82.7401 31.5986 86.2919 32.2531 89.7703 31.7341C93.2486 31.2151 96.4564 29.5521 98.8895 27.0063C101.323 24.4606 102.843 21.1765 103.212 17.6701C104.125 17.4711 105.022 17.2003 105.894 16.86C106.063 16.8003 106.219 16.7052 106.35 16.581C106.48 16.4568 106.584 16.3063 106.652 16.1393C106.683 15.9832 106.685 15.8226 106.658 15.6658ZM87.4369 31.0098C84.492 31.0066 81.6132 30.134 79.1597 28.501C76.7062 26.868 74.7866 24.5468 73.6405 21.827C74.1602 21.5379 74.6551 21.2059 75.1199 20.8344C77.1432 19.2524 79.0272 17.499 80.7511 15.5936C81.6008 14.6561 82.498 13.7642 83.3818 12.8591C83.4973 12.7706 83.6251 12.6994 83.7611 12.648C83.8033 12.7688 83.8357 12.8928 83.8579 13.0188C83.8977 13.479 83.9167 13.9411 83.9565 14.3994C84.0855 15.8598 84.5938 17.1129 85.8532 17.9839C86.9779 18.7616 88.1747 19.161 89.5365 18.773C90.896 18.379 92.193 17.7938 93.3887 17.035C93.9625 16.6901 94.5545 16.3765 95.1621 16.0956C95.3518 16.0081 95.5642 15.8902 95.7311 16.2173C96.5732 17.826 97.9881 18.4574 99.7141 18.3813C100.505 18.3452 101.292 18.1189 102.07 17.9363L102.286 17.8869C101.825 21.5103 100.064 24.8413 97.3305 27.2567C94.5974 29.672 91.0802 31.0063 87.4369 31.0098ZM102.375 16.9779C101.763 17.132 101.144 17.2708 100.524 17.3887C99.6508 17.5618 98.7466 17.4861 97.9142 17.17C97.2162 16.8818 96.6539 16.3378 96.3418 15.6487C96.0308 15.0307 95.8885 14.968 95.2569 15.2247C94.7544 15.4122 94.2662 15.6366 93.7965 15.8959C92.4548 16.7157 91.0202 17.372 89.5233 17.8508C87.7859 18.3794 85.9537 17.537 85.269 16.1089C84.755 15.0345 84.6336 13.9069 84.6545 12.7431C84.6545 12.4179 84.6735 12.0889 84.645 11.7638C84.6241 11.5641 84.5648 11.3704 84.4705 11.1933C84.332 10.9309 84.1519 10.91 83.93 11.1457C83.323 11.7866 82.7047 12.4141 82.0845 13.0473C80.3642 14.7759 78.6686 16.5444 76.8952 18.2558C75.8259 19.3225 74.622 20.2443 73.3142 20.9979C72.5906 18.9374 72.3243 16.7433 72.534 14.5689C72.7437 12.3946 73.4242 10.2923 74.5281 8.40889C75.632 6.5255 77.1327 4.9064 78.9253 3.66464C80.7179 2.42289 82.7593 1.58842 84.9068 1.2195C87.0544 0.850587 89.2564 0.956116 91.3591 1.52872C93.4618 2.10133 95.4145 3.12721 97.0808 4.53473C98.7471 5.94225 100.087 7.69748 101.007 9.67785C101.926 11.6582 102.404 13.816 102.406 16.0005C102.406 16.3295 102.394 16.6547 102.373 16.9779H102.375Z"
      fill="#F4EEDF" stroke="#F4EEDF" strokeWidth="0.120864" strokeMiterlimit="10"
    />
    <path
      d="M106.703 19.2999L106.973 19.6041C107.015 19.6523 107.048 19.7088 107.068 19.7701C107.088 19.8315 107.095 19.8962 107.089 19.9605C107.083 20.0247 107.064 20.087 107.033 20.1435C107.001 20.1999 106.959 20.2494 106.908 20.2887C106.811 20.361 106.718 20.4066 106.675 20.3819C106.456 20.2747 106.249 20.144 106.058 19.992C105.999 19.947 105.952 19.8886 105.92 19.8217C105.888 19.7547 105.872 19.6811 105.874 19.6069C105.876 19.5326 105.895 19.4599 105.931 19.3946C105.966 19.3294 106.016 19.2734 106.077 19.2314H106.087C106.18 19.1659 106.294 19.1368 106.408 19.1494C106.521 19.1619 106.626 19.2154 106.703 19.2999Z"
      fill="#F4EEDF" stroke="#F4EEDF" strokeWidth="0.120864" strokeMiterlimit="10"
    />
    </svg>
);

type Phase =
  | "idle"
  | "line-appear"
  | "text-reveal"
  | "line-fadeout"
  | "icon-appear"
  | "hold"
  | "fly-out"
  | "done";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Preloader({ onComplete }: PreloaderProps) {
  const [phase, setPhase]     = useState<Phase>("idle");
  const [mounted, setMounted] = useState(true);
  const [bgFade, setBgFade]   = useState(false);
  const assemblyRef           = useRef<HTMLDivElement>(null);

  const [flyTarget, setFlyTarget] = useState<{
    x: number; y: number; scale: number;
  } | null>(null);

  const iconProgress = useMotionValue(0);

  // Slot width: 0 → full
  const iconSlotW = useTransform(iconProgress, [0, 1], [0, PRE_ICON_SLOT_FULL]);

  // Opacity: stays 0 until progress 0.15, then ramps to 1
  const iconOpacity = useTransform(iconProgress, [0, 0.15, 1], [0, 0, 1]);

  // Scale: 0.7 → 1, driven on same progress
  const iconScale = useTransform(iconProgress, [0, 1], [0.7, 1]);

  // Blur: heavy at start, clears by 0.88
  const iconFilter = useTransform(
    iconProgress,
    (v) => v >= 0.88 ? "none" : `blur(${(1 - v / 0.88) * 12}px)`
  );

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
      // Start from 0 each time cleanly
      iconProgress.set(0);
      animate(iconProgress, 1, { duration: 2.0, ease: [0.22, 1, 0.36, 1] });
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
        backgroundColor: "#1a3a3a",
      }}
    >
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

        {/* ICON slot — always mounted, visibility toggled to avoid flicker on mount */}
        <motion.div
          style={{
            width: iconSlotW,
            flexShrink: 0,
            overflow: "visible",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // Hide completely before icon phase so slot starts at 0 invisibly
            visibility: iconActive ? "visible" : "hidden",
          }}
        >
          <motion.div
            style={{
              opacity: iconOpacity,
              scaleX: iconScale,
              scaleY: iconScale,
              filter: iconFilter,
              transformOrigin: "center center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              // Force own GPU layer so filter never bleeds into siblings
              willChange: "opacity, transform, filter",
            }}
          >
            <svg
              width={PRE_ICON_W}
              height={PRE_ICON_H}
              viewBox="62 0 52 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: "block", flexShrink: 0 }}
            >
                  <path
                    d="M106.658 15.6658C106.516 15.6713 106.375 15.6917 106.237 15.7267C105.518 15.9872 104.816 16.3105 104.084 16.5197C103.817 16.5957 103.549 16.6699 103.28 16.7421C103.293 16.4968 103.299 16.2496 103.299 16.0005C103.298 13.6806 102.792 11.389 101.814 9.28623C100.837 7.18348 99.4124 5.32055 97.6409 3.82807C95.8694 2.3356 93.7938 1.24971 91.5595 0.646565C89.3252 0.0434181 86.9863 -0.0623898 84.7069 0.336562C82.4275 0.735513 80.2627 1.62956 78.3644 2.95602C76.4661 4.28248 74.8802 6.00923 73.7178 8.01518C72.5555 10.0211 71.845 12.2577 71.636 14.5681C71.427 16.8785 71.7247 19.2068 72.5081 21.3896L72.3716 21.4524C72.0425 21.596 71.6862 21.6658 71.3274 21.657C70.9686 21.6482 70.6161 21.561 70.2944 21.4015C69.9728 21.2419 69.6897 21.0139 69.465 20.7334C69.2403 20.4528 69.0795 20.1264 68.9936 19.7771C68.8583 19.3112 68.9086 18.8108 69.134 18.3813C69.2383 18.1912 69.2838 18.0257 69.0467 17.9002C69.004 17.8683 68.9543 17.847 68.9018 17.8382C68.8492 17.8293 68.7953 17.8332 68.7446 17.8493C68.6938 17.8655 68.6476 17.8935 68.6097 17.9312C68.5719 17.9688 68.5435 18.0149 68.527 18.0656C68.4405 18.2154 68.3705 18.3742 68.3184 18.5391C68.0528 19.5926 68.1477 20.5948 68.9651 21.3725C69.7826 22.1503 70.7708 22.7036 71.9752 22.4526C72.265 22.3915 72.5497 22.3083 72.8268 22.2035C74.1979 25.4503 76.6062 28.1483 79.6731 29.8734C82.7401 31.5986 86.2919 32.2531 89.7703 31.7341C93.2486 31.2151 96.4564 29.5521 98.8895 27.0063C101.323 24.4606 102.843 21.1765 103.212 17.6701C104.125 17.4711 105.022 17.2003 105.894 16.86C106.063 16.8003 106.219 16.7052 106.35 16.581C106.48 16.4568 106.584 16.3063 106.652 16.1393C106.683 15.9832 106.685 15.8226 106.658 15.6658ZM87.4369 31.0098C84.492 31.0066 81.6132 30.134 79.1597 28.501C76.7062 26.868 74.7866 24.5468 73.6405 21.827C74.1602 21.5379 74.6551 21.2059 75.1199 20.8344C77.1432 19.2524 79.0272 17.499 80.7511 15.5936C81.6008 14.6561 82.498 13.7642 83.3818 12.8591C83.4973 12.7706 83.6251 12.6994 83.7611 12.648C83.8033 12.7688 83.8357 12.8928 83.8579 13.0188C83.8977 13.479 83.9167 13.9411 83.9565 14.3994C84.0855 15.8598 84.5938 17.1129 85.8532 17.9839C86.9779 18.7616 88.1747 19.161 89.5365 18.773C90.896 18.379 92.193 17.7938 93.3887 17.035C93.9625 16.6901 94.5545 16.3765 95.1621 16.0956C95.3518 16.0081 95.5642 15.8902 95.7311 16.2173C96.5732 17.826 97.9881 18.4574 99.7141 18.3813C100.505 18.3452 101.292 18.1189 102.07 17.9363L102.286 17.8869C101.825 21.5103 100.064 24.8413 97.3305 27.2567C94.5974 29.672 91.0802 31.0063 87.4369 31.0098ZM102.375 16.9779C101.763 17.132 101.144 17.2708 100.524 17.3887C99.6508 17.5618 98.7466 17.4861 97.9142 17.17C97.2162 16.8818 96.6539 16.3378 96.3418 15.6487C96.0308 15.0307 95.8885 14.968 95.2569 15.2247C94.7544 15.4122 94.2662 15.6366 93.7965 15.8959C92.4548 16.7157 91.0202 17.372 89.5233 17.8508C87.7859 18.3794 85.9537 17.537 85.269 16.1089C84.755 15.0345 84.6336 13.9069 84.6545 12.7431C84.6545 12.4179 84.6735 12.0889 84.645 11.7638C84.6241 11.5641 84.5648 11.3704 84.4705 11.1933C84.332 10.9309 84.1519 10.91 83.93 11.1457C83.323 11.7866 82.7047 12.4141 82.0845 13.0473C80.3642 14.7759 78.6686 16.5444 76.8952 18.2558C75.8259 19.3225 74.622 20.2443 73.3142 20.9979C72.5906 18.9374 72.3243 16.7433 72.534 14.5689C72.7437 12.3946 73.4242 10.2923 74.5281 8.40889C75.632 6.5255 77.1327 4.9064 78.9253 3.66464C80.7179 2.42289 82.7593 1.58842 84.9068 1.2195C87.0544 0.850587 89.2564 0.956116 91.3591 1.52872C93.4618 2.10133 95.4145 3.12721 97.0808 4.53473C98.7471 5.94225 100.087 7.69748 101.007 9.67785C101.926 11.6582 102.404 13.816 102.406 16.0005C102.406 16.3295 102.394 16.6547 102.373 16.9779H102.375Z"
                    fill="#F4EEDF" stroke="#F4EEDF" strokeWidth="0.120864" strokeMiterlimit="10"
                  />
                  <path
                    d="M106.703 19.2999L106.973 19.6041C107.015 19.6523 107.048 19.7088 107.068 19.7701C107.088 19.8315 107.095 19.8962 107.089 19.9605C107.083 20.0247 107.064 20.087 107.033 20.1435C107.001 20.1999 106.959 20.2494 106.908 20.2887C106.811 20.361 106.718 20.4066 106.675 20.3819C106.456 20.2747 106.249 20.144 106.058 19.992C105.999 19.947 105.952 19.8886 105.92 19.8217C105.888 19.7547 105.872 19.6811 105.874 19.6069C105.876 19.5326 105.895 19.4599 105.931 19.3946C105.966 19.3294 106.016 19.2734 106.077 19.2314H106.087C106.18 19.1659 106.294 19.1368 106.408 19.1494C106.521 19.1619 106.626 19.2154 106.703 19.2999Z"
                    fill="#F4EEDF" stroke="#F4EEDF" strokeWidth="0.120864" strokeMiterlimit="10"
                  />
              </svg>
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