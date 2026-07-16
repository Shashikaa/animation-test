"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export default function TextRevealOrchestrator() {
  const pathname = usePathname();

  useEffect(() => {
    const targets = document.querySelectorAll(".reveal-text");
    if (!targets.length) return;

    const pinnedElements: HTMLElement[] = [];
    const normalElements: HTMLElement[] = [];

    targets.forEach((element) => {
      const el = element as HTMLElement;
      
      // Enforce zero state initialization across rendering paths
      if (el.dataset.revealed !== "true") {
        gsap.set(el, { opacity: 0, y: 30 });
      }

      if (el.closest(".section-one-wrapper, .section-two-wrapper")) {
        pinnedElements.push(el);
      } else {
        normalElements.push(el);
      }
    });

    // ── ARCHITECTURE PATH A: MASTER PROGRESS CONTROLLER FOR PINNED SCREENS ──
    // We bypass all position elements math and match directly against the window scroll bounds
    const processMasterScrollState = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Safety check if document limits haven't rendered yet
      if (scrollHeight <= 0) return;

      // Extract raw percentage index of your total viewport scroll progress
      const globalProgress = scrollTop / scrollHeight;

      pinnedElements.forEach((el) => {
        if (el.dataset.revealed === "true") return;

        // Check which section container frames the elements
        const isSectionTwo = el.closest(".section-two-wrapper");
        
        // Define exact trigger benchmarks based on your parent's timeline scale (+=10000)
        // Section One enters stage after text swapping sequences resolve (around 20% down page progress)
        // Section Two enters stage dynamically after Section One resolves (around 55% down page progress)
        const triggerThreshold = isSectionTwo ? 0.55 : 0.20;

        if (globalProgress >= triggerThreshold) {
          el.dataset.revealed = "true";

          const delay = parseFloat(el.getAttribute("data-reveal-delay") || "0");
          const duration = parseFloat(el.getAttribute("data-reveal-duration") || "1.2");

          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: duration,
            delay: delay,
            ease: "power3.out",
            overwrite: "auto"
          });
        }
      });
    };

    if (pinnedElements.length > 0) {
      window.addEventListener("scroll", processMasterScrollState, { passive: true });
      // Execute check trace immediately on initial mounting checks
      setTimeout(processMasterScrollState, 200);
    }

    // ── ARCHITECTURE PATH B: INTERSECTION OBSERVER FOR STANDARD PAGES ──
    let observer: IntersectionObserver | null = null;
    if (normalElements.length > 0) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              const delay = parseFloat(el.getAttribute("data-reveal-delay") || "0");
              const duration = parseFloat(el.getAttribute("data-reveal-duration") || "1.2");

              gsap.to(el, {
                opacity: 1,
                y: 0,
                duration: duration,
                delay: delay,
                ease: "power3.out",
                overwrite: "auto",
              });
              observer?.unobserve(el);
            }
          });
        },
        { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0 }
      );

      normalElements.forEach((el) => observer?.observe(el));
    }

    return () => {
      window.removeEventListener("scroll", processMasterScrollState);
      if (observer) observer.disconnect();
    };
  }, [pathname]);

  return null;
}