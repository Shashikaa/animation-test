/**
 * timelineSpeedController.ts
 *
 * Caps how fast a scrubbed GSAP ScrollTrigger timeline can advance or retreat
 * per animation frame. Without this, fast wheel flicks or momentum scrolls
 * teleport the timeline forward by large progress chunks in a single frame —
 * making clipPath reveals, yPercent slides, and scale transitions look like
 * instant jumps rather than smooth animations.
 *
 * How it works
 * ─────────────
 * GSAP's scrub option lerps the timeline's playhead toward the scroll-driven
 * target progress. But that lerp only runs between the current and target
 * progress — it does NOT cap the *rate* at which the target itself moves when
 * the user scrolls very fast. This utility clamps the target so the lerp
 * always has a smooth, bounded ramp to chase.
 *
 * Usage
 * ──────
 *   const controller = createTimelineSpeedController(tl.scrollTrigger!, {
 *     maxProgressPerSecond: 0.25,   // advance ≤ 25% of timeline per second
 *   });
 *   gsap.ticker.add(controller.tick);
 *
 *   // In cleanup:
 *   gsap.ticker.remove(controller.tick);
 *   controller.reset();
 */

import gsap from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

export interface SpeedControllerOptions {
  /**
   * Maximum timeline progress (0–1) that can be covered in one second.
   * 0.20 = the full animation takes at least 5 s of wall-clock time to
   * complete even if the user scrolls instantly to the bottom.
   *
   * Recommended values:
   *   Desktop (wheel):  0.18 – 0.22  → smooth, never feels laggy
   *   Touch (momentum): 0.22 – 0.28  → fast enough to keep up with flicks
   *
   * Default: 0.20
   */
  maxProgressPerSecond?: number;

  /**
   * Whether to also throttle backwards travel (scrolling up).
   * Default: true — keeps reverse transitions just as smooth.
   */
  throttleReverse?: boolean;
}

export interface SpeedController {
  /** Pass to gsap.ticker.add() */
  tick: (time: number, deltaTime: number) => void;
  /** Reset internal state (call before reuse or on cleanup) */
  reset: () => void;
  /** Dynamically change the speed cap at runtime */
  setMaxProgressPerSecond: (v: number) => void;
}

export function createTimelineSpeedController(
  st: ScrollTriggerType,
  options: SpeedControllerOptions = {}
): SpeedController {
  let maxProgressPerSecond = options.maxProgressPerSecond ?? 0.20;
  const throttleReverse    = options.throttleReverse ?? true;

  // The progress value we have actually "allowed" so far.
  // Starts at the timeline's current progress so there's no jump on attach.
  let allowedProgress = st.progress ?? 0;

  const tick = (_time: number, deltaTime: number) => {
    // deltaTime from GSAP ticker is in ms — convert to seconds.
    // Clamped to 24 ms (≈ 42 fps equivalent) rather than 50 ms:
    // a 50 ms cap lets a single dropped frame advance the timeline
    // by 50 ms × maxProgressPerSecond, which at 0.12/s is still
    // 0.006 — enough to visibly lurch on a complex clipPath transition.
    // 24 ms keeps the per-frame budget tight without affecting normal 60 fps.
    const dt = Math.min(deltaTime / 1000, 0.024);

    // The scroll-driven target GSAP wants to reach this frame
    const rawTarget = st.progress;

    const maxStep = maxProgressPerSecond * dt;
    const delta   = rawTarget - allowedProgress;

    if (delta > 0) {
      // Scrolling forward
      allowedProgress = Math.min(allowedProgress + maxStep, rawTarget);
    } else if (delta < 0 && throttleReverse) {
      // Scrolling backward
      allowedProgress = Math.max(allowedProgress - maxStep, rawTarget);
    } else {
      allowedProgress = rawTarget;
    }

    // Force the timeline to the clamped progress.
    // Using st.animation.progress() bypasses GSAP's own scrub lerp for
    // this frame so our cap wins cleanly.
    if (st.animation) {
      st.animation.progress(allowedProgress);
    }
  };

  const reset = () => {
    allowedProgress = st.progress ?? 0;
  };

  const setMaxProgressPerSecond = (v: number) => {
    maxProgressPerSecond = v;
  };

  return { tick, reset, setMaxProgressPerSecond };
}

/**
 * Convenience: attaches the controller to a ScrollTrigger instance and
 * returns a teardown function. Call the teardown in your useEffect cleanup.
 *
 * Example:
 *   const stopControl = attachSpeedController(tl.scrollTrigger!, { maxProgressPerSecond: 0.20 });
 *   return () => { stopControl(); ctx.revert(); };
 */
export function attachSpeedController(
  st: ScrollTriggerType,
  options: SpeedControllerOptions = {}
): () => void {
  const controller = createTimelineSpeedController(st, options);
  gsap.ticker.add(controller.tick);
  return () => {
    gsap.ticker.remove(controller.tick);
    controller.reset();
  };
}