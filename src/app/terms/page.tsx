"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/src/components/Footer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const policySections = [
  {
    title: "Terms & Conditions of Engagement",
    content:
      "By using this website, requesting design quotes, or engaging with our pool design services, you agree to comply with our client code of conduct and standard service agreements. Structural specifications and renderings presented on this platform are for general illustration until backed by a signed contract.",
  },
  {
    title: "Intellectual Property Rights",
    content:
      "All custom pool designs, imagery, brand copy, architectural renderings, and digital media hosted on this site are the exclusive intellectual property of Grand Pools Australia. Unauthorized copying, distribution, or reproduction is strictly prohibited.",
  },
  {
    title: "Privacy Policy & Data Collection",
    content:
      "Grand Pools collects personal information—including names, email addresses, phone numbers, and site location details—strictly to process site consultations, project quotes, and architectural inquiries. Your data is stored securely and is never sold to third-party marketing brokers.",
  },
  {
    title: "Cookie & Tracking Policy",
    content:
      "We use essential and analytical cookies to improve site performance, measure audience traffic, and refine project showcase assets. You can manage or disable cookie preferences directly through your browser settings without restricting core site functionality.",
  },
  {
    title: "Third-Party Services & Integrations",
    content:
      "Certain functionality, including analytics tools and interactive booking forms, may rely on trusted third-party providers. These external platforms adhere to strict data security standards aligned with privacy compliance regulations.",
  },
  {
    title: "Updates to Policy Terms",
    content:
      "Grand Pools reserves the right to amend or update these policies periodically to reflect evolving legal guidelines or operational requirements. We recommend reviewing this page periodically to remain informed of any updates.",
  },
];

