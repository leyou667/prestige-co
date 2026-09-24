import type { Metadata } from "next";
import { Suspense } from "react";
import { QuoteBuilder } from "@/components/quote/quote-builder";

export const metadata: Metadata = {
  title: "Demander un devis de location",
  description: "Calculez instantanément le prix de votre location avec PRESTIGE CONCIERGERIE : véhicule, ville, dates et options, puis envoyez votre demande sur WhatsApp.",
  alternates: { canonical: "/devis" },
};

export default function DevisPage() {
  return (
    <div className="container max-w-5xl pb-24 pt-10 md:pt-16">
      <div className="no-print mb-12">
        <p className="eyebrow">Devis instantané</p>
        <h1 className="mt-3 font-display text-4xl font-light sm:text-5xl">Votre location, calculée en un instant.</h1>
      </div>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-anthracite" />}>
        <QuoteBuilder />
      </Suspense>
    </div>
  );
}
