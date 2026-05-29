"use client";
import { useSite } from "../app/context/SiteContext";
import Header from "./Header";

export default function HeaderWrapper() {
  const { preloaderDone, setMenuOpen, menuOpen } = useSite();
  return (
    <Header
      visible={preloaderDone}
      menuOpen={menuOpen}
      onMenuClick={() => setMenuOpen(true)}
    />
  );
}