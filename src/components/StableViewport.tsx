"use client";

import { useEffect } from "react";

export default function StableViewport() {
  useEffect(() => {
    /*
     * Capture the viewport ONCE.
     *
     * Do not update this inside resize.
     *
     * Mobile Chrome/Safari fire resize events when their browser
     * toolbar/address bar appears or disappears.
     *
     * Updating the height there causes:
     *
     * address bar
     *      ↓
     * resize
     *      ↓
     * viewport changes
     *      ↓
     * GSAP pin changes
     *      ↓
     * visual jump
     */

    const setInitialViewportHeight = () => {
      const height = window.innerHeight;

      document.documentElement.style.setProperty(
        "--stable-vh",
        `${height}px`
      );
    };

    setInitialViewportHeight();
  }, []);

  return null;
}