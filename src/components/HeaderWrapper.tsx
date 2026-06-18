"use client";

import { useSite } from "../app/context/SiteContext";
import { usePathname } from "next/navigation";
import Header from "./Header";

export default function HeaderWrapper() {
  const { menuOpen, setMenuOpen, preloaderDone } = useSite();
  const pathname = usePathname();

  const isHome = pathname === "/";

  return (
    <Header
      // If on Home page, hide logo until preloader is done. Otherwise, keep it always visible.
      logoVisible={isHome ? preloaderDone : true}
      menuOpen={menuOpen}
      onMenuClick={() => setMenuOpen(true)}
    />
  );
}