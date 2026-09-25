import type { Metadata } from "next";
import { Catalogue } from "@/components/vehicle/catalogue";
import { sanitizeRange } from "@/lib/utils";
import type { CatalogueFilters } from "@/lib/catalogue";
import { SectionHeading } from "@/components/ui/section-heading";
import { parseCategory, type CategoryCode } from "@/lib/categories";
import { getCity } from "@/lib/cities";
import { BRANDS } from "@/lib/vehicles";

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
  const city = getCity(one(sp.ville))?.slug;
  const model = one(sp.modele)?.replace(/[^\p{L}\p{N} .+-]/gu, "").slice(0, 40);
  const { from, to } = sanitizeRange(one(sp.du), one(sp.au));
  // Seules les valeurs présentes surchargent les filtres par défaut
  const initial: Partial<CatalogueFilters> = {
    categories,
    ...(city && { city }),
    ...(brand && BRANDS.includes(brand) && { brand }),
    ...(model && { model }),
    ...(from && to && { from, to }),
  };

  return (
    <div className="container page-top pb-24">
      <SectionHeading as="h1" eyebrow="La collection" title="Trouvez le véhicule qui vous ressemble.">
        De la citadine économique à la supercar : chaque véhicule est préparé et livré par PRESTIGE CONCIERGERIE.
      </SectionHeading>
      <div className="mt-12">
        <Catalogue initial={initial} />
      </div>
    </div>
  );
}
