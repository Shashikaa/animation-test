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
    title: "Privacy Policy & Data Collection",
    content:
      "Grand Pools collects personal information—including names, email addresses, phone numbers, and site location details—strictly to process site consultations, project quotes, and architectural inquiries in accordance with the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth). Your data is stored securely and is never sold to third-party marketing brokers.",
  },
  {
    title: "Cookie & Tracking Policy",
    content:
      "We use essential and analytical cookies to improve site performance, measure audience traffic, and refine project showcase assets. You can manage or disable cookie preferences directly through your browser settings without restricting core site functionality.",
  },
  {
    title: "Third-Party Services & Integrations",
    content:
      "Certain functionality, including analytics tools and interactive booking forms, may rely on trusted third-party providers. These external platforms adhere to strict data security standards aligned with Australian Privacy Principles (APPs) and applicable privacy compliance regulations.",
  },
  {
    title: "Terms & Conditions of Engagement",
    content:
      "By using this website, requesting design quotes, or engaging with our pool design services, you agree to comply with our client code of conduct and standard service agreements. Structural specifications and renderings presented on this platform are for general illustration until backed by a signed contract.",
  },
  {
    title: "Intellectual Property Rights",
    content:
      "All custom pool designs, imagery, brand copy, architectural renderings, and digital media hosted on this site are the exclusive intellectual property of Grand Pools. Unauthorised copying, distribution, or reproduction is strictly prohibited.",
  },
  {
    title: "Updates to Policy Terms",
    content:
      "Grand Pools reserves the right to amend or update these policies periodically to reflect evolving legal guidelines or operational requirements. We recommend reviewing this page periodically to remain informed of any updates.",
  },
];

export default function PrivacyPolicyPage() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // ── DESKTOP VIEWPORT (min-width: 1024px) ──
      mm.add("(min-width: 1024px)", () => {
        const section = sectionRef.current;
        const wrapper = scrollWrapperRef.current;
        const content = scrollContentRef.current;

        if (!section || !wrapper || !content) return;

        const getScrollAmount = () => content.scrollHeight - wrapper.clientHeight;

        gsap.to(content, {
          y: () => -getScrollAmount(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${getScrollAmount()}`,
            pin: true,
            scrub: 1.2,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
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
        {/* Fixed Background Image */}
        <div
          className="hero-bg-wrapper fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden"
          style={{ clipPath: "inset(0% 0% 0% 0%)" }}
        >
          <div
            className="hero-bg absolute inset-0 bg-cover bg-center bg-[url('/sectiontwo.webp')]"
            style={{ transform: "scale(1)", transformOrigin: "center center" }}
          />
        </div>

        {/* Full Screen Privacy Policy Section */}
        <section
          ref={sectionRef}
          className="hero relative w-full h-screen bg-transparent overflow-hidden z-10"
        >
          {/* Policy Content Container */}
          <div className="section-container relative h-full w-full flex flex-col lg:flex-row justify-between gap-18 px-6 lg:px-16 py-16">
            
            {/* Left Column */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between h-full">
              <div>
                <h1 className="font-display text-[#F4EEDF] text-4xl lg:text-6xl leading-tight select-none">
                  Privacy Policy
                </h1>
                <p className="font-body text-[#F4EEDF] !mt-6 max-w-md text-sm sm:text-base leading-relaxed">
                  Privacy, data protection, and transparency standards for clients and
                  website visitors. Here you can find clear information about how
                  Grand Pools handles personal data, client communications, third-party
                  integrations, and cookie policies.
                </p>
              </div>

              {/* Contact Information with Purpose Heading & Intro */}
              <div className="flex flex-col gap-3 font-body text-[#F4EEDF] !mt-8 lg:mt-0">
                <div>
                  <h3 className="text-base font-bold tracking-wide text-[#F4EEDF]">
                    Legal & Privacy Inquiries
                  </h3>
        
                </div>

                <div className="flex flex-col gap-2 text-sm sm:text-base pt-1">
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
            </div>

            {/* Right Column (Inner Scroll Content) */}
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
        </section>

        {/* Footer Section Row */}
        <div className="footer-section-row relative w-full z-10 bg-transparent">
          <Footer />
        </div>
      </main>
    </div>
  );
}