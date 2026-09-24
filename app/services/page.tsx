import type { Metadata } from "next";
import { Process, SectionHeading, Services } from "@/components/home/sections";

export const metadata: Metadata = {
  title: "Services — conciergerie automobile",
  description: "Livraison et reprise, location de l'économique à la supercar, véhicules pour événements, utilitaires professionnels, chauffeur privé et assistance 7j/7 : les services PRESTIGE CONCIERGERIE.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <div className="container pb-4 pt-10 md:pt-16">
        <SectionHeading as="h1" eyebrow="Services" title="Une conciergerie, pas un simple loueur.">
          De la réservation à la restitution, PRESTIGE CONCIERGERIE prend en charge chaque détail de votre location, en Belgique et dans
          le Nord de la France jusqu&apos;à Paris.
        </SectionHeading>
      </div>
      <Services withHeading={false} />
      <Process />
    </>
  );
}
