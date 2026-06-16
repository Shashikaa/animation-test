"use client";

import Preloader from "@/src/components/About/Preloader";
import Hero from "@/src/components/About/Hero";
import SectionCTA from "@/src/components/SectionCTA";
import { useEffect } from "react";
import SectionOne from "@/src/components/About/SectionOne";
import SectionTwo from "@/src/components/About/SectionTwo";
import SectionThree from "@/src/components/About/SectionThree";
import SectionFour from "@/src/components/About/SectionFour";
import SectionFive from "@/src/components/About/SectionFive";
export default function Home() {


  return (
    <main style={{ overflow: "hidden" }}>
      
<Preloader/>
<Hero/>
<SectionOne/>
<SectionTwo/>
<SectionThree/>
<SectionFour/>
<SectionFive/>
    </main>
  );
}