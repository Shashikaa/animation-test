/**
 * useTextReveal
 *
 * Splits every element matching `selector` inside `scope` into
 * per-line <span> wrappers, then animates each line:
 *   - translateY: 30px → 0
 *   - opacity:    0    → 1
 *
 * FIX: Before splitting, any inline opacity/transform on the parent
 * element is cleared. This prevents scrubbed line animations from
 * fighting an outer gsap.set() that left opacity:0 or translateY on
 * the container.
 *
 * FIX: padding-bottom / margin-bottom on gs-line so descenders
 * (g, y, p, q) are never clipped by overflow:hidden.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RefObject } from "react";

gsap.registerPlugin(ScrollTrigger);

export interface TextRevealOptions {
  /** Pixels to slide up from (default: 30 — reduced from 40 for snappier feel) */
  yOffset?: number;
  /** Stagger between lines in seconds (default: 0.04) */
  stagger?: number;
  /** Ease for each line (default: "power2.out") */
  ease?: string;
  /**
   * Duration per line in timeline units (default: 0.35).
   * Kept intentionally short — on a scrubbed timeline each unit
   * maps to real scroll distance, so 0.35 feels crisp without
   * the lines lagging noticeably behind the scroll.
   * The per-line stagger is what gives the cascade feeling.
   */
  duration?: number;
  /**
   * If provided, lines are appended to this timeline instead of
   * creating a standalone ScrollTrigger animation.
   */
  tl?: gsap.core.Timeline;
  /** Position in the parent timeline (default: ">") */
  position?: gsap.Position;
}

/**
 * Splits text nodes inside `el` into line-level <span>s.
 * Returns an array of those spans so GSAP can target them.
 */
function splitIntoLines(el: HTMLElement): HTMLElement[] {
  el.dataset.originalHtml = el.innerHTML;

el.style.transform = "none";

  // Step 1: wrap every word
  el.innerHTML = el.innerHTML.replace(/(\S+)/g, '<span class="gs-word">$1</span>');

  const words = Array.from(el.querySelectorAll<HTMLElement>(".gs-word"));

  // Step 2: group words by vertical position (= same line)
  const lineMap = new Map<number, HTMLElement[]>();
  words.forEach((w) => {
    const top = Math.round(w.getBoundingClientRect().top);
    if (!lineMap.has(top)) lineMap.set(top, []);
    lineMap.get(top)!.push(w);
  });

  // Step 3: rebuild as line wrappers
  const lines = Array.from(lineMap.values());
  el.innerHTML = "";

  const lineInners: HTMLElement[] = [];

  lines.forEach((group) => {
    const lineOuter = document.createElement("span");
    lineOuter.className = "gs-line";
    // padding-bottom gives room for descenders (g, y, p, q, j).
    // negative margin-bottom cancels the extra space visually.
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

/** Restore original HTML (call in GSAP ctx.revert or component cleanup) */
export function restoreTextReveal(scope: HTMLElement, selector: string) {
  scope.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    if (el.dataset.originalHtml !== undefined) {
      el.innerHTML = el.dataset.originalHtml;
      delete el.dataset.originalHtml;
      el.style.opacity = "";
      el.style.transform = "";
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
    yOffset  = 30,
    stagger  = 0.04,
    ease     = "power2.out",
    duration = 0.35,
    tl,
    position = ">",
  } = options;

  const scope = scopeRef.current;
  if (!scope) return;

  const elements = Array.from(scope.querySelectorAll<HTMLElement>(selector));
  if (!elements.length) return;

  elements.forEach((el) => {
    // ── Keep parent invisible until reveal fires ──────────────
    el.style.visibility = "hidden";

    const lineInners = splitIntoLines(el);
    gsap.set(lineInners, { y: yOffset, opacity: 0 });

    if (tl) {
      tl
        // Unhide the parent exactly when the reveal position is reached
        .set(el, { visibility: "visible" }, position)
        .to(
          lineInners,
          { y: 0, opacity: 1, duration, ease, stagger },
          position   // same position — fires together
        );
    } else {
      gsap.to(lineInners, {
        y: 0, opacity: 1, duration, ease, stagger,
        onStart: () => { el.style.visibility = "visible"; },
        scrollTrigger: {
          trigger:       el,
          start:         "top 85%",
          end:           "top 50%",
          toggleActions: "play none none reverse",
        },
      });
    }
  });
}