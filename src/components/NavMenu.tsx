"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LOGO_COLOR } from "./Header";

interface NavMenuProps {
  open: boolean;
  onClose: () => void;
}

const NAV_LINKS = [
  { label: "Home",     href: "/",         image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1400&q=80" },
  { label: "About",    href: "/about",    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1400&q=80" },
  { label: "Services", href: "/services", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80" },
  { label: "Projects", href: "/projects", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80" },
  { label: "Contact",  href: "/contact",  image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1400&q=80" },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/grandpools_aus/", src: "/ig.svg"       },
  { label: "Facebook",  href: "https://facebook.com",  src: "/Facebook.svg" },
  { label: "LinkedIn",  href: "https://linkedin.com",  src: "/linkedin.svg" },
  { label: "YouTube",   href: "https://youtube.com",   src: "/yt.svg"       },
];

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Close menu"
      className="!absolute !top-7 !left-10 !z-10 !flex !items-center !justify-center !p-1.5 !bg-transparent !border-none !cursor-pointer !opacity-85 hover:!opacity-100 hover:!rotate-90 !transition-[opacity,transform] !duration-200 !ease-in-out"
      style={{ color: LOGO_COLOR }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 1.61716L14.3828 0L7.99997 6.38287L1.61716 0L0 1.61716L6.38287 7.99997L0 14.3828L1.61716 16L7.99997 9.61713L14.3828 16L16 14.3828L9.61713 7.99997L16 1.61716Z" fill="#F4EEDF"/>
      </svg>
    </button>
  );
}

interface Layer { index: number; key: number }

function ImagePanel({ activeIndex, isReverse }: { activeIndex: number; isReverse: boolean }) {
  const [layers, setLayers] = useState<Layer[]>([{ index: 0, key: 0 }]);
  const keyRef       = useRef(1);
  const prevIndexRef = useRef(0);

  useEffect(() => {
    if (activeIndex === prevIndexRef.current) return;
    prevIndexRef.current = activeIndex;
    keyRef.current += 1;
    const newKey = keyRef.current;
    setLayers(prev => {
      const bottom = prev[prev.length - 1];
      return [bottom, { index: activeIndex, key: newKey }];
    });
  }, [activeIndex]);

  const DURATION = 0.85;
  const EASE     = [0.16, 1, 0.3, 1] as const;
  const incomingClipInitial = isReverse ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)";

  return (
    <div className="!relative !w-full !h-full !overflow-hidden">
      {layers.map((layer, i) => {
        const isIncoming = i === layers.length - 1 && layers.length > 1;
        return isIncoming ? (
          <motion.div
            key={layer.key}
            initial={{ clipPath: incomingClipInitial }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: DURATION, ease: EASE }}
            onAnimationComplete={() => setLayers(prev => prev.slice(-1))}
            className="!absolute !inset-0"
          >
            <motion.img
              src={NAV_LINKS[layer.index].image}
              alt={NAV_LINKS[layer.index].label}
              initial={{ scale: 1.12 }}
              animate={{ scale: 1 }}
              transition={{ duration: DURATION, ease: EASE }}
              className="!w-full !h-full !object-cover !block"
            />
          </motion.div>
        ) : (
          <div key={layer.key} className="!absolute !inset-0 !overflow-hidden">
            <motion.img
              src={NAV_LINKS[layer.index].image}
              alt={NAV_LINKS[layer.index].label}
              initial={{ scale: 1 }}
              animate={{ scale: layers.length > 1 ? 1.08 : 1 }}
              transition={{ duration: DURATION, ease: EASE }}
              className="!w-full !h-full !object-cover !block"
            />
          </div>
        );
      })}
    </div>
  );
}

const EASE_IN  = [0.16, 1, 0.3, 1] as const;
const EASE_OUT = [0.76, 0, 0.24, 1] as const;

const containerVariants = {
  hidden:  { y: "-100%", opacity: 0, transition: { duration: 0.55, ease: EASE_OUT } },
  visible: { y: 0,       opacity: 1, transition: { duration: 0.72, ease: EASE_IN  } },
};

const linkContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.22 },
  },
};

const linkVariants = {
  hidden:  { y: 36, opacity: 0 },
  visible: { y: 0,  opacity: 1, transition: { duration: 0.6, ease: EASE_IN } },
};

const ctaVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.55, duration: 0.5, ease: "easeOut" as const } },
};

const bottomVariants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.62, duration: 0.45, ease: "easeOut" as const } },
};

// ── MOBILE MENU ──────────────────────────────────────────────────────────────
function MobileMenu({ open, onClose }: NavMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="nav-menu-mobile"
          ref={menuRef}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="!fixed !z-[2000] !flex !flex-col !w-[100dvw] !h-full !top-0 !left-0"
          style={{
            backdropFilter:       "blur(38.55px) brightness(0.72) saturate(1.6)",
            WebkitBackdropFilter: "blur(38.55px) brightness(0.72) saturate(1.6)",
            background: "radial-gradient(circle, rgba(244,238,223,0.08) 0%, rgba(244,238,223,0) 100%)",
          }}
        >
          <CloseButton onClick={onClose} />

          {/* Nav links */}
          <div className="!flex-1 !flex !flex-col !px-12 !pt-[126px]">
            <motion.nav
              variants={linkContainerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {NAV_LINKS.map(({ label, href }) => (
                <motion.div key={label} variants={linkVariants} className="!overflow-hidden">
                  <a
                    href={href}
                    onClick={onClose}
                    className="!block !no-underline !leading-[2.5] !cursor-pointer"
                  >
                    <span
                      className="font-display !inline-block !select-none !font-normal!text-[28px] !leading-none !text-[#F4EEDF]"
                    >
                      {label}
                    </span>
                  </a>
                </motion.div>
              ))}
            </motion.nav>
          </div>

          {/* Bottom: contact + socials */}
          <motion.div
            variants={bottomVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="!px-10 !pb-[68px]"
          >
            <div className="font-body !mb-6" style={{ color: LOGO_COLOR }}>
              <p className="!m-0 !mb-3 !text-sm">
                <a
                  href="tel:0422630394"
                  className="!no-underline hover:!opacity-70 !transition-opacity !duration-200"
                  style={{ color: LOGO_COLOR }}
                >
                  0422 630 394
                </a>
              </p>
              <p className="!m-0 !text-sm">
                <a
                  href="mailto:admin@grandpools.com.au"
                  className="!no-underline hover:!opacity-70 !transition-opacity !duration-200"
                  style={{ color: LOGO_COLOR }}
                >
                  admin@grandpools.com.au
                </a>
              </p>
            </div>

            <div className="!flex !items-center !gap-4">
              {SOCIAL_LINKS.map(({ label, href, src }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="!flex !opacity-100 hover:!opacity-70 !transition-opacity !duration-200"
                >
                  <img src={src} alt={label} className="!block !w-5 !h-5 !object-contain" />
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── DESKTOP/TABLET MENU ───────────────────────────────────────────────────────
function DesktopMenu({ open, onClose }: NavMenuProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex,  setActiveIndex]  = useState(0);
  const menuRef   = useRef<HTMLDivElement>(null);
  const isHovered = hoveredIndex !== null;
  const isReverse = !isHovered;

  const handleMouseEnter = (i: number) => {
    setHoveredIndex(i);
    if (i !== activeIndex) setActiveIndex(i);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    if (activeIndex !== 0) setActiveIndex(0);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="nav-menu"
          ref={menuRef}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className={[
            "!fixed !z-[2000] !origin-top",
            // Mobile + tablet: full screen cover
            // Desktop (lg+): inset with gaps, side-by-side grid
            "!top-0 lg:!top-8",
            "!bottom-0 lg:!bottom-8",
            "!left-0 lg:!left-16",
            "!right-0 lg:!right-16",
            "!grid",
            "!grid-cols-1 lg:!grid-cols-[50%_1fr]",
            "!p-5",
          ].join(" ")}
          style={{
            backdropFilter:       "blur(48px) brightness(0.72) saturate(1.6)",
            WebkitBackdropFilter: "blur(48px) brightness(0.72) saturate(1.6)",
            background: "rgba(255, 255, 255, 0.04)",
          }}
        >
          {/* ── LEFT PANEL ── */}
          <div className="!relative !flex !flex-col !py-12 !px-0 !w-full !h-full">
            <CloseButton onClick={onClose} />
            <div className="!flex !flex-col !h-full !px-12 lg:!px-0 lg:!mx-auto lg:!w-fit">
              {/* Nav links */}
              <div className="!flex-1 !flex !flex-col !justify-start !pt-[126px] lg:!pt-24">
                <motion.nav
                  variants={linkContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {NAV_LINKS.map(({ label, href }, i) => (
                    <motion.div key={label} variants={linkVariants} className="!overflow-hidden">
                      <NavLink
                        label={label}
                        href={href}
                        isActive={hoveredIndex === i}
                        onClose={onClose}
                        onMouseEnter={() => handleMouseEnter(i)}
                        onMouseLeave={handleMouseLeave}
                      />
                    </motion.div>
                  ))}
                </motion.nav>

                <motion.div variants={ctaVariants} initial="hidden" animate="visible" exit="hidden">
                  <a
                    href="/contact"
                    className="!relative !inline-block !w-fit !pb-2 !text-sm !font-medium !uppercase !text-[#F4EEDF] !no-underline !mt-11 group !transition-opacity !duration-200 hover:!opacity-70"
                  >
                    Get a free consultation
                    <span className="!absolute !left-0 !right-0 !bottom-0 !h-px !bg-[#F4EEDF] !transition-transform !duration-200 group-hover:!-translate-y-0.5" />
                  </a>
                </motion.div>
              </div>

              {/* Bottom contact + socials */}
              <motion.div
                variants={bottomVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className="font-body !mb-6" style={{ color: LOGO_COLOR }}>
                  <p className="!m-0 !mb-1.5 !text-base">
                    <a
                      href="tel:0422630394"
                      className="!no-underline hover:!opacity-70 !transition-opacity !duration-200"
                      style={{ color: LOGO_COLOR }}
                    >
                      0422 630 394
                    </a>
                  </p>
                  <p className="!m-0 !text-base">
                    <a
                      href="mailto:admin@grandpools.com.au"
                      className="!no-underline hover:!opacity-70 !transition-opacity !duration-200"
                      style={{ color: LOGO_COLOR }}
                    >
                      admin@grandpools.com.au
                    </a>
                  </p>
                </div>
                <div className="!flex !items-center !gap-4">
                  {SOCIAL_LINKS.map(({ label, href, src }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="!flex !opacity-100 hover:!opacity-70 !transition-opacity !duration-200"
                    >
                      <img src={src} alt={label} className="!block !w-5 !h-5 !object-contain" />
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* ── RIGHT PANEL — hidden on tablet, visible on desktop ── */}
          <div className="!hidden lg:!block !relative !overflow-hidden !p-5">
            <ImagePanel activeIndex={activeIndex} isReverse={isReverse} />
            <div className="!absolute !inset-0 !z-[1] !pointer-events-none" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── ROOT EXPORT: picks mobile or desktop/tablet ───────────────────────────────
export default function NavMenu({ open, onClose }: NavMenuProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile
    ? <MobileMenu open={open} onClose={onClose} />
    : <DesktopMenu open={open} onClose={onClose} />;
}

// ── NAV LINK (desktop/tablet only) ───────────────────────────────────────────
function NavLink({
  label, href, isActive, onClose, onMouseEnter, onMouseLeave,
}: {
  label: string; href: string; isActive: boolean; onClose: () => void;
  onMouseEnter: () => void; onMouseLeave: () => void;
}) {
  const isCurrentPage = typeof window !== "undefined" && window.location.pathname === href;
  const highlighted = isActive || isCurrentPage;

  return (
    <a
      href={href}
      onClick={onClose}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onMouseEnter}
      onBlur={onMouseLeave}
      className="!block !no-underline !leading-[2.0] !cursor-pointer"
    >
      <span
        className="font-display !inline-block !select-none !pb-[0.18em] !font-normal !not-italic !leading-none !transition-[color,letter-spacing] !duration-[250ms,350ms] !ease-in-out"
        style={{
          fontSize: "clamp(26px, 2.5vw, 32px)",
          color: highlighted ? "#F4EEDF" : "#c4c4c4",
          letterSpacing: highlighted ? "0.01em" : "0",
        }}
      >
        {label}
      </span>
    </a>
  );
}