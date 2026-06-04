"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "../app/context/SiteContext";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const thumbRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { lenisRef, preloaderDone } = useSite();

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.05,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
      orientation: "vertical",
      gestureOrientation: "vertical",
    });

    lenisRef.current = lenis;

    if (!preloaderDone) {
      lenis.stop();
    }

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value?: number) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: "fixed",
    });

    let thumbVisible = false;

    lenis.on("scroll", ({ scroll, limit }: { scroll: number; limit: number }) => {
      ScrollTrigger.update();

      if (thumbRef.current) {
        const trackH = window.innerHeight;
        const thumbH = Math.max((trackH / (limit + trackH)) * trackH, 40);
        const maxTop = trackH - thumbH;
        const top = (scroll / limit) * maxTop;

        thumbRef.current.style.height = `${thumbH}px`;
        thumbRef.current.style.transform = `translateY(${top}px)`;
      }

      if (!thumbVisible && thumbRef.current) {
        thumbVisible = true;
        thumbRef.current.style.opacity = "1";
      }

      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        thumbVisible = false;
        if (thumbRef.current) thumbRef.current.style.opacity = "0";
      }, 800);
    });

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const refreshId = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => {
      clearTimeout(refreshId);
      lenisRef.current = null;
      lenis.destroy();
      gsap.ticker.remove(tick);
      clearTimeout(scrollTimerRef.current);
      ScrollTrigger.scrollerProxy(document.documentElement, undefined as any);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {children}

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "4px",
          height: "100vh",
          zIndex: 99999,
          pointerEvents: "none",
        }}
      >
        <div
          ref={thumbRef}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "4px",
            background: "rgba(255,255,255,0.35)",
            borderRadius: "999px",
            opacity: 0,
            transition: "opacity 0.3s ease, background 0.2s ease",
            willChange: "transform",
          }}
        />
      </div>
    </>
  );
}