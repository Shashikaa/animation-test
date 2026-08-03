"use client";

import FAQAccordion from "../FAQAccordion"; // Adjust path if needed

const FAQ_ITEMS = [
  {
    question: "Do I need a consultation before starting a project?",
    answer: "Yes, every project starts with a consultation so we can understand your space, goals, and preferences. We’ll discuss ideas, assess your site if needed, and provide expert recommendations to help you move forward confidently.",
  },
  {
    question: "How much does a new pool or renovation cost?",
    answer: "Costs depend on the size, design, and features of your pool. After the consultation, we’ll give you a detailed quote tailored to your needs and budget, with full transparency and no hidden surprises.",
  },
  {
    question: "Which areas do you service?",
    answer: "We work across Melbourne and surrounding suburbs throughout the year. If you’re unsure about your location, get in touch and we’ll let you know if we can help in your area.",
  },
  {
    question: "How long does the process take?",
    answer: "Timeframes vary by project. Minor renovations can take 2–4 weeks, while full custom builds may take several months. We’ll provide a clear schedule and regular updates along the way.",
  },
  {
    question: "Can you help with design ideas and planning?",
    answer: "Yes, we offer complete design support. Whether you know what you want or need guidance, we’ll help you create a custom design that fits your lifestyle, space, and budget.",
  },
];

export default function FAQSection() {
  return (
    <div className="w-full h-full relative overflow-hidden !bg-black flex items-stretch justify-center">
      
      {/* BACKGROUND VIDEO LAYER */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/Grand-Pools-Hero-Video.mp4" type="video/mp4" />
      </video>

      {/* FIGMA-MATCHED LINEAR GRADIENT & BLUR OVERLAY */}
      <div 
        className="absolute top-0 left-0 w-full h-full backdrop-blur-md z-10" 
        style={{
          background: "linear-gradient(60deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.44) 44%, rgba(0, 0, 0, 0) 100%)"
        }}
      />
      
      {/* Main Container — ADD 'faq-content' CLASS HERE */}
      <div className="faq-content section-container relative z-20 w-full h-full flex flex-col lg:flex-row justify-center lg:justify-between gap-16 md:gap-8">
        
        {/* LEFT SIDE — Title offset upwards matching Figma view */}
        <div className="flex flex-col select-none justify-start pt-12 md:!pt-24 lg:!pt-32">
          <h2
            className="!text-[#F4EEDF] font-display !font-[100] "
            style={{ fontFamily: "var(--font-display)" }}
          >
            Still Have <br /> Questions?
          </h2>
        </div>

        {/* RIGHT SIDE — Centered Vertically */}
        <div className="w-full md:max-w-full lg:!max-w-[650px] flex flex-col justify-start lg:justify-center lg:self-center py-2 md:py-6">
          <FAQAccordion items={FAQ_ITEMS} />
        </div>

      </div>
    </div>
  );
}