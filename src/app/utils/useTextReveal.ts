/**
 * useTextReveal
 *
 * Splits every element matching `selector` inside `scope` into
 * per-line <span> wrappers, then animates each line:
 *   - translateY: 30px → 0
 *   - opacity:    0    → 1
 *
 * Pass `static: true` (mobile) to skip splitting entirely and just
 * make the element visible at the timeline position — text stays
 * static, arriving with its section.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RefObject } from "react";

// ❌ REMOVED: gsap.registerPlugin(ScrollTrigger)
// registerPlugin is called inside useEffect in HomeDesktop/HomeMobile,
// which are ssr:false. Calling it here runs during SSR prerender and
// crashes with "document is not defined".

export interface TextRevealOptions {
  /** Pixels to slide up from (default: 30) */
  yOffset?: number;
  /** Stagger between lines in seconds (default: 0.04) */
  stagger?: number;
  /** Ease for each line (default: "power2.out") */
  ease?: string;
  /** Duration per line in timeline units (default: 0.35) */
  duration?: number;
  /** If provided, lines are appended to this timeline */
  tl?: gsap.core.Timeline;
  /** Position in the parent timeline (default: ">") */
  position?: gsap.Position;
  /**
   * When true: skip the line-split animation entirely.
   * The element is hidden until the timeline reaches `position`,
   * then made visible instantly — text arrives with its section.
   * Use this on mobile where section slides are the reveal.
   */
  static?: boolean;
}

function splitIntoLines(el: HTMLElement): HTMLElement[] {
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
    yOffset  = 30,
    stagger  = 0.04,
    ease     = "power2.out",
    duration = 0.35,
    tl,
    position = ">",
    static: isStatic = false,
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
    gsap.set(lineInners, { y: yOffset, opacity: 0 });

    if (tl) {
      tl
        .set(el, { visibility: "visible" }, position)
        .to(
          lineInners,
          { y: 0, opacity: 1, duration, ease, stagger },
          position
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