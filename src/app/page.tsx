"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { useSite } from "./context/SiteContext";

import Hero from "../components/Hero";
import SectionOne from "../components/SectionOne";
import SectionTwo from "../components/SectionTwo";
import SectionThree from "../components/SectionThree";
import SectionFour from "../components/SectionFour";
import SectionFive from "../components/SectionFive";
import PreloaderWrapper from "../components/PreloaderWrapper";
import SectionSix from "../components/SectionSix";
import SectionSeven from "../components/Sectionseven";
import SectionEight from "../components/Sectioneight";
import SectionNine from "../components/SectionNine";

gsap.registerPlugin(ScrollTrigger, Flip);

export default function Home() {
  const { preloaderDone } = useSite();
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!preloaderDone) return;

    const ctx = gsap.context(async () => {

      await Promise.all([
        document.fonts.ready,
        new Promise<void>((resolve) => {
          if (document.readyState === "complete") resolve();
          else window.addEventListener("load", () => resolve(), { once: true });
        }),
      ]);

      // ── Initial States ────────────────────────────────────────────
      gsap.set(".hero",      { yPercent: 0, zIndex: 20 });
      gsap.set(".section-1", { yPercent: 0, zIndex: 10 });

      gsap.set([".s3-bg-2", ".s3-bg-3", ".s3-text-2", ".s3-text-3"], { opacity: 0 });
      gsap.set([".s3-bg-1",  ".s3-text-1"], { opacity: 1 });

      gsap.set([".s3-bar-2", ".s3-bar-3"], { background: "rgba(244,238,223,0.3)" });
      gsap.set(".s3-bar-1", { background: "#F4EEDF" });

      gsap.set(".section-4", { yPercent: 100, visibility: "visible", zIndex: 40 });
      gsap.set(".section-5", { yPercent: 100, visibility: "visible", zIndex: 50 });
      gsap.set(".s5-card", { scale: 1, transformOrigin: "center center" });

      gsap.set([".section-3", ".section-8"], {
        visibility: "hidden",
        clipPath: "inset(100% 0% 0% 0%)",
        zIndex: 30,
      });

      gsap.set(".section-7", { opacity: 1, visibility: "visible", zIndex: 5 });
      gsap.set(".section-9", { opacity: 0, zIndex: 20 });

      gsap.set(".s8-panel-left",  { clipPath: "inset(0% 50% 0% 0%)" });
      gsap.set(".s8-panel-right", { clipPath: "inset(0% 0% 0% 50%)" });

      const FADE = 0.4;

      // ── Grab S9 elements once ─────────────────────────────────────
      const s9Title          = document.querySelector<HTMLElement>(".s9-title")!;
      const s9Para           = document.querySelector<HTMLElement>(".s9-para")!;
      const s9Target         = document.querySelector<HTMLElement>(".s9-title-target")!;
      const s9OriginalParent = s9Title?.parentElement as HTMLElement;

      const TITLE_RESET_STYLES = [
        "position:absolute",
        "z-index:20",
        "color:#F4EEDF",
        "pointer-events:none",
        "top:50%",
        "left:50%",
        "transform:translate(-50%,-50%)",
        "font-size:46px",
        "line-height:1.2",
        "white-space:nowrap",
        "margin:0",
        "padding:0",
      ].join(";");

      const PARA_RESET_STYLES = [
        "position:absolute",
        "z-index:20",
        "color:#F4EEDF",
        "right:4rem",
        "bottom:10rem",
        "max-width:376px",
        "text-align:right",
        "opacity:0",
        "transform:none",
      ].join(";");

      // Stamp initial styles
      if (s9Title) s9Title.style.cssText = TITLE_RESET_STYLES;
      if (s9Para)  s9Para.style.cssText  = PARA_RESET_STYLES;

      // ── Timeline 1: Hero → S1 ─────────────────────────────────────
      gsap.timeline({
        scrollTrigger: {
          trigger: ".pin-hero-s1",
          start: "top top",
          end: "+=1500",
          scrub: 1,
          pin: true,
          pinType: "fixed",
          anticipatePin: 1,
        },
      })
      .to(".hero",      { yPercent: -100, duration: 1, ease: "none" })
      .to(".section-1", { filter: "blur(4px)", opacity: 0.9, duration: 0.5, ease: "power2.inOut" });

      // ── Timeline 2: S2 → S3(×3) → S4 → S5 ───────────────────────
      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: ".pin-s2-s5",
          start: "top top",
          end: "+=5000",
          scrub: 1,
          pin: true,
          pinType: "fixed",
          anticipatePin: 1,
        },
      });

      tl2.set(".section-3", { visibility: "visible" })
         .to(".section-3", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "power2.inOut" })
         .to(".section-2", { scale: 1.05, duration: 1.5, ease: "power2.inOut" }, "<")
         .to({}, { duration: 0.53 })
         .to(".s3-bg-1",   { opacity: 0, duration: FADE, ease: "power1.inOut" })
         .to(".s3-bg-2",   { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<")
         .to(".s3-text-1", { opacity: 0, duration: FADE, ease: "power1.inOut" }, "<")
         .to(".s3-text-2", { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<")
         .to(".s3-bar-1",  { background: "rgba(244,238,223,0.3)", duration: FADE }, "<")
         .to(".s3-bar-2",  { background: "#F4EEDF", duration: FADE }, "<")
         .to({}, { duration: 0.53 })
         .to(".s3-bg-2",   { opacity: 0, duration: FADE, ease: "power1.inOut" })
         .to(".s3-bg-3",   { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<")
         .to(".s3-text-2", { opacity: 0, duration: FADE, ease: "power1.inOut" }, "<")
         .to(".s3-text-3", { opacity: 1, duration: FADE, ease: "power1.inOut" }, "<")
         .to(".s3-bar-2",  { background: "rgba(244,238,223,0.3)", duration: FADE }, "<")
         .to(".s3-bar-3",  { background: "#F4EEDF", duration: FADE }, "<")
         .to({}, { duration: 0.53 })
         .to(".section-4", { yPercent: 0,    duration: 2.0, ease: "power3.inOut" })
         .to({}, { duration: 0.5 })
         .to(".section-3", { yPercent: -100, duration: 1.5, ease: "power2.inOut" })
         .to(".section-4", { yPercent: -100, duration: 1.5, ease: "power2.inOut" }, "<")
         .to(".section-5", { yPercent: 0,    duration: 1.5, ease: "power2.inOut" }, "<");

      let cardTween: gsap.core.Tween | null = null;
      ScrollTrigger.create({
        trigger: ".pin-s2-s5",
        start: "top top",
        end: "+=5000",
        onLeave: () => {
          if (cardTween) cardTween.kill();
          cardTween = gsap.to(".s5-card", {
            scaleX: window.innerWidth  / 577,
            scaleY: window.innerHeight / 623,
            duration: 1.2,
            ease: "power2.inOut",
          });
        },
        onEnterBack: () => {
          if (cardTween) cardTween.kill();
          cardTween = gsap.to(".s5-card", {
            scaleX: 1,
            scaleY: 1,
            duration: 1.2,
            ease: "power2.inOut",
          });
        },
      });

      // ── Timeline 3: S7 → S8 → S9 ─────────────────────────────────
      let s9FlipDone  = false;
      let s9Resetting = false; // guard: prevent double-reset while anim runs

      // ── Reverse FLIP back to center, then clean up DOM ────────────
      // Instead of teleporting, we FLIP the title from its current
      // bottom-right position back to the centered position smoothly,
      // fade out the para, then once done restore DOM to original state.
      function resetS9() {
        // If FLIP never ran there's nothing to reverse
        if (!s9FlipDone) return;
        // If a reset animation is already running, don't start another
        if (s9Resetting) return;

        s9Resetting = true;

        // 1. Fade para out immediately
        gsap.to(s9Para, {
          opacity: 0,
          duration: 0.25,
          ease: "power2.in",
        });

        // 2. Capture the title's CURRENT bottom-right position
        //    (it's inside s9Target right now)
        const currentState = Flip.getState(s9Title);

        // 3. Move title back to original parent and apply centered styles
        //    so Flip.from can animate FROM bottom-right TO center
        s9OriginalParent.appendChild(s9Title);
        gsap.set(s9Title, { clearProps: "all" });
        s9Title.style.cssText = TITLE_RESET_STYLES;

        // 4. Play FLIP from captured bottom-right → new centered position
        Flip.from(currentState, {
          duration: 0.8,
          ease: "power2.inOut",
          scale: true,
          onComplete: () => {
            // 5. After animation: clear any FLIP residue, restamp styles,
            //    reset para, unlock guards
            gsap.set(s9Title, { clearProps: "all" });
            s9Title.style.cssText = TITLE_RESET_STYLES;
            s9Para.style.cssText  = PARA_RESET_STYLES;
            s9FlipDone  = false;
            s9Resetting = false;
          },
        });
      }

      gsap.timeline({
        scrollTrigger: {
          trigger: ".pin-s7-s9",
          start: "top top",
          end: "+=3000",
          scrub: 1,
          pin: true,
          pinType: "fixed",
          anticipatePin: 1,
          onLeave:     () => setupS9Flip(),
          onEnterBack: () => resetS9(),
        },
      })

      // ── Act 1: S8 clips in over S7 ───────────────────────────────
      .set(".section-8", { visibility: "visible" })
      .to(".section-8", {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.5,
        ease: "power2.inOut",
      })
      .to(".section-7", {
        scale: 1.05,
        duration: 1.5,
        ease: "power2.inOut",
      }, "<")
      .to({}, { duration: 0.5 })
      .to(".section-7", {
        visibility: "hidden",
        opacity: 0,
        duration: 0.001,
        ease: "none",
      })

      // ── Act 2: S8 panels wipe, S9 fades in ───────────────────────
      .to(".s8-panel-left", {
        clipPath: "inset(0% 50% 100% 0%)",
        duration: 1.5,
        ease: "power2.inOut",
      })
      .to(".s8-panel-right", {
        clipPath: "inset(100% 0% 0% 50%)",
        duration: 1.5,
        ease: "power2.inOut",
      }, "<")
      .to(".section-9", {
        opacity: 1,
        duration: 1.5,
        ease: "power2.inOut",
      }, "<");

      // ── Section 9 FLIP — forward ──────────────────────────────────
      function setupS9Flip() {
        if (s9FlipDone)  return;
        if (s9Resetting) return; // wait for reverse to finish
        s9FlipDone = true;

        if (!s9Title || !s9Target || !s9Para) return;

        // Capture centered position
        const state = Flip.getState(s9Title);

        // Move to bottom-right target
        s9Target.appendChild(s9Title);
        gsap.set(s9Title, { clearProps: "all" });

        // Animate center → bottom-right, then fade para in
        gsap.timeline()
          .add(
            Flip.from(state, {
              duration: 0.6,
              ease: "power2.inOut",
              scale: true,
            })
          )
          .to(s9Para, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, "-=0.2");
      }

      ScrollTrigger.refresh();

    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  return (
    <div ref={scopeRef}>
      <PreloaderWrapper />

      {/* Pin 1: Hero → S1 */}
      <div className="pin-hero-s1 relative h-screen">
        <div className="section-1 absolute inset-0 z-10">
          <SectionOne />
        </div>
        <div className="hero absolute inset-0 z-20">
          <Hero />
        </div>
      </div>

      {/* Pin 2: S2 → S3 → S4 → S5 */}
      <div className="pin-s2-s5 relative h-screen overflow-hidden">
        <div className="section-2 absolute inset-0 z-10">
          <SectionTwo />
        </div>
        <SectionThree />
        <SectionFour />
        <SectionFive />
      </div>

      {/* S6: plain scroll */}
      <div className="h-screen">
        <SectionSix />
      </div>

      {/*
        Pin 3: S7 → S8 → S9
        z-[5]  section-7  Act 1 bg, snapped hidden once S8 covers it
        z-20   section-9  fades in Act 2, title centered on reveal
        z-30   section-8  clips in (Act 1), left/right panels wipe (Act 2)
      */}
      <div className="pin-s7-s9 relative h-screen overflow-hidden">
        <div className="section-7 absolute inset-0 z-[5]">
          <SectionSeven />
        </div>
        <div className="section-9 absolute inset-0 z-20">
          <SectionNine />
        </div>
        <div className="section-8 absolute inset-0 z-30">
          <SectionEight />
        </div>
      </div>

    </div>
  );
}