"use client";

const CARDS = [
  {
    title: "Email Us",
    description: "Send us a message and we will get back to you as soon as possible",
    value: "admin@grandpools.com.au",
    href: "mailto:admin@grandpools.com.au",
  },
  {
    title: "Call Us",
    description: "Contact with us directly, our representative will share any information you need regarding pools",
    value: "0422 630 394",
    href: "tel:0422630394",
  },
  {
    title: "Follow Us",
    description: "Follow us on Instagram for updates. DM us to connect!",
    value: "@grandpool_aus",
    href: "https://instagram.com/grandpool_aus",
  },
];

export default function SectionOne() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-black">
      {/* Background Image Layer — Scaled cleanly at 100%, stretching deep downward */}
      <div
        className="contact-one-bg absolute top-0 left-0 w-full h-[200%] bg-cover bg-top bg-no-repeat will-change-transform"
        style={{ backgroundImage: "url('/contactparalax.webp')" }}
      />
      
      {/* Main Layout Grid Context */}
      {/* Changed md:flex-row to lg:flex-row and md:gap-0 to lg:gap-0 */}
      <div className="section-container relative z-10 w-full h-full flex flex-col lg:flex-row items-stretch justify-between gap-8 lg:gap-0">
        
        {/* LEFT SIDE — Completely Static Title Block */}
        <div className="contact-one-left flex flex-col gap-2 lg:gap-4 justify-start pb-4 select-none !pt-22">
          <h2
            className="contact-one-title text-[#F4EEDF] !font-[100]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Get In Touch
          </h2>
          <p className="contact-one-subtitle text-[#F4EEDF]">
            With Our Team
          </p>
        </div>

        {/* RIGHT SIDE — Relative Frame Container */}
        {/* Changed md:w-[372px] to lg:w-[372px] and md:h-full to lg:h-full */}
        <div 
          className="relative w-full lg:w-[372px] h-auto lg:h-full" 
        >
          {/* Master Scrolling Content Column — Anchored to TOP-0 */}
          {/* Changed md:absolute to lg:absolute */}
          <div className="contact-right-scroll-track relative lg:absolute top-0 right-0 w-full flex flex-col will-change-transform">
            
            {/* 1. Intro Paragraph Block */}
            {/* Changed md:justify-end to lg:justify-end, md:text-right to lg:text-right, md:!pb-16 to lg:!pb-16, and md:h-[... ] to lg:h-[... ] */}
            <div 
              className="w-full flex flex-col justify-start lg:justify-end text-left lg:text-right !pb-8 lg:!pb-16 h-auto lg:h-[calc(100vh-120px)]"
            >
              <p className="text-[#F4EEDF] ">
                Have a question or want to discuss your project? Contact us by phone, email, or connect with us on Instagram we’re always happy to help.
              </p>
            </div>

            {/* 2. Cards Group Layer */}
            {/* Changed md:gap-16 to lg:gap-16 and md:pt-12 to lg:pt-12 */}
            <div className="contact-cards-container flex flex-col gap-12 lg:gap-16 w-full pt-4 lg:pt-12 pb-24">
              {CARDS.map((card) => (
                <div
                  key={card.title}
  
                  className="w-full flex flex-col text-left pr-0 lg:!pr-16"
                >
                  <div className="text-[#F4EEDF]">
                    <p className="!text-[20px] text-[#F4EEDF] !mb-2">
                      {card.title}
                    </p>
                    <p className="font-light leading-relaxed !mb-3 text-[#F4EEDF] ">
                      {card.description}
                    </p>
                    <a
                      href={card.href}
                      className="font-light tracking-wide inline-flex items-center gap-2 hover:underline underline-offset-4 text-[#F4EEDF]"
                    >
                      {card.value} <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}