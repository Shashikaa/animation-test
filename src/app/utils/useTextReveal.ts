"use client";

import gsap from "gsap";
import { RefObject } from "react";

export interface TextRevealOptions {
  yOffset?: number;
  stagger?: number;
  ease?: string;
  duration?: number;
  tl?: gsap.core.Timeline;
  position?: gsap.Position;
  static?: boolean;
  immediate?: boolean;
  scrollTrigger?: gsap.DOMTarget | ScrollTrigger.Vars;
}

function splitIntoLines(el: HTMLElement): HTMLElement[] {
  // ── GUARD CLAUSE: If already split, do not re-split ──
  if (el.dataset.originalHtml !== undefined) {
    return Array.from(el.querySelectorAll<HTMLElement>(".gs-line-inner"));
  }

  el.dataset.originalHtml = el.innerHTML;
  el.style.transform = "none";

  el.innerHTML = el.innerHTML.replace(/(\S+)/g, '<span class="gs-word">$1</span>');
  const words = Array.from(el.querySelectorAll<HTMLElement>(".gs-word"));

  const lineMap = new Map<number, HTMLElement[]>();
  words.forEach((w) => {
    const top = Math.round(w.getBoundingClientRect().top);
    if (!lineMap.has(top)) lineMap.set(top, []);
    lineMap.get(top)!.push(w);
  });

  const lines = Array.from(lineMap.values());
  el.innerHTML = "";

  const lineInners: HTMLElement[] = [];

  lines.forEach((group) => {
    const lineOuter = document.createElement("span");
    lineOuter.className = "gs-line";
    lineOuter.style.cssText =
      "display:block; overflow:hidden; padding-bottom:0.25em; margin-bottom:-0.25em;";

    const lineInner = document.createElement("span");
    lineInner.className = "gs-line-inner";
    lineInner.style.cssText =
      "display:block; will-change:transform,opacity; padding-bottom:0.25em;";

    group.forEach((w, i) => {
      lineInner.appendChild(w);
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
    yOffset   = 30,
    stagger   = 0.04,
    ease      = "power2.out",
    duration = 0.35,
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
    
    // Safety check: Only apply initialization defaults if we aren't mid-timeline scrub
    if (!tl) {
      gsap.set(lineInners, { y: yOffset, opacity: 0 });
    }

    if (tl) {
      tl.set(el, { visibility: "visible" }, position)
        .to(lineInners, {
          y: 0,
          opacity: 1,
          stagger,
          duration,
          ease
        }, position);
    } else if (immediate) {
      gsap.to(lineInners, {
        y: 0,
        opacity: 1,
        duration,
        ease,
        stagger,
        onStart: () => { el.style.visibility = "visible"; }
      });
    } else {
      gsap.to(lineInners, {
        y: 0, 
        opacity: 1, 
        duration, 
        ease, 
        stagger,
        onStart: () => { el.style.visibility = "visible"; },
        scrollTrigger: scrollTrigger || {
          trigger: el,
          start: "top 85%",
          once: true, 
        },
      });
    }
  });
}