import Link from "next/link";
import { CalendarDays, Cog, DoorOpen, Fuel, Gauge, MapPin, ShieldCheck, Users } from "lucide-react";
import { Gallery } from "./gallery";
import { BookingCalendar, BookingForm, BookingProvider, MobileBookingBar } from "./booking-panel";
import { VehicleGrid } from "./vehicle-grid";
import { VehicleTiltCard } from "./vehicle-tilt-card";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { CAUTION_TEXT, conditionsSummary, getCategory } from "@/lib/categories";
import { citiesForVehicle, citySeoSlug } from "@/lib/cities";
import { SITE } from "@/lib/site";
import { cn, formatPrice } from "@/lib/utils";
import { VEHICLES, vehicleHref, vehicleName, type Vehicle } from "@/lib/vehicles";

/** Suggestions : même catégorie d'abord, puis les véhicules au prix le plus proche. */
function similarVehicles(vehicle: Vehicle, count = 4) {
  const distance = (v: Vehicle) => (v.category === vehicle.category ? 0 : 1) * 1e6 + Math.abs(v.pricePerDay - vehicle.pricePerDay);
  return VEHICLES.filter((v) => v.id !== vehicle.id)
    .sort((a, b) => distance(a) - distance(b))
    .slice(0, count);
}

