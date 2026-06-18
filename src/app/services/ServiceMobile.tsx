"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/src/app/context/SiteContext";
import Hero from "@/src/components/Service/Hero";
import SectionOne from "@/src/components/Service/SectionOne";
import SectionTwo from "@/src/components/Service/SectionTwo";

gsap.registerPlugin(ScrollTrigger);

type ServicesMobileProps = {
  preloaderDone: boolean;
};

export default function ServicesMobile({ preloaderDone }: ServicesMobileProps) {
  const { setPreloaderDone } = useSite(); 
  const [introDone, setIntroDone] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    document.body.classList.remove("preloading");
    setPreloaderDone(true);
  }, [setPreloaderDone]);

  useEffect(() => {
    const locked = !preloaderDone || !introDone;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [preloaderDone, introDone]);

  // Set up safe baseline states before animations run
  useLayoutEffect(() => {
    if (!preloaderDone) return;
    const ctx = gsap.context(() => {
      gsap.set(".service-hero-bg", { scale: 1.3 });
      gsap.set([".hero-title", ".hero-desc"], { opacity: 0, y: 30 }); // Matches desktop baseline
      gsap.set(".services-hero-top-layer", { clipPath: "inset(0px 0px 0px 0px)" });
    }, scopeRef);
    return () => ctx.revert();
  }, [preloaderDone]);

  useEffect(() => {
    if (!preloaderDone) return;

    const ctx = gsap.context(() => {
      const masterTl = gsap.timeline();

      // PART A: Auto Intro Reveal (Now matches desktop completely)
      masterTl.to(".service-hero-bg", {
        scale: 1.0,
        duration: 2.2,
        ease: "power2.out",
        onComplete: () => {
          setIntroDone(true);
          setTimeout(() => {
            ScrollTrigger.refresh();
          }, 50);
        }
      }, 0);

      masterTl.to([".hero-title", ".hero-desc"], {
        opacity: 1,
        y: 0,
        duration: 1.4,
        stagger: 0.2,
        ease: "power3.out",
      }, 0.4);

      // PART B: Scrollable Compression Timeline (Bottom-to-Top split)
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".services-hero-master",
          start: "top top",
          end: "+=120%",
          pin: true,
          scrub: 1.2,
          invalidateOnRefresh: true,
        }
      });

      // Fades the text overlay elegantly away as you scrub down
      scrollTl.to(".hero-text-wrap", {
        opacity: 0,
        y: -40,
        duration: 0.5,
      }, 0);

      // Compresses the container frame upward by 320px
      scrollTl.to(".services-hero-top-layer", {
        clipPath: "inset(0px 0px 320px 0px)",
        duration: 1.5,
        ease: "power1.inOut",
      }, 0);

      // Counters with vertical shift to anchor image focus
      scrollTl.to(".service-hero-bg", {
        y: 40,
        duration: 1.5,
        ease: "power1.inOut"
      }, 0);

    }, scopeRef);

    return () => ctx.revert();
  }, [preloaderDone]);

  return (
    <div ref={scopeRef} className="pin-all">
      <Hero isMobile={true} />
<SectionOne/>
<SectionTwo/>
    </div>
  );
}