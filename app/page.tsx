import { Hero } from "@/components/home/hero";
import { Collection } from "@/components/home/collection";
import { AdvisorSection } from "@/components/home/advisor-section";
import { Journey } from "@/components/home/journey";
import { Conciergerie } from "@/components/home/sections";
import { Faq } from "@/components/home/faq";
import { FinalCta } from "@/components/home/final-cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Collection />
      <AdvisorSection />
      <Journey />
      <Conciergerie />
      <Faq />
      <FinalCta />
    </>
  );
}
