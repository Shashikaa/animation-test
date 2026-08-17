"use client";

import { RefObject } from "react";

export interface TextRevealOptions {
  yPercent?: number;
  stagger?: number;
  duration?: number;
  delay?: number;
  ease?: string;
}

/**
 * Splits text into wrapped line containers without triggering layout reflow jitter.
 */
function splitIntoLines(el: HTMLElement): HTMLElement[] {
  if (el.dataset.originalHtml !== undefined) {
    return Array.from(el.querySelectorAll<HTMLElement>(".gs-line-inner"));
  }

  el.dataset.originalHtml = el.innerHTML;

  const prevTransform = el.style.transform;
  el.style.transform = "none";

  const textContent = el.textContent || "";
  const words = textContent.trim().split(/\s+/);

  el.innerHTML = words
    .map(
      (word) =>
        `<span class="gs-word-wrapper inline-block overflow-hidden align-top"><span class="gs-word inline-block">${word}</span></span>`
    )
    .join(" ");

  const wordNodes = Array.from(el.querySelectorAll<HTMLElement>(".gs-word"));
  const lineMap = new Map<number, HTMLElement[]>();

  wordNodes.forEach((word) => {
    const rect = word.getBoundingClientRect();
    const top = Math.round(rect.top);

    if (!lineMap.has(top)) lineMap.set(top, []);
    lineMap.get(top)!.push(word);
  });

  el.innerHTML = "";
  const lineInners: HTMLElement[] = [];

  lineMap.forEach((group) => {
    const lineOuter = document.createElement("span");
    lineOuter.className =
      "gs-line gs-line-outer block overflow-hidden py-[0.1em] -my-[0.1em] transform-gpu";
    lineOuter.style.perspective = "1000px";

    const lineInner = document.createElement("span");
    lineInner.className =
      "gs-line-inner block transform-gpu will-change-transform";
    
    lineInner.style.backfaceVisibility = "hidden";
    lineInner.style.webkitBackfaceVisibility = "hidden";

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

  el.style.transform = prevTransform;
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

/**
 * Prepares text elements by splitting lines and setting initial GPU-hidden states.
 */
export function useTextReveal(
  scopeRef: RefObject<HTMLElement | null>,
  selector: string,
  options: TextRevealOptions = {}
) {
  const scope = scopeRef.current;
  if (!scope) return;

  const elements = Array.from(scope.querySelectorAll<HTMLElement>(selector));
  if (!elements.length) return;

  const { yPercent = 100 } = options;

  elements.forEach((el) => {
    el.style.visibility = "visible";
    el.style.opacity = "1";

    const lineInners = splitIntoLines(el);

    lineInners.forEach((line) => {
      line.style.transform = `translate3d(0, ${yPercent}%, 0)`;
      line.style.opacity = "0";
      line.style.transition = "none";
    });
  });
}

/**
 * Helper to smoothly animate text reveal on demand.
 */
export function animateTextReveal(
  container: HTMLElement,
  options: TextRevealOptions = {}
) {
  const {
    stagger = 0.05,
    duration = 0.85,
    delay = 0,
    ease = "cubic-bezier(0.16, 1, 0.3, 1)",
  } = options;

  const lineInners = container.querySelectorAll<HTMLElement>(
    ".gs-line-inner, .custom-line-inner"
  );

  lineInners.forEach((line, idx) => {
    const totalDelay = delay + idx * stagger;
    line.style.transition = `transform ${duration}s ${ease} ${totalDelay}s, opacity ${duration}s ${ease} ${totalDelay}s`;
    line.style.transform = "translate3d(0, 0%, 0)";
    line.style.opacity = "1";
  });
}