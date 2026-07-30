"use client";

import gsap from "gsap";
import { RefObject } from "react";

export interface TextRevealOptions {
  yPercent?: number;      // Distance to start from (percentage)
  stagger?: number;       // Stagger delay between lines
  ease?: string;          // Easing curve
  duration?: number;      // Animation duration
  rotation?: number;      // Subtle tilt/skew during entrance
  tl?: gsap.core.Timeline;// Timeline to append to
  position?: gsap.Position;
  static?: boolean;
  immediate?: boolean;
  scrollTrigger?: gsap.DOMTarget | ScrollTrigger.Vars;
}

/**
 * Splits text into wrapped lines without breaking flow or causing layout shifts.
 */
function splitIntoLines(el: HTMLElement): HTMLElement[] {
  if (el.dataset.originalHtml !== undefined) {
    return Array.from(el.querySelectorAll<HTMLElement>(".gs-line-inner"));
  }

  el.dataset.originalHtml = el.innerHTML;
  el.style.transform = "none";

  // Wrap words cleanly using standard DOM text nodes
  const textContent = el.textContent || "";
  const words = textContent.trim().split(/\s+/);
  
  el.innerHTML = words
    .map((word) => `<span class="gs-word-wrapper inline-block overflow-hidden vertical-top"><span class="gs-word inline-block">${word}</span></span>`)
    .join(" ");

  const wordNodes = Array.from(el.querySelectorAll<HTMLElement>(".gs-word"));
  const lineMap = new Map<number, HTMLElement[]>();

  // Efficient line detection via Range API (prevents expensive reflows)
  wordNodes.forEach((word) => {
    const range = document.createRange();
    range.selectNode(word);
    const rect = range.getBoundingClientRect();
    const top = Math.round(rect.top);

    if (!lineMap.has(top)) lineMap.set(top, []);
    lineMap.get(top)!.push(word);
  });

  el.innerHTML = "";
  const lineInners: HTMLElement[] = [];

  lineMap.forEach((group) => {
    const lineOuter = document.createElement("span");
    lineOuter.className = "gs-line block overflow-hidden py-[0.1em] -my-[0.1em]";

    const lineInner = document.createElement("span");
    lineInner.className = "gs-line-inner block will-change-transform";

    group.forEach((word, i) => {
      lineInner.appendChild(word);
      if (i < group.length - 1) {
        lineInner.appendChild(document.createTextNode(" "));
      }
    });

    lineOuter.appendChild(lineInner);
    el.appendChild(lineOuter);
    lineInners.push(lineInner);
  });

  return lineInners;
}

export function restoreTextReveal(scope: HTMLElement, selector: string) {
  scope.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    if (el.dataset.originalHtml !== undefined) {
      el.innerHTML = el.dataset.originalHtml;
      delete el.dataset.originalHtml;
      el.style.opacity = "";
      el.style.transform = "";
      el.style.visibility = "";
    } else {
      el.style.visibility = "";
    }
  });
}

export function useTextReveal(
  scopeRef: RefObject<HTMLElement | null>,
  selector: string,
  options: TextRevealOptions = {}
) {
  const {
    yPercent = 110,
    stagger = 0.06,
    ease = "power4.out",
    duration = 1.1,
    rotation = 3,
    tl,
    position = ">",
    static: isStatic = false,
    immediate = false,
    scrollTrigger,
  } = options;

  const scope = scopeRef.current;
  if (!scope) return;

  const elements = Array.from(scope.querySelectorAll<HTMLElement>(selector));
  if (!elements.length) return;

  elements.forEach((el) => {
    if (isStatic) {
      el.style.visibility = "hidden";
      if (tl) {
        tl.set(el, { visibility: "visible" }, position);
      } else {
        el.style.visibility = "visible";
      }
      return;
    }

    el.style.visibility = "hidden";
    const lineInners = splitIntoLines(el);

    // Initial transforms for modern masked entrance
    const initialProps = {
      yPercent: yPercent,
      rotateX: -15,
      rotateZ: rotation,
      scaleY: 1.25,
      transformOrigin: "0% 100%",
      opacity: 0,
      force3D: true,
    };

    const targetProps = {
      yPercent: 0,
      rotateX: 0,
      rotateZ: 0,
      scaleY: 1,
      opacity: 1,
      stagger: stagger,
      duration: duration,
      ease: ease,
    };

    if (!tl) {
      gsap.set(lineInners, initialProps);
    }

    if (tl) {
      tl.set(el, { visibility: "visible" }, position)
        .set(lineInners, initialProps, position)
        .to(lineInners, targetProps, position);
    } else if (immediate) {
      gsap.to(lineInners, {
        ...targetProps,
        onStart: () => { el.style.visibility = "visible"; }
      });
    } else {
      gsap.to(lineInners, {
        ...targetProps,
        onStart: () => { el.style.visibility = "visible"; },
        scrollTrigger: scrollTrigger || {
          trigger: el,
          start: "top 88%",
          once: true,
        },
      });
    }
  });
}