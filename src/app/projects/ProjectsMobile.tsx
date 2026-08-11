"use client";

import { useRef, useEffect, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectsHero from "../../components/Projects/ProjectsHero";
import { restoreTextReveal } from "@/src/app/utils/useTextReveal";
import SectionOne from "@/src/components/Projects/SectionOne";
import SectionTwo from "@/src/components/Projects/SectionTwo";
import SectionCTA from "@/src/components/SectionCTA";
import Footer from "@/src/components/Footer";
import { useHeroIntro } from "@/src/app/utils/useHeroIntro";

gsap.registerPlugin(ScrollTrigger);

const PX_PER_MAIN_PANEL = 850;
const PX_PER_SUB_STEP = 350;
const PAUSE_PX = 150;
const BASELINE_VH = 800;

function executeMobileSplitting(selector: string) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((element) => {
    const htmlElement = element as HTMLElement;
    if (!htmlElement || htmlElement.dataset.splitComplete === "true") return;

    const rawText = htmlElement.textContent || "";
    const linesArray = rawText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    htmlElement.innerHTML = "";
    linesArray.forEach((lineText) => {
      const wrapper = document.createElement("span");
      wrapper.className = "custom-line-wrap";
      wrapper.style.display = "block";
      wrapper.style.overflow = "hidden";
      wrapper.style.position = "relative";

      const inner = document.createElement("span");
      inner.className = "custom-line-inner";
      inner.style.display = "block";
      inner.textContent = lineText;

      wrapper.appendChild(inner);
      htmlElement.appendChild(wrapper);
    });

    htmlElement.dataset.splitComplete = "true";
  });
}

