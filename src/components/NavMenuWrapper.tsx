"use client";
import { useSite } from "../app/context/SiteContext";
import NavMenu from "./NavMenu";

export default function NavMenuWrapper() {
  const { menuOpen, setMenuOpen } = useSite();
  return <NavMenu open={menuOpen} onClose={() => setMenuOpen(false)} />;
}