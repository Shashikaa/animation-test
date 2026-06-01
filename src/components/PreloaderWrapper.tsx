"use client";
import { useSite } from "../app/context/SiteContext";
import Preloader from "./Preloader";

export default function PreloaderWrapper() {
  const { preloaderDone, setPreloaderDone } = useSite();

  if (preloaderDone) return null;

  return (
    <Preloader
      onComplete={() => setPreloaderDone(true)}
    />
  );
}