export default function ProjectsMobile() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const [isSectionTwoActive, setIsSectionTwoActive] = useState(false);

  const { introDone } = useHeroIntro(scopeRef, { isMobile: true });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".projects-hero-master", { yPercent: 0, force3D: true });
      gsap.set(".scroll-para-1", { opacity: 1, visibility: "hidden", force3D: true });

      gsap.set(".section-one-wrapper", { yPercent: 100, zIndex: 20, visibility: "visible", force3D: true });
      gsap.set(".section-two-wrapper", { yPercent: 100, zIndex: 30, visibility: "visible", force3D: true });
      gsap.set(".parallax-img-asset", { yPercent: -20, force3D: true });

      gsap.set(".projects-section-cta", { yPercent: 100, zIndex: 150, visibility: "hidden", force3D: true });
      gsap.set(
        [".projects-section-cta .cta-inner-mobile", ".projects-section-cta .cta-inner-desktop"],
        { opacity: 1, y: 0, pointerEvents: "auto", visibility: "visible" }
      );
      gsap.set(".projects-footer-wrap", { yPercent: 100, zIndex: 151, visibility: "hidden", force3D: true });
    }, scopeRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!introDone) return;

    executeMobileSplitting(".scroll-para-1");

    const isAndroid = /Android/i.test(navigator.userAgent);

    const ctx = gsap.context(() => {
      ScrollTrigger.config({ ignoreMobileResize: true });

      if (!isAndroid) {
        ScrollTrigger.normalizeScroll({
          allowNestedScroll: true,
          lockAxis: true,
        });
      }

      const ACTION = 1.4;
      const DEAD_SCROLL = 0.15;
      const UNIFIED_EASE = "power1.inOut";

      const MAIN_PANELS_COUNT = 4;
      const SUB_STEPS_COUNT = 1;
      const PAUSES_COUNT = 5;

      // Use visualViewport height or fallback to small viewport calculation
      const vh = window.visualViewport?.height || window.innerHeight || BASELINE_VH;
      const scaleFactor = vh / BASELINE_VH;

      const DYNAMIC_SCROLL_TRACK =
        (MAIN_PANELS_COUNT * PX_PER_MAIN_PANEL +
          SUB_STEPS_COUNT * PX_PER_SUB_STEP +
          PAUSES_COUNT * PAUSE_PX) *
        scaleFactor;

      const tl = gsap.timeline({
        defaults: { ease: UNIFIED_EASE, lazy: true },
        scrollTrigger: {
          trigger: ".master-viewport",
          start: "top top",
          end: `+=${DYNAMIC_SCROLL_TRACK}`,
          pin: true,
          pinType: "fixed",
          scrub: isAndroid ? 0.2 : 0.6,
          anticipatePin: 1,
          preventOverlaps: true,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        },
      });

      // --- TRANSITION 1: Hero Text Out -> Text Reveal Para In/Out ---
      tl.set(".scroll-para-1 .custom-line-inner", { opacity: 0, yPercent: 100 }, 0);

      tl.to(".hero-text-wrap", { opacity: 0, y: -30, ease: "power2.in", duration: ACTION * 0.5 }, 0);
      tl.set(".hero-text-wrap", { visibility: "hidden" }, ACTION * 0.5);

      tl.set(".scroll-para-1", { visibility: "visible" }, ACTION * 0.5);
      tl.to(
        ".scroll-para-1 .custom-line-inner",
        {
          opacity: 1,
          yPercent: 0,
          stagger: 0.05,
          duration: ACTION * 0.8,
          ease: "power2.out",
        },
        ACTION * 0.5
      );

      tl.to(
        ".scroll-para-1 .custom-line-inner",
        { opacity: 0, y: -30, ease: "power1.in", duration: ACTION * 0.5 },
        "+=0.2"
      );
      tl.set(".scroll-para-1", { visibility: "hidden" });

      tl.fromTo(
        [".projects-hero-bg", ".about-hero-bg", ".hero-bg-anim"],
        { yPercent: 0 },
        { yPercent: -9, ease: "none", duration: tl.duration() },
        0
      );

      tl.to({}, { duration: DEAD_SCROLL });

      // --- TRANSITION 2: Section One Slide Up ---
      tl.to(".section-one-wrapper", {
        yPercent: 0,
        duration: ACTION * 1.5,
      }, ">");

      tl.to(
        ".projects-hero-master",
        { yPercent: -15, duration: ACTION * 1.5 },
        "<"
      );

      tl.to(
        ".parallax-img-asset",
        {
          yPercent: 20,
          ease: "none",
          duration: ACTION * 1.5,
        },
        "<"
      );

      tl.to({}, { duration: DEAD_SCROLL });

      // --- TRANSITION 3: Section Two Slide Up ---
      tl.to(".section-two-wrapper", {
        yPercent: 0,
        duration: ACTION,
        onStart: () => setIsSectionTwoActive(true),
        onReverseComplete: () => setIsSectionTwoActive(false),
      })
        .to(".section-one-wrapper", { yPercent: -15, duration: ACTION }, "<");

      tl.to({}, { duration: DEAD_SCROLL });

      // --- TRANSITION 4: CTA Slide Up ---
      tl.addLabel("ctaStart", ">")
        .set(".projects-section-cta", { visibility: "visible" }, "ctaStart")
        .fromTo(
          ".projects-section-cta",
          { yPercent: 100 },
          { yPercent: 0, duration: ACTION },
          "ctaStart"
        )
        .to(".section-two-wrapper", { yPercent: -15, duration: ACTION }, "ctaStart");

      tl.to({}, { duration: DEAD_SCROLL });

      // --- TRANSITION 5: Footer Reveal ---
      tl.addLabel("footerStart", ">")
        .set(".projects-footer-wrap", { visibility: "visible" }, "footerStart")
        .fromTo(
          ".projects-footer-wrap",
          { yPercent: 100 },
          {
            yPercent: 0,
            duration: ACTION,
            ease: "power1.out",
          },
          "footerStart"
        );
    }, scopeRef);

    return () => {
      ctx.revert();
      if (!isAndroid) {
        ScrollTrigger.normalizeScroll(false);
      }
      if (scopeRef.current) {
        restoreTextReveal(scopeRef.current, ".scroll-para-1");
      }
    };
  }, [introDone]);

  return (
    <div ref={scopeRef} className="w-full relative min-h-[100svh] overflow-hidden text-white">
      <div
        className="master-viewport pin-all-projects relative w-full h-[100svh] overflow-hidden"
        style={{ visibility: "visible" }}
      >
        {/* Layer 1: Hero Section */}
        <div className="projects-hero-master gpu-accelerated absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
          <ProjectsHero />
        </div>

        {/* Layer 2: Section One */}
        <div
          className="section-one-wrapper gpu-accelerated absolute inset-0 w-full h-full"
          style={{ zIndex: 20 }}
        >
          <SectionOne />
        </div>

        {/* Layer 3: Section Two */}
        <div
          className="section-two-wrapper gpu-accelerated absolute inset-0 w-full h-full"
          style={{ zIndex: 30 }}
        >
          <SectionTwo isActive={isSectionTwoActive} />
        </div>

        {/* Layer 4: Section CTA */}
        <div
          className="projects-section-cta gpu-accelerated absolute inset-x-0 bottom-0 w-full h-auto min-h-[100svh]"
          style={{ zIndex: 150, pointerEvents: "auto", visibility: "hidden" }}
        >
          <SectionCTA />
        </div>

        {/* Layer 5: Footer */}
        <div
          className="projects-footer-wrap gpu-accelerated absolute left-0 bottom-0 w-full"
          style={{ zIndex: 151, pointerEvents: "auto", visibility: "hidden" }}
        >
          <Footer />
        </div>
      </div>
    </div>
  );
}