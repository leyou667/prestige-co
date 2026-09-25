import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VehicleDetail } from "@/components/vehicle/vehicle-detail";
import { CategoryLanding, CityLanding } from "@/components/seo/landing";
import { CATEGORIES, getCategory, getCategoryBySeoSlug } from "@/lib/categories";
import { CITIES, citySeoSlug } from "@/lib/cities";
import { VEHICLES, getVehicleBySlug, vehicleName, vehicleSlug } from "@/lib/vehicles";
import { formatPrice } from "@/lib/utils";

/**
 * Résolveur d'URLs SEO de premier niveau :
 *  /location-porsche-taycan-belgique      → fiche véhicule
 *  /location-voiture-bruxelles            → page ville
 *  /location-supercar-belgique            → page catégorie
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...VEHICLES.map((v) => ({ slug: vehicleSlug(v) })),
    ...CITIES.map((c) => ({ slug: citySeoSlug(c) })),
    ...CATEGORIES.map((c) => ({ slug: c.seoSlug })),
  ];
}

function resolve(slug: string) {
  const vehicle = getVehicleBySlug(slug);
  if (vehicle) return { kind: "vehicle" as const, vehicle };
  const city = CITIES.find((c) => citySeoSlug(c) === slug);
  if (city) return { kind: "city" as const, city };
  const category = getCategoryBySeoSlug(slug);
  if (category) return { kind: "category" as const, category };
  return null;
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const r = resolve(slug);
  if (!r) return {};
  const canonical = `/${slug}`;
  if (r.kind === "vehicle") {
    const v = r.vehicle;
    const name = vehicleName(v, "full");
    const title = `Location ${name} en Belgique — ${formatPrice(v.pricePerDay)}/jour`;
    const description = `Louez la ${name} (${v.powerHp} ch, ${v.fuel.toLowerCase()}, ${v.transmission.toLowerCase()}) avec PRESTIGE CONCIERGERIE dès ${formatPrice(v.pricePerDay)} par jour. Livraison en Belgique, Nord de la France et Paris. ${getCategory(v.category).name}.`;
    const image = v.cardImage ?? v.photos[0]?.src;
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { title, description, url: canonical, images: image ? [{ url: image, alt: `Location ${name}` }] : undefined },
    };
  }
  if (r.kind === "city") {
    const title = `Location de voiture à ${r.city.name} — de l'économique à la supercar`;
    const description = `Location de voitures à ${r.city.name} avec PRESTIGE CONCIERGERIE : citadines, familiales, utilitaires, premium, luxe et supercars livrés à domicile. Devis instantané.`;
    return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical } };
  }
  const c = r.category;
  const title = `Location ${c.name.toLowerCase()} en Belgique — dès ${c.fromPrice} €/jour`;
  const description = `${c.tagline} Location de véhicules de catégorie ${c.code} avec PRESTIGE CONCIERGERIE en Belgique, dans le Nord de la France et à Paris.`;
  return { title, description, alternates: { canonical }, openGraph: { title, description, url: canonical } };
}

export default async function SlugPage({ params }: { params: Params }) {
  const { slug } = await params;
  const r = resolve(slug);
  if (!r) notFound();
  if (r.kind === "vehicle") return <VehicleDetail vehicle={r.vehicle} />;
  if (r.kind === "city") return <CityLanding city={r.city} />;
  return <CategoryLanding category={r.category} />;
}
