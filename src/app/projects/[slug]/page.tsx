"use client";

import { useEffect, useState, use } from "react";
import { notFound } from "next/navigation";
import { useSite } from "@/src/app/context/SiteContext";

import { GRAND_POOLS_DATA } from "./data";
import SingleProjectPageDesktop from "./SingleProjectPageDesktop";
import SingleProjectPageMobile from "./SingleProjectPageMobile";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function SubServicePage({ params }: PageProps) {
  const { slug } = use(params); 
  const pageData = GRAND_POOLS_DATA[slug];
  
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const { preloaderDone } = useSite();

  // Instantly trigger a 404 page if someone types an invalid slug
  if (!pageData) {
    notFound();
  }

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1025);
    check();
    
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Prevent flash or hydration mismatch while window width resolves
  if (isMobile === null) {
    return <div className="h-screen w-full bg-[#131313]" />;
  }

  return (
    <>
      {isMobile ? (
        <SingleProjectPageMobile pageData={pageData} preloaderDone={preloaderDone} />
      ) : (
        <SingleProjectPageDesktop pageData={pageData} preloaderDone={preloaderDone} />
      )}
    </>
  );
}