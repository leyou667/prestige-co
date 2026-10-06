import { Car, Clock, Crown, KeyRound, Truck, UserRound } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { CATEGORIES, MIN_PRICE } from "@/lib/categories";
import { CITIES } from "@/lib/cities";
import { VEHICLES } from "@/lib/vehicles";
import { cn } from "@/lib/utils";

/** Accueil : présentation, services et valeurs réunis en une seule section. */
const PROMISES = [
  { icon: KeyRound, title: "Livré, puis repris", text: `À domicile, au bureau, à l'hôtel ou à la gare, dans ${CITIES.length} villes.` },
  { icon: Car, title: "De la citadine à la supercar", text: `${CATEGORIES.length} catégories, dès ${MIN_PRICE} € par jour, jusqu'à la Porsche Taycan.` },
  { icon: Crown, title: "Événements et professionnels", text: "Mariages, shootings, utilitaires aménagés, chauffeur privé sur demande." },
  { icon: Clock, title: "Un interlocuteur unique", text: "Joignable sur WhatsApp 7 jours sur 7, en toute discrétion." },
];

export function Conciergerie() {
  return (
    <section aria-labelledby="conciergerie-titre" className="bg-anthracite py-24 md:py-32">
      <div className="container grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div className="max-w-xl">
          <h2 id="conciergerie-titre" className="font-display text-4xl font-light leading-[1.05] sm:text-5xl lg:text-[3.5rem]">
            Une conciergerie, pas un simple loueur.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted">
            PRESTIGE CONCIERGERIE est née d&apos;une conviction simple : louer une voiture devrait être aussi agréable que la conduire.
            Chaque véhicule est contrôlé, nettoyé et préparé avant la remise des clés, du trajet quotidien à l&apos;événement d&apos;une
            vie.
          </p>
        </div>
        <ul className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
          {PROMISES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="border-t border-white/10 pt-6">
              <Icon className="h-5 w-5 text-silver" strokeWidth={1.25} aria-hidden="true" />
              <h3 className="mt-4 font-display text-2xl leading-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Page À propos : texte de présentation et quelques repères chiffrés. */
export function Presentation() {
  const stats = [
    { value: VEHICLES.length, label: "véhicules" },
    { value: CATEGORIES.length, label: "catégories" },
    { value: CITIES.length, label: "villes desservies" },
    { value: "7j/7", label: "joignables sur WhatsApp" },
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="container grid grid-cols-1 gap-14 lg:grid-cols-2 lg:items-end">
        <h2 className="font-display text-3xl font-light leading-tight sm:text-5xl">Chaque trajet mérite une attention particulière.</h2>
        <div className="space-y-5 text-base leading-relaxed text-muted">
          <p>
            PRESTIGE CONCIERGERIE réunit sous une même signature une flotte allant de la citadine économique à la supercar
            électrique. Une seule exigence : vous remettre les clés d&apos;un véhicule impeccable, là où vous en avez besoin.
          </p>
          <p>
            Présents en Belgique et dans le Nord de la France jusqu&apos;à Paris, nous livrons à domicile, à l&apos;hôtel ou à la
            gare, et restons joignables à chaque étape de votre location.
          </p>
        </div>
      </div>
      <div className="container mt-16">
        <dl className="grid grid-cols-2 gap-y-10 border-t border-white/10 pt-10 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse">
              <dt className="mt-1 text-sm text-muted">{s.label}</dt>
              <dd className="nums font-display text-5xl font-light text-white">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

const SERVICES = [
  { icon: KeyRound, title: "Livraison et reprise", text: "Votre véhicule livré à domicile, au bureau, à l'hôtel ou à la gare, puis repris à l'adresse de votre choix." },
  {
    icon: Car,
    title: "De l'économique à la supercar",
    text: `${CATEGORIES.length} catégories, de la citadine à ${MIN_PRICE} € par jour à la Porsche Taycan : le bon véhicule pour chaque occasion.`,
  },
  { icon: Crown, title: "Événements", text: "Mariages, shootings, soirées, lancements : une voiture d'exception préparée avec soin pour marquer les esprits." },
  { icon: Truck, title: "Professionnels", text: "Utilitaires aménagés (galerie, échelle, plancher, cloison) et véhicules de fonction pour vos équipes." },
  { icon: UserRound, title: "Chauffeur privé", text: "Sur demande, un chauffeur professionnel prend le volant pour vos transferts et déplacements d'affaires." },
  { icon: Clock, title: "Assistance 7j/7", text: "Un conseiller dédié joignable sur WhatsApp, de la réservation jusqu'au retour du véhicule." },
];

/** Page Services : le détail de chaque service. */
export function Services({ withHeading = true }: { withHeading?: boolean }) {
  return (
    <section className={cn("bg-anthracite", withHeading ? "py-24 md:py-32" : "py-16 md:py-20")}>
      <div className="container">
        {withHeading && (
          <SectionHeading title="Une conciergerie, pas un simple loueur.">De la réservation à la restitution, chaque détail est pris en charge.</SectionHeading>
        )}
        <ul className={cn("grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3", withHeading && "mt-14")}>
          {SERVICES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="border-t border-white/10 pt-6">
              <Icon className="h-5 w-5 text-silver" strokeWidth={1.25} aria-hidden="true" />
              <h3 className="mt-4 font-display text-2xl leading-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const VALUES = [
  { title: "Discrétion", text: "Votre demande est traitée en toute confidentialité, par un interlocuteur unique." },
  { title: "Exigence", text: "Chaque véhicule est contrôlé, nettoyé et préparé avant chaque remise des clés." },
  { title: "Réactivité", text: "Une réponse rapide sur WhatsApp, 7 jours sur 7, et une disponibilité mise à jour en temps réel." },
];

/** Page À propos : nos valeurs. */
export function About() {
  return (
    <section className="py-16 md:py-24">
      <ul className="container grid gap-10 md:grid-cols-3">
        {VALUES.map((v) => (
          <li key={v.title} className="border-t border-white/10 pt-6">
            <h3 className="font-display text-2xl leading-tight">{v.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{v.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
