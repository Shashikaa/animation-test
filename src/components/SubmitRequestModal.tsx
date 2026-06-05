"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SubmitRequestSection from "./SubmitRequestSection";

interface SubmitRequestModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SubmitRequestModal({ open, onClose }: SubmitRequestModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="submit-request-modal"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: "fixed", inset: 0, zIndex: 9999, overflowY: "auto" }}
        >
          <SubmitRequestSection onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}