"use client";
import { useSite } from "../app/context/SiteContext";
import Header from "./Header";

export default function HeaderWrapper() {
  const { menuOpen, setMenuOpen, preloaderDone } = useSite();

  return (
    <Header
      logoVisible={preloaderDone}
      menuOpen={menuOpen}
      onMenuClick={() => setMenuOpen(true)}
    />
  );
}