import type { Metadata } from "next";
import { Catalogue } from "@/components/vehicle/catalogue";
import { SectionHeading } from "@/components/home/sections";
import { parseCategory, type CategoryCode } from "@/lib/categories";
import { getCity } from "@/lib/cities";
import { BRANDS } from "@/lib/vehicles";
import { parseISODate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Collection — location de voitures en Belgique, Nord de la France et Paris",
  description:
    "Toute la collection PRESTIGE CONCIERGERIE : citadines, compactes, confort, utilitaires, premium, luxe et supercars. Filtrez par ville, catégorie, marque, prix et puissance.",
  alternates: { canonical: "/vehicules" },
};

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function VehiculesPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const categories = (one(sp.categorie) ?? "")
    .split(",")
    .map((c) => parseCategory(c))
    .filter((c): c is CategoryCode => Boolean(c));
  const brand = one(sp.marque);
  const from = one(sp.du);
  const to = one(sp.au);

  return (
    <div className="container pb-24 pt-10 md:pt-16">
      <SectionHeading as="h1" eyebrow="La collection" title="Trouvez le véhicule qui vous ressemble.">
        De la citadine économique à la supercar : chaque véhicule est préparé et livré par PRESTIGE CONCIERGERIE.
      </SectionHeading>
      <div className="mt-12">
        <Catalogue
          initial={{
            categories,
            city: getCity(one(sp.ville))?.slug,
            brand: brand && BRANDS.includes(brand) ? brand : undefined,
            from: parseISODate(from) ? from : undefined,
            to: parseISODate(to) ? to : undefined,
          }}
        />
      </div>
    </div>
  );
}
