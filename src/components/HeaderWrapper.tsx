"use client";
import { useSite } from "../app/context/SiteContext";
import Header from "./Header";

export default function HeaderWrapper() {
  const { menuOpen, setMenuOpen } = useSite();
  return (
    <Header

      /* menuOpen={menuOpen} */
      
      onMenuClick={() => setMenuOpen(true)}
    />
  );
}