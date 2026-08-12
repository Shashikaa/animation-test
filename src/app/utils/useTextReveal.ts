"use client";

import { RefObject } from "react";

export interface TextRevealOptions {
  yPercent?: number;
  stagger?: number;
  duration?: number;
  rotation?: number;
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

  const textContent = el.textContent || "";
  const words = textContent.trim().split(/\s+/);

  el.innerHTML = words
    .map((word) => `<span class="gs-word-wrapper inline-block overflow-hidden vertical-top"><span class="gs-word inline-block">${word}</span></span>`)
    .join(" ");

  const wordNodes = Array.from(el.querySelectorAll<HTMLElement>(".gs-word"));
  const lineMap = new Map<number, HTMLElement[]>();

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
    lineOuter.className = "gs-line gs-line-outer block overflow-hidden py-[0.1em] -my-[0.1em] will-change-transform";

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
  _options: TextRevealOptions = {}
) {
  const scope = scopeRef.current;
  if (!scope) return;

  const elements = Array.from(scope.querySelectorAll<HTMLElement>(selector));
  if (!elements.length) return;

  elements.forEach((el) => {
    el.style.visibility = "visible";
    el.style.opacity = "1";
    
    // Split DOM into .gs-line-outer and .gs-line-inner wrappers
    const lineInners = splitIntoLines(el);

    // Default hidden position for lines (awaiting JS animation)
    lineInners.forEach((line) => {
      line.style.transform = "translate3d(0, 105%, 0) rotateZ(2deg)";
      line.style.opacity = "0";
    });
  });
}