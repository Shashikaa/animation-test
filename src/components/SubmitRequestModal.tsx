"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import SubmitRequestSection from "./SubmitRequestSection";

interface SubmitRequestModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SubmitRequestModal({ open, onClose }: SubmitRequestModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // GSAP slide in/out
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    tweenRef.current?.kill();

    if (open) {
      gsap.set(el, { display: "block", xPercent: 100 });
      tweenRef.current = gsap.to(el, {
        xPercent: 0,
        duration: 0.65,
        ease: "expo.out",
        force3D: true,
      });
    } else {
      tweenRef.current = gsap.to(el, {
        xPercent: 100,
        duration: 0.65,
        ease: "expo.out",
        force3D: true,
        onComplete: () => gsap.set(el, { display: "none" }),
      });
    }
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={panelRef}
      style={{
        display:             "none",
        position:            "fixed",
        inset:               0,
        zIndex:              9999,
        overflowY:           "auto",
        willChange:          "transform",
        backfaceVisibility:  "hidden",
      }}
    >
      <SubmitRequestSection onClose={onClose} />
    </div>,
    document.body
  );
}