export default function TermsPage() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Hardware Acceleration setup
      gsap.set(".terms-footer-wrap", {
        yPercent: 100,
        visibility: "hidden",
        force3D: true,
      });

      gsap.set(".section-container", {
        autoAlpha: 1,
        y: 0,
        force3D: true,
      });

      // ── DESKTOP VIEWPORT (min-width: 1024px) ──
      mm.add("(min-width: 1024px)", () => {
        const section = sectionRef.current;
        const wrapper = scrollWrapperRef.current;
        const content = scrollContentRef.current;

        if (!section || !wrapper || !content) return;

        const getScrollAmount = () => content.scrollHeight - wrapper.clientHeight;
        const TEXT_END_PROGRESS = 3 / 4.2;

        const tl = gsap.timeline({
          defaults: { ease: "none", lazy: true },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=3500",
            scrub: 1.2,
            pin: true,
            pinType: "fixed",
            anticipatePin: 1,
            invalidateOnRefresh: true,
            fastScrollEnd: true,
            snap: {
              snapTo: (progress) => {
                if (progress < TEXT_END_PROGRESS - 0.03) {
                  return progress;
                }
                return progress > TEXT_END_PROGRESS + 0.15 ? 1 : TEXT_END_PROGRESS;
              },
              duration: { min: 0.25, max: 0.5 },
              delay: 0.02,
              ease: "power2.inOut",
            },
          },
        });

        tl.to(content, {
          y: () => -getScrollAmount(),
          duration: 3,
        });

        tl.addLabel("footerStart")
          .to(
            ".section-container",
            {
              autoAlpha: 0,
              y: -30,
              duration: 1,
              ease: "power1.inOut",
            },
            "footerStart"
          )
          .set(".terms-footer-wrap", { visibility: "visible" }, "footerStart")
          .fromTo(
            ".terms-footer-wrap",
            { yPercent: 100 },
            { yPercent: 0, duration: 1.2, ease: "power2.inOut" },
            "footerStart"
          );
      });

      // ── MOBILE VIEWPORT (< 1023px) ──
      mm.add("(max-width: 1023px)", () => {
        const section = sectionRef.current;
        if (!section) return;

        const mobileTl = gsap.timeline({
          defaults: { ease: "none", lazy: true },
          scrollTrigger: {
            trigger: section,
            start: "bottom bottom", // Trigger ONLY after mobile user reaches the bottom
            end: "+=600",           // Dedicated pin track for footer slide
            scrub: 1.2,
            pin: true,
            pinType: "fixed",
            anticipatePin: 1,
            invalidateOnRefresh: true,
            fastScrollEnd: true,
          },
        });

        mobileTl
          .addLabel("footerStart")
          .to(
            ".section-container",
            {
              autoAlpha: 0,
              y: -20,
              duration: 1,
              ease: "power1.inOut",
            },
            "footerStart"
          )
          .set(".terms-footer-wrap", { visibility: "visible" }, "footerStart")
          .fromTo(
            ".terms-footer-wrap",
            { yPercent: 100 },
            { yPercent: 0, duration: 1.2, ease: "power2.inOut" },
            "footerStart"
          );
      });
    }, scopeRef);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={scopeRef}>
      <main className="relative w-full bg-[#10221C] min-h-screen">
        <section
          ref={sectionRef}
          className="hero relative w-full lg:h-screen min-h-screen bg-transparent overflow-hidden"
        >
          <div
            className="hero-bg-wrapper absolute inset-0 w-full h-full z-10 pointer-events-none overflow-hidden"
            style={{ clipPath: "inset(0% 0% 0% 0%)" }}
          >
            <div
              className="hero-bg absolute inset-0 bg-cover bg-center bg-[url('/sectiontwo.webp')]"
              style={{ transform: "scale(1)", transformOrigin: "center center" }}
            />
          </div>

          <div 
            className="section-container relative h-full w-full flex flex-col lg:flex-row justify-between gap-18 z-20 px-6 lg:px-16 py-16"
            style={{ willChange: "transform, opacity" }}
          >
            <div className="w-full lg:w-1/2 flex flex-col justify-between">
              <div>
                <h1 className="font-display text-[#F4EEDF] text-4xl lg:text-6xl leading-tight select-none">
                  Terms of Use
                </h1>
                <p className="font-body text-[#F4EEDF] !mt-6 max-w-md text-sm sm:text-base leading-relaxed">
                  Terms, conditions, and important service agreements for clients,
                  website visitors, and project partners. Here you can find clear
                  information about engagement rules, client obligations, intellectual
                  property rights, and legal responsibilities.
                </p>
              </div>

              <div className="flex flex-col gap-4 font-body text-[#F4EEDF] text-sm sm:text-base !mt-8 lg:mt-0">
                <a
                  href="tel:0422630394"
                  className="hover:opacity-75 transition-opacity duration-200 w-fit"
                >
                  0422 630 394
                </a>
                <a
                  href="mailto:hello@grandpools.com.au"
                  className="hover:opacity-75 transition-opacity duration-200 w-fit"
                >
                  hello@grandpools.com.au
                </a>
                <a
                  href="https://www.instagram.com/grandpools_aus/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="mt-1 hover:opacity-75 transition-opacity duration-200 w-fit"
                >
                  <img
                    src="/ig.svg"
                    alt="Instagram"
                    className="w-5 h-5 object-contain"
                  />
                </a>
              </div>
            </div>

            <div className="w-full lg:w-5/12 flex items-center h-full">
              <div
                ref={scrollWrapperRef}
                className="w-full h-auto lg:h-[520px] lg:overflow-hidden relative py-4"
              >
                <div
                  ref={scrollContentRef}
                  className="w-full flex flex-col gap-8 text-[#F4EEDF] lg:pr-6 pb-12 lg:pb-24"
                >
                  {policySections.map((item, index) => (
                    <div key={index} className="flex flex-col gap-3 flex-shrink-0">
                      <h3 className="text-lg md:text-xl font-body font-medium tracking-wide text-[#F4EEDF]">
                        {item.title}
                      </h3>
                      <p className="font-body text-[#F4EEDF] text-xs sm:text-sm leading-relaxed lg:max-w-md">
                        {item.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            className="terms-footer-wrap gpu-accelerated absolute left-0 bottom-0 w-full z-[100] pointer-events-auto flex flex-col justify-end"
            style={{ visibility: "hidden", willChange: "transform, opacity" }}
          >
            <Footer />
          </div>
        </section>
      </main>
    </div>
  );
}