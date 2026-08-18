"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "../app/context/SiteContext";
import NavMenu from "./NavMenu";

export default function NavMenuWrapper() {
  const pathname = usePathname();
  const { menuOpen, setMenuOpen } = useSite();

  // Close menu on every Next.js route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, setMenuOpen]);

  // Close menu immediately on browser Back / Forward
  useEffect(() => {
    const handlePopState = () => {
      setMenuOpen(false);

      // Make sure scroll/menu locks are removed
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };

    const handlePageShow = () => {
      // Important for browser bfcache restoration
      setMenuOpen(false);

      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [setMenuOpen]);

  return (
    <NavMenu
      open={menuOpen}
      onClose={() => setMenuOpen(false)}
    />
  );
}