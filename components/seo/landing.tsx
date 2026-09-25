import Link from "next/link";
import { Breadcrumbs } from "./breadcrumbs";
import { SectionHeading } from "@/components/ui/section-heading";
import { WhatsAppIcon } from "@/components/icons";
import { VehicleGrid } from "@/components/vehicle/vehicle-grid";
import { CAUTION_TEXT, CATEGORIES, type Category } from "@/lib/categories";
import { CITIES, citySeoSlug, type City } from "@/lib/cities";
import { GENERIC_WHATSAPP_MESSAGE, whatsappUrl } from "@/lib/site";
import { VEHICLES } from "@/lib/vehicles";
import { formatPrice } from "@/lib/utils";

/** Bandeau d'appel à l'action commun aux pages ville / catégorie. */
function LandingCta({ title, devisHref = "/devis" }: { title: string; devisHref?: string }) {
  return (
    <section className="section-gap rounded-2xl border border-white/10 bg-anthracite px-6 py-10 text-center sm:px-10 sm:py-14">
      <p className="eyebrow">Réservation</p>
      <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-light leading-tight sm:text-4xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-xl text-sm text-muted">
        Devis instantané en ligne, confirmation de la disponibilité et du tarif final sur WhatsApp. Livraison et reprise à l&apos;adresse de
        votre choix.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href={devisHref} className="btn-gold">
          Demander un devis
        </Link>
        <a href={whatsappUrl(GENERIC_WHATSAPP_MESSAGE)} target="_blank" rel="noopener noreferrer" className="btn-ghost">
          <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> WhatsApp
        </a>
      </div>
    </section>
  );
}

export function CityLanding({ city }: { city: City }) {
  const vehicles = VEHICLES.filter((v) => v.cities.includes(city.name)).sort((a, b) => a.pricePerDay - b.pricePerDay);
  const country = city.country === "BE" ? "Belgique" : "France";
  const others = CITIES.filter((c) => c.slug !== city.slug && c.country === city.country);
  const presentCategories = CATEGORIES.filter((c) => vehicles.some((v) => v.category === c.code));
  return (
    <div className="container page-top pb-24">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Collection", href: "/vehicules" }, { label: city.name, href: `/${citySeoSlug(city)}` }]} />
      <div className="max-w-3xl">
        <p className="eyebrow">
          {city.region} · {country}
        </p>
        <h1 className="mt-3 font-display text-4xl font-light leading-tight sm:text-5xl">Location de voiture à {city.name}</h1>
        <p className="mt-5 text-sm leading-relaxed text-muted sm:text-base">
          PRESTIGE CONCIERGERIE met à votre disposition {vehicles.length} véhicules à {city.name} et dans ses environs, de la citadine
          économique {vehicles[0] ? `dès ${formatPrice(vehicles[0].pricePerDay)} par jour` : ""} jusqu&apos;aux modèles de luxe et
          supercars. Livraison et reprise à l&apos;adresse de votre choix : domicile, hôtel, gare ou bureau.
        </p>
      </div>

      <nav aria-label="Catégories disponibles" className="mt-8 flex flex-wrap gap-2">
        {presentCategories.map((c) => (
          <Link key={c.code} href={`/vehicules?ville=${city.slug}&categorie=${encodeURIComponent(c.code)}`} prefetch={false} className="chip uppercase tracking-wide2">
            {c.label} à {city.name}
          </Link>
        ))}
      </nav>

      <h2 className="title-luxe section-gap mb-8 text-sm text-subtle">Véhicules disponibles à {city.name}</h2>
      <VehicleGrid vehicles={vehicles} city={city.name} query={`ville=${city.slug}`} />

      <section className="section-gap grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-light">Pourquoi louer avec PRESTIGE CONCIERGERIE à {city.name} ?</h2>
          <ul className="mt-6 space-y-3 text-sm text-muted">
            <li>— Véhicule livré et repris à l&apos;adresse de votre choix à {city.name}.</li>
            <li>— Devis instantané, confirmation rapide sur WhatsApp.</li>
            <li>— Disponibilités synchronisées en temps réel.</li>
            <li>— Caution : {CAUTION_TEXT.toLowerCase()}.</li>
          </ul>
        </div>
        <div>
          <h2 className="title-luxe text-sm text-subtle">Autres villes en {country}</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {others.map((c) => (
              <li key={c.slug}>
                <Link href={`/${citySeoSlug(c)}`} prefetch={false} className="chip">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <LandingCta title={`Votre véhicule livré à ${city.name}.`} devisHref={`/devis?ville=${city.slug}`} />
    </div>
  );
}

export function CategoryLanding({ category }: { category: Category }) {
  const vehicles = VEHICLES.filter((v) => v.category === category.code).sort((a, b) => a.pricePerDay - b.pricePerDay);
  return (
    <div className="container page-top pb-24">
      <Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Collection", href: "/vehicules" }, { label: category.name, href: `/${category.seoSlug}` }]} />
      <SectionHeading
        as="h1"
        eyebrow={`Catégorie ${category.code} · dès ${category.fromPrice} € / jour`}
        title={<span className="block">Location {category.name.toLowerCase()} en Belgique et dans le Nord de la France</span>}
      >
        {category.tagline} Conditions : {category.minAge} ans minimum et {category.minLicenseYears} ans de permis. Caution :{" "}
        {CAUTION_TEXT.toLowerCase()}.
      </SectionHeading>
      <div className="mt-14">
        <VehicleGrid vehicles={vehicles} priorityCount={1} />
      </div>

      <LandingCta
        title={vehicles.length <= 2 ? `Une demande particulière en ${category.name.toLowerCase()} ?` : "Réservez en quelques minutes."}
        devisHref={vehicles.length === 1 ? `/devis?vehicule=${vehicles[0].id}` : "/devis"}
      />

      <nav aria-label="Autres catégories" className="section-gap">
        <h2 className="title-luxe text-sm text-subtle">Autres catégories</h2>
        <ul className="mt-5 flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => c.code !== category.code).map((c) => (
            <li key={c.code}>
              <Link href={`/${c.seoSlug}`} prefetch={false} className="chip">
                {c.name} — dès {c.fromPrice} €
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
