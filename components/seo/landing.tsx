import Link from "next/link";
import { Breadcrumbs } from "./breadcrumbs";
import { SectionHeading } from "@/components/home/sections";
import { VehicleGrid } from "@/components/vehicle/vehicle-grid";
import { CAUTION_TEXT, CATEGORIES, type Category } from "@/lib/categories";
import { CITIES, citySeoSlug, type City } from "@/lib/cities";
import { VEHICLES } from "@/lib/vehicles";
import { formatPrice } from "@/lib/utils";

export function CityLanding({ city }: { city: City }) {
  const vehicles = VEHICLES.filter((v) => v.cities.includes(city.name)).sort((a, b) => a.pricePerDay - b.pricePerDay);
  const country = city.country === "BE" ? "Belgique" : "France";
  const others = CITIES.filter((c) => c.slug !== city.slug && c.country === city.country);
  const presentCategories = CATEGORIES.filter((c) => vehicles.some((v) => v.category === c.code));
  return (
    <div className="container pb-24 pt-8 md:pt-12">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Collection", href: "/vehicules" }, { label: city.name, href: `/${citySeoSlug(city)}` }]} />
      <div className="max-w-3xl">
        <p className="eyebrow">{city.region} · {country}</p>
        <h1 className="mt-3 font-display text-4xl font-light leading-tight sm:text-5xl">Location de voiture à {city.name}</h1>
        <p className="mt-5 text-sm leading-relaxed text-white/60 sm:text-base">
          PRESTIGE CONCIERGERIE met à votre disposition {vehicles.length} véhicules à {city.name} et dans ses environs, de la
          citadine économique {vehicles[0] ? `dès ${formatPrice(vehicles[0].pricePerDay)} par jour` : ""} jusqu&apos;aux modèles de
          luxe et supercars. Livraison et reprise à l&apos;adresse de votre choix : domicile, hôtel, gare ou bureau.
        </p>
      </div>

      <nav aria-label="Catégories disponibles" className="mt-8 flex flex-wrap gap-2">
        {presentCategories.map((c) => (
          <Link key={c.code} href={`/vehicules?ville=${city.slug}&categorie=${encodeURIComponent(c.code)}`} className="rounded-full border border-white/15 px-3.5 py-1.5 text-[0.65rem] uppercase tracking-wide2 text-white/75 hover:border-gold/60">
            {c.label} à {city.name}
          </Link>
        ))}
      </nav>

      <h2 className="mb-8 mt-14 title-luxe text-sm text-white/80">Véhicules disponibles à {city.name}</h2>
      <VehicleGrid vehicles={vehicles} city={city.name} query={`ville=${city.slug}`} />

      <section className="mt-20 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-light">Pourquoi louer avec PRESTIGE CONCIERGERIE à {city.name} ?</h2>
          <ul className="mt-6 space-y-3 text-sm text-white/60">
            <li>— Véhicule livré et repris à l&apos;adresse de votre choix à {city.name}.</li>
            <li>— Devis instantané, confirmation rapide sur WhatsApp.</li>
            <li>— Disponibilités synchronisées en temps réel.</li>
            <li>— Caution : {CAUTION_TEXT.toLowerCase()}.</li>
          </ul>
        </div>
        <div>
          <h2 className="title-luxe text-sm text-white/80">Autres villes en {country}</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {others.map((c) => (
              <li key={c.slug}>
                <Link href={`/${citySeoSlug(c)}`} className="inline-block rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:border-white/40 hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

export function CategoryLanding({ category }: { category: Category }) {
  const vehicles = VEHICLES.filter((v) => v.category === category.code).sort((a, b) => a.pricePerDay - b.pricePerDay);
  return (
    <div className="container pb-24 pt-8 md:pt-12">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Collection", href: "/vehicules" }, { label: category.name, href: `/${category.seoSlug}` }]} />
      <SectionHeading as="h1" eyebrow={`Catégorie ${category.code} · dès ${category.fromPrice} € / jour`} title={<span className="block">Location {category.name.toLowerCase()} en Belgique et dans le Nord de la France</span>}>
        {category.tagline} Conditions : {category.minAge} ans minimum et {category.minLicenseYears} ans de permis. Caution : {CAUTION_TEXT.toLowerCase()}.
      </SectionHeading>
      <div className="mt-14">
        <VehicleGrid vehicles={vehicles} />
      </div>
      <nav aria-label="Autres catégories" className="mt-20">
        <h2 className="title-luxe text-sm text-white/80">Autres catégories</h2>
        <ul className="mt-5 flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => c.code !== category.code).map((c) => (
            <li key={c.code}>
              <Link href={`/${c.seoSlug}`} className="inline-block rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:border-white/40 hover:text-white">
                {c.name} — dès {c.fromPrice} €
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
