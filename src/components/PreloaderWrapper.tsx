"use client";
import { useEffect } from "react";
import Preloader from "./Preloader";
import { useSite } from "../app/context/SiteContext";

export default function PreloaderWrapper() {
  const { setPreloaderDone } = useSite();

  useEffect(() => {
    document.body.classList.remove("preloading");
  }, []);

  return (
    <Preloader onComplete={() => setPreloaderDone(true)} />
  );
}