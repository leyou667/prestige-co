import { Hero } from "@/components/home/hero";
import { Collection } from "@/components/home/collection";
import { AdvisorSection } from "@/components/home/advisor-section";
import { TrustBar } from "@/components/home/trust-bar";
import { Faq } from "@/components/home/faq";
import { About, Process, Services } from "@/components/home/sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Collection />
      <AdvisorSection />
      <TrustBar />
      <Services />
      <Process />
      <About />
      <Faq />
    </>
  );
}
