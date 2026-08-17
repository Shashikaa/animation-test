"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSite } from "../app/context/SiteContext";

export default function CustomScrollBar() {
  const { smootherRef } = useSite();
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let instance = smootherRef?.current;

    const attachScrollListener = () => {
      instance = smootherRef?.current;
      if (!instance) return;

      const handleScroll = (e: any) => {
        let scroll = 0;
        let limit = 1;

        if (typeof e.scroll === "number" && typeof e.limit === "number") {
          scroll = e.scroll;
          limit = e.limit;
        } else if (typeof e.progress === "number") {
          scroll = e.progress;
          limit = 1;
        }

        const currentProgress = limit > 0 ? scroll / limit : 0;
        setProgress(Math.min(Math.max(currentProgress, 0), 1));
      };

      if (typeof instance.on === "function") {
        instance.on("scroll", handleScroll);
      }

      return () => {
        if (typeof instance.off === "function") {
          instance.off("scroll", handleScroll);
        }
      };
    };

    const cleanup = attachScrollListener();

    const interval = setInterval(() => {
      if (smootherRef?.current && !instance) {
        attachScrollListener();
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (cleanup) cleanup();
    };
  }, [smootherRef]);

  // Direct click or touch drag handling
  const handlePointerAction = useCallback(
    (clientY: number) => {
      const instance = smootherRef?.current;
      if (!instance || !trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const clickY = clientY - rect.top;
      const trackHeight = rect.height;

      const thumbHeight = 20; // Matched with h-[20px] in styling
      const maxTranslate = trackHeight - thumbHeight;

      let targetTranslate = clickY - thumbHeight / 2;
      targetTranslate = Math.max(0, Math.min(targetTranslate, maxTranslate));

      const newProgress = maxTranslate > 0 ? targetTranslate / maxTranslate : 0;
      const limit = instance.limit || document.documentElement.scrollHeight - window.innerHeight;
      const targetScroll = newProgress * limit;

      if (typeof instance.scrollTo === "function") {
        instance.scrollTo(targetScroll, { immediate: false });
      } else {
        window.scrollTo({ top: targetScroll, behavior: "smooth" });
      }
    },
    [smootherRef]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    handlePointerAction(e.clientY);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      handlePointerAction(e.clientY);
    };

    const handlePointerUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, handlePointerAction]);

  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointerDown}
      /* Hidden on mobile, displayed on tablets/desktop (md and up) */
      className=" fixed top-0 right-0 bottom-0 w-3 z-[9999] cursor-pointer select-none group touch-none"
    >
      {/* Track background line */}
      <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-white/15 group-hover:bg-white/30 transition-colors" />

      {/* Indicator Thumb */}
      <div
        className="absolute right-0 w-1.5 h-[20px] bg-white/55 rounded-full transition-transform duration-75 ease-out will-change-transform"
        style={{
          transform: `translate3d(0, calc(${progress} * (100vh - 20px)), 0)`,
        }}
      />
    </div>
  );
}