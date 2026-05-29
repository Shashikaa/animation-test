"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LOGO_FONT_FAMILY,
  LOGO_FONT_WEIGHT,
  LOGO_COLOR,
} from "./Header";

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
  { label: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
  { label: "Facebook",  href: "https://facebook.com",  icon: FacebookIcon  },
  { label: "LinkedIn",  href: "https://linkedin.com",  icon: LinkedInIcon  },
  { label: "YouTube",   href: "https://youtube.com",   icon: YouTubeIcon   },
];

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#000" opacity="0.6"/>
    </svg>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Close menu"
      className="absolute top-7 left-10 z-10 flex items-center justify-center p-1.5 bg-transparent border-none cursor-pointer transition-[opacity,transform] duration-200 ease-in-out hover:opacity-100 hover:rotate-90"
      style={{ color: LOGO_COLOR, opacity: 0.85 }}
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
  const keyRef              = useRef(1);
  const prevIndexRef        = useRef(0);

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
    <div className="relative w-full h-full overflow-hidden">
      {layers.map((layer, i) => {
        const isIncoming = i === layers.length - 1 && layers.length > 1;
        return isIncoming ? (
          <motion.div
            key={layer.key}
            initial={{ clipPath: incomingClipInitial }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: DURATION, ease: EASE }}
            onAnimationComplete={() => setLayers(prev => prev.slice(-1))}
            className="absolute inset-0"
          >
            <motion.img
              src={NAV_LINKS[layer.index].image}
              alt={NAV_LINKS[layer.index].label}
              initial={{ scale: 1.12 }}
              animate={{ scale: 1 }}
              transition={{ duration: DURATION, ease: EASE }}
              className="w-full h-full object-cover block"
            />
          </motion.div>
        ) : (
          <div key={layer.key} className="absolute inset-0 overflow-hidden">
            <motion.img
              src={NAV_LINKS[layer.index].image}
              alt={NAV_LINKS[layer.index].label}
              initial={{ scale: 1 }}
              animate={{ scale: layers.length > 1 ? 1.08 : 1 }}
              transition={{ duration: DURATION, ease: EASE }}
              className="w-full h-full object-cover block"
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
  hidden:  { scaleY: 0, opacity: 0, transition: { duration: 0.55, ease: EASE_OUT } },
  visible: { scaleY: 1, opacity: 1, transition: { duration: 0.72, ease: EASE_IN  } },
};

const linkContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
};

const linkVariants = {
  hidden:  { y: 48, opacity: 0 },
  visible: { y: 0,  opacity: 1, transition: { duration: 0.6, ease: EASE_IN } },
};

const ctaVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0,  transition: { delay: 0.55, duration: 0.5, ease: "easeOut" as const } },
};

const bottomVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.62, duration: 0.45, ease: "easeOut" as const } },
};

export default function NavMenu({ open, onClose }: NavMenuProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex,  setActiveIndex]  = useState(0);
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
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="nav-menu"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed z-[2000] p-5 box-border grid  origin-top"
          style={{
            top: "32px",
            bottom: "32px",
            left: "64px",
            right: "64px",
            gridTemplateColumns: "50% 1fr",
            backdropFilter:       "blur(48px) brightness(0.72) saturate(1.6)",
            WebkitBackdropFilter: "blur(48px) brightness(0.72) saturate(1.6)",
            background: "rgba(255, 255, 255, 0.04)",
          }}
        >
          {/* ── LEFT PANEL ── */}
          <div className="relative flex flex-col items-center py-12">
            {/* Close button — absolute top-left */}
            <CloseButton onClick={onClose} />

            {/* Nav + CTA — centered, takes all space */}
            <div className="flex-1 flex flex-col justify-center">
              <motion.nav variants={linkContainerVariants} initial="hidden" animate="visible" exit="hidden">
                {NAV_LINKS.map(({ label, href }, i) => (
                  <motion.div key={label} variants={linkVariants} className="overflow-hidden">
                    <NavLink
                      label={label}
                      href={href}
                      onClose={onClose}
                      onMouseEnter={() => handleMouseEnter(i)}
                      onMouseLeave={() => handleMouseLeave()}
                    />
                  </motion.div>
                ))}
              </motion.nav>

              {/* CTA link */}
              <motion.a
                href="/contact"
                variants={ctaVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                onClick={onClose}
                className="inline-block mt-7 pb-1.5 text-[10px] font-medium tracking-[0.22em] uppercase no-underline transition-opacity duration-200 ease-in-out hover:opacity-60"
                style={{
                  fontFamily: "'Montserrat', 'Helvetica Neue', sans-serif",
                  color: LOGO_COLOR,
                  borderBottom: `1px solid ${LOGO_COLOR}`,
                  opacity: 0.9,
                }}
              >
                Get a free consultation
              </motion.a>

              {/* Contact + socials */}
              <motion.div
                variants={bottomVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="mt-8"
              >
                <div className="mb-4 mt-27">
                  <p
                    className="text-[11px] tracking-[0.06em] m-0 mb-1"
                    style={{ fontFamily: "'Montserrat', sans-serif", color: LOGO_COLOR,  }}
                  >
                    0422 630 394
                  </p>
                  <p
                    className="text-[11px] tracking-[0.06em] m-0"
                    style={{ fontFamily: "'Montserrat', sans-serif", color: LOGO_COLOR,  }}
                  >
                    admin@grandpools.com.au
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex transition-opacity duration-200 ease-in-out hover:opacity-100"
                      style={{ color: LOGO_COLOR }}
                    >
                      <Icon />
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="relative overflow-hidden">
            <ImagePanel activeIndex={activeIndex} isReverse={isReverse} />
            {/* Left-edge gradient overlay */}
            <div
              className="absolute inset-0 z-[1] pointer-events-none"
              style={{ background: "linear-gradient(to right, rgba(0,0,0,0.12) 0%, transparent 30%)" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NavLink({ label, href, onClose, onMouseEnter, onMouseLeave }: {
  label: string;
  href: string;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClose}
      onFocus={onMouseEnter}
      onBlur={onMouseLeave}
      className="block no-underline leading-[1.15] mb-[0.1em] cursor-default"
    >
      <span
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseOver={e => {
          (e.currentTarget as HTMLSpanElement).style.opacity       = "1";
          (e.currentTarget as HTMLSpanElement).style.letterSpacing = "0.05em";
        }}
        onMouseOut={e => {
          (e.currentTarget as HTMLSpanElement).style.opacity       = "0.9";
          (e.currentTarget as HTMLSpanElement).style.letterSpacing = "0.01em";
        }}
        className="inline-block text-[32px] transition-[opacity,letter-spacing] duration-[250ms,350ms] ease-in-out cursor-pointer"
        style={{
          fontFamily:    LOGO_FONT_FAMILY,
          fontWeight:    LOGO_FONT_WEIGHT,
          color:         LOGO_COLOR,
          letterSpacing: "0.01em",
          opacity:       0.9,
        }}
      >
        {label}
      </span>
    </a>
  );
}