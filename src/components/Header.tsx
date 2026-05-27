"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  LOGO_FONT_FAMILY,
  LOGO_FONT_WEIGHT,
  LOGO_FONT_SIZE,
  LOGO_LETTER_SPC,
  LOGO_COLOR,
  LOGO_GAP,
  LOGO_ICON_W,
  LOGO_ICON_H,
  LOGO_WORD_BOX,
  LOGO_ICON_SLOT_FULL,
  HEADER_LOGO_SCALE,
  IconMark,
} from "./Preloader";

interface HeaderProps {
  visible: boolean;
}

export default function Header({ visible }: HeaderProps) {
  const iconProgress = useMotionValue(1);
  const iconSlotW    = useTransform(iconProgress, [0, 1], [0, LOGO_ICON_SLOT_FULL]);

  useEffect(() => {
    if (visible) {
      iconProgress.set(1);
    }
  }, [visible, iconProgress]);

  const WORD_SLOT = LOGO_WORD_BOX + LOGO_GAP;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        id="header-logo"
        style={{
          visibility: visible ? "visible" : "hidden",
          opacity: visible ? 1 : 0,
          transition: "none",
        }}
      >
        <div
          id="header-logo-inner"
          style={{
            display: "inline-flex",
            alignItems: "center",
            whiteSpace: "nowrap",
            transformOrigin: "left center",
            transform: `scale(${HEADER_LOGO_SCALE})`,
            marginRight: `calc((1 - ${HEADER_LOGO_SCALE}) * -100%)`,
          }}
        >
          {/* LEFT word slot */}
          <div
            style={{
              width: WORD_SLOT,
              flexShrink: 0,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <span
              style={{
                fontFamily: LOGO_FONT_FAMILY,
                fontWeight: LOGO_FONT_WEIGHT,
                fontSize: LOGO_FONT_SIZE,
                color: LOGO_COLOR,
                letterSpacing: LOGO_LETTER_SPC,
                userSelect: "none",
                whiteSpace: "nowrap",
                lineHeight: 1,
                marginRight: LOGO_GAP,
              }}
            >
              GRAND
            </span>
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
            }}
          >
            <IconMark
              style={{ width: LOGO_ICON_W, height: LOGO_ICON_H, flexShrink: 0 }}
            />
          </motion.div>

          {/* RIGHT word slot */}
          <div
            style={{
              width: WORD_SLOT,
              flexShrink: 0,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <span
              style={{
                fontFamily: LOGO_FONT_FAMILY,
                fontWeight: LOGO_FONT_WEIGHT,
                fontSize: LOGO_FONT_SIZE,
                color: LOGO_COLOR,
                letterSpacing: LOGO_LETTER_SPC,
                userSelect: "none",
                whiteSpace: "nowrap",
                lineHeight: 1,
                marginLeft: LOGO_GAP,
              }}
            >
              POOLS
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}