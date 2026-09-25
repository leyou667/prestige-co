import type { Metadata } from "next";
import { QuoteBuilder, type QuoteInitial } from "@/components/quote/quote-builder";
import { getCity } from "@/lib/cities";
import { sanitizeRange } from "@/lib/utils";
import { getVehicleById } from "@/lib/vehicles";

export const metadata: Metadata = {
  title: "Demander un devis de location",
  description: "Calculez instantanément le prix de votre location avec PRESTIGE CONCIERGERIE : véhicule, ville, dates et options, puis envoyez votre demande sur WhatsApp.",
  alternates: { canonical: "/devis" },
};

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

// Paramètres lus côté serveur : le parcours s'affiche directement à la bonne étape, sans décalage visuel
export default async function DevisPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const vehicle = getVehicleById(one(sp.vehicule));
  const city = getCity(one(sp.ville));
  const { from, to } = sanitizeRange(one(sp.du), one(sp.au));
  const initial: QuoteInitial = {
    vehicleId: vehicle?.id,
    city: city && (!vehicle || vehicle.cities.includes(city.name)) ? city.slug : undefined,
    from: from || undefined,
    to: to || undefined,
  };

  return (
    <div className="container page-top pb-24">
      <div className="max-w-5xl">
        <div className="no-print mb-12">
          <p className="eyebrow">Devis instantané</p>
          <h1 className="mt-3 font-display text-4xl font-light sm:text-5xl">Votre location, calculée en un instant.</h1>
        </div>
        <QuoteBuilder initial={initial} />
      </div>
    </div>
  );
}
