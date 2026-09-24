import type { Metadata } from "next";
import { About, Presentation, SectionHeading } from "@/components/home/sections";

export const metadata: Metadata = {
  title: "À propos",
  description: "PRESTIGE CONCIERGERIE, conciergerie automobile présente en Belgique et dans le Nord de la France jusqu'à Paris : notre histoire et nos valeurs.",
  alternates: { canonical: "/a-propos" },
};

export default function AProposPage() {
  return (
    <>
      <div className="container pt-10 md:pt-16">
        <SectionHeading as="h1" eyebrow="À propos" title="Née d'une passion pour l'automobile et le service.">
          PRESTIGE CONCIERGERIE est née d&apos;une conviction simple : louer une voiture devrait être aussi agréable que la conduire. Du
          trajet quotidien à l&apos;événement d&apos;une vie, nous mettons le même soin à chaque location.
        </SectionHeading>
      </div>
      <Presentation />
      <About withHeading={false} />
    </>
  );
}