export function VehicleDetail({ vehicle }: { vehicle: Vehicle }) {
  const category = getCategory(vehicle.category);
  const name = vehicleName(vehicle);
  const similar = similarVehicles(vehicle);
  const cities = citiesForVehicle(vehicle);

  const specs = [
    { icon: CalendarDays, label: "Année", value: vehicle.year },
    { icon: Gauge, label: "Puissance", value: `${vehicle.powerHp} ch` },
    { icon: Cog, label: "Moteur", value: vehicle.engine },
    { icon: Fuel, label: "Carburant", value: vehicle.fuel },
    { icon: Cog, label: "Transmission", value: vehicle.transmission },
    { icon: Users, label: "Places", value: vehicle.seats },
    { icon: DoorOpen, label: "Portes", value: vehicle.doors },
    { icon: ShieldCheck, label: "Catégorie", value: `${category.name} (${vehicle.category})` },
    { icon: MapPin, label: "Ville", value: vehicle.baseCity },
    { icon: CalendarDays, label: "Disponibilité", value: vehicle.available ? "Disponible — voir le calendrier" : "Sur demande" },
  ];

  const url = `${SITE.url}${vehicleHref(vehicle)}`;
  const images = (vehicle.photos.length ? vehicle.photos.map((p) => p.src) : [vehicle.cardImage].filter(Boolean)).map((s) => `${SITE.url}${s}`);

  return (
    <div className="container page-top pb-28 md:pb-24">
      <Breadcrumbs
        items={[
          { label: "Accueil", href: "/" },
          { label: "Collection", href: "/vehicules" },
          { label: category.name, href: `/${category.seoSlug}` },
          { label: name, href: vehicleHref(vehicle) },
        ]}
      />

      <BookingProvider vehicle={vehicle}>
        {/* a. En-tête */}
        <header className="mb-6">
          <p className="eyebrow">
            {category.name} · Catégorie {vehicle.category}
          </p>
          <h1 className="mt-3 font-display text-4xl font-light leading-tight sm:text-5xl">
            Location {name}
            {vehicle.variant && <span className="text-muted"> — {vehicle.variant}</span>}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-2xs uppercase tracking-[0.1em]",
                vehicle.available ? "border-silver/40 text-silver" : "border-white/20 text-muted",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", vehicle.available ? "bg-emerald-400/80" : "bg-white/40")} />
              {vehicle.available ? "Disponible" : "Sur demande"}
            </span>
            <p className="nums">
              <span className="font-display text-3xl text-gold">{formatPrice(vehicle.pricePerDay)}</span>
              <span className="text-sm text-muted"> / jour</span>
            </p>
          </div>
        </header>

        {/* b. Demande de devis / réservation, visible sans défiler */}
        <section id="reserver" className="scroll-mt-[calc(var(--header-h)+1rem)]" aria-labelledby="reserver-titre">
          <h2 id="reserver-titre" className="sr-only">
            Demander un devis ou réserver
          </h2>
          <BookingForm />
        </section>

        {/* c. Galerie photo */}
        <div className="section-gap">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="sr-only">Photos du véhicule</h2>
          <Gallery vehicle={vehicle} />
        </div>
        <aside className="flex flex-col items-center gap-10 lg:col-span-5 lg:items-stretch">
          <VehicleTiltCard vehicle={vehicle} variant="focus" ctaLabel="Demander un devis" ctaHref={`/devis?vehicule=${vehicle.id}`} className="mb-6" />
          <ul className="flex w-full flex-wrap justify-center gap-2">
            {vehicle.features.map((f) => (
              <li key={f} className="chip hover:border-white/10 hover:text-subtle">
                {f}
              </li>
            ))}
          </ul>
        </aside>
      </div>

        </div>

        {/* Puis le reste : description, caractéristiques, conditions, disponibilités */}
        <p className="section-gap max-w-3xl text-sm leading-relaxed text-muted sm:text-base">{vehicle.description}</p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <section className="lg:col-span-7" aria-labelledby="caracteristiques">
          <h2 id="caracteristiques" className="title-luxe text-sm text-subtle">
            Caractéristiques
          </h2>
          <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5 sm:grid-cols-2">
            <div className="flex items-center justify-between bg-anthracite px-5 py-4 sm:col-span-2">
              <dt className="label">Marque · Modèle</dt>
              <dd className="text-sm">{vehicleName(vehicle, "full")}</dd>
            </div>
            <div className="flex items-center justify-between bg-anthracite px-5 py-4 sm:col-span-2">
              <dt className="label">Prix / jour</dt>
              <dd className="nums font-display text-2xl text-gold">{formatPrice(vehicle.pricePerDay)}</dd>
            </div>
            {specs.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between gap-4 bg-anthracite px-5 py-4">
                <dt className="label inline-flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} /> {label}
                </dt>
                <dd className="nums text-right text-sm">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="lg:col-span-5" aria-labelledby="conditions">
          <h2 id="conditions" className="title-luxe text-sm text-subtle">
            Conditions de location
          </h2>
          <ul className="mt-6 space-y-px overflow-hidden rounded-2xl border border-white/5 bg-white/5">
            <li className="bg-anthracite px-5 py-4">
              <p className="label">Âge minimum</p>
              <p className="mt-1 text-sm">{category.minAge} ans</p>
            </li>
            <li className="bg-anthracite px-5 py-4">
              <p className="label">Ancienneté du permis</p>
              <p className="mt-1 text-sm">{category.minLicenseYears} ans minimum</p>
            </li>
            <li className="bg-anthracite px-5 py-4">
              <p className="label">Caution</p>
              <p className="mt-1 text-sm">{CAUTION_TEXT}</p>
            </li>
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted">{conditionsSummary()}</p>
        </section>
      </div>

        <section className="section-gap" aria-labelledby="disponibilites">
          <h2 id="disponibilites" className="title-luxe mb-6 text-sm text-subtle">
            Disponibilités
          </h2>
          <BookingCalendar />
        </section>
      </BookingProvider>

      <section className="section-gap" aria-labelledby="villes">
        <h2 id="villes" className="title-luxe text-sm text-subtle">
          Livraison de la {name} à
        </h2>
        <ul className="mt-5 flex flex-wrap gap-2">
          {cities.map((c) => (
            <li key={c.slug}>
              <Link href={`/${citySeoSlug(c)}`} prefetch={false} className="chip">
                Location voiture {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="section-gap" aria-labelledby="similaires">
        <h2 id="similaires" className="mb-8 font-display text-3xl font-light">
          Vous aimerez aussi
        </h2>
        <VehicleGrid vehicles={similar} layout="fixed" />
      </section>

      <MobileBookingBar vehicle={vehicle} />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": ["Product", "Car"],
          name: `Location ${vehicleName(vehicle, "full")}`,
          description: vehicle.description,
          url,
          image: images,
          brand: { "@type": "Brand", name: vehicle.brand },
          model: vehicle.model,
          vehicleModelDate: String(vehicle.year),
          category: category.name,
          fuelType: vehicle.fuel,
          vehicleTransmission: vehicle.transmission,
          seatingCapacity: vehicle.seats,
          numberOfDoors: vehicle.doors,
          vehicleEngine: { "@type": "EngineSpecification", name: vehicle.engine, enginePower: { "@type": "QuantitativeValue", value: vehicle.powerHp, unitText: "ch" } },
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: "EUR",
            price: vehicle.pricePerDay,
            priceSpecification: { "@type": "UnitPriceSpecification", price: vehicle.pricePerDay, priceCurrency: "EUR", unitText: "jour", referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "DAY" } },
            availability: vehicle.available ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
            businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
            seller: { "@type": "AutoRental", name: SITE.name, url: SITE.url },
            areaServed: cities.map((c) => c.name),
          },
        }}
      />
    </div>
  );
}
