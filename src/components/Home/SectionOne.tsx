"use client";

export default function SectionOne() {
  return (
    <section className="relative w-full h-full overflow-hidden">
      <div
        className="s1-bg absolute left-0 right-0 bg-cover bg-center will-change-transform"
        style={{
          top: "-10%",
          bottom: "-10%",
          backgroundImage: "url('/pool.webp')",
        }}
      />

      <div className="absolute inset-0 bg-black/[0.01]" />

      <div className="section-continer relative z-[1] h-full flex items-start md:items-center px-4 md:px-0 !pt-32 md:!pt-0">
        <div
          className="s1-card w-full max-w-[250px] md:max-w-[320px] lg:max-w-[400px] h-auto md:h-[154px] !pl-6 md:!pl-8 lg:!pl-10  !pr-6 md:!pr-10 lg:!pr-12 !py-6 md:!py-8 flex flex-col justify-center gap-4 will-change-transform"
          style={{
            background: "rgba(25, 33, 28, 0.4)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(42px)",
            boxShadow: "-5px -5px 25px rgba(255,255,255,0.02) inset",
          }}
        >
          <p className="text-[#F4EEDF] font-body leading-[1.5] font-normal ">
            Expert craftsmanship and attention to detail bring your vision to life, delivering seamless pool solutions from concept to completion.
          </p>
        </div>
      </div>
    </section>
  );
}