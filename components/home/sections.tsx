import Link from "next/link";
import { CalendarCheck, Car, Clock, Crown, KeyRound, MapPin, Sparkles, Truck, UserRound } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { CITIES } from "@/lib/cities";
import { VEHICLES } from "@/lib/vehicles";
import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, children, center, as: Tag = "h2" }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode; center?: boolean; as?: "h1" | "h2" }) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      <p className="eyebrow">{eyebrow}</p>
      <Tag className="mt-4 font-display text-3xl font-light leading-tight sm:text-4xl lg:text-5xl">{title}</Tag>
      <div className={cn("hairline mt-6", center && "mx-auto")} />
      {children && <div className="mt-6 text-sm leading-relaxed text-white/60 sm:text-base">{children}</div>}
    </div>
  );
}

export function Presentation() {
  const stats = [
    { value: VEHICLES.length, label: "Véhicules" },
    { value: CATEGORIES.length, label: "Catégories" },
    { value: CITIES.length, label: "Villes desservies" },
    { value: "7j/7", label: "Conciergerie" },
  ];
  return (
    <section className="py-24 md:py-32">
      <div className="container grid grid-cols-1 gap-14 lg:grid-cols-2 lg:items-end">
        <div>
          <p className="title-luxe text-xs text-white/40 sm:text-sm">P R E S T I G E &nbsp; C O N C I E R G E R I E</p>
          <h2 className="mt-6 font-display text-3xl font-light leading-tight sm:text-5xl">
            Chaque trajet mérite
            <br />
            <em className="text-gold/90">une attention particulière.</em>
          </h2>
        </div>
        <div className="space-y-5 text-sm leading-relaxed text-white/60 sm:text-base">
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
      <dl className="container mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse bg-ink px-6 py-8 text-center">
            <dt className="mt-2 text-[0.62rem] uppercase tracking-luxe text-white/45">{s.label}</dt>
            <dd className="font-display text-4xl font-light text-white">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export const SERVICES = [
  { icon: KeyRound, title: "Livraison & reprise", text: "Votre véhicule livré à domicile, au bureau, à l'hôtel ou à la gare, puis repris à l'adresse de votre choix." },
  { icon: Car, title: "De l'économique à la supercar", text: "Sept catégories, de la citadine à 29 € par jour à la Porsche Taycan : le bon véhicule pour chaque occasion." },
  { icon: Crown, title: "Événements", text: "Mariages, shootings, soirées, lancements : une voiture d'exception préparée avec soin pour marquer les esprits." },
  { icon: Truck, title: "Professionnels", text: "Utilitaires aménagés (galerie, échelle, plancher, cloison) et véhicules de fonction pour vos équipes." },
  { icon: UserRound, title: "Chauffeur privé", text: "Sur demande, un chauffeur professionnel prend le volant pour vos transferts et déplacements d'affaires." },
  { icon: Clock, title: "Assistance 7j/7", text: "Un conseiller dédié joignable sur WhatsApp, de la réservation jusqu'au retour du véhicule." },
];

export function Services({ withHeading = true }: { withHeading?: boolean }) {
  return (
    <section className="bg-anthracite py-24 md:py-32">
      <div className="container">
        {withHeading && (
          <SectionHeading eyebrow="Services" title="Une conciergerie, pas un simple loueur.">
            De la réservation à la restitution, chaque détail est pris en charge.
          </SectionHeading>
        )}
        <ul className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="group bg-anthracite p-8 transition-colors duration-500 hover:bg-graphite">
              <Icon className="h-6 w-6 text-gold/80 transition-transform duration-500 group-hover:-translate-y-0.5" strokeWidth={1.25} />
              <h3 className="mt-6 font-sans text-sm uppercase tracking-wide2 text-white">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/55">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Process() {
  const steps = [
    { icon: Car, title: "Choisissez", text: "Parcourez la collection ou laissez notre conseiller IA vous guider." },
    { icon: CalendarCheck, title: "Demandez un devis", text: "Ville, dates, options : le devis est calculé instantanément." },
    { icon: Sparkles, title: "Confirmez sur WhatsApp", text: "Nous vérifions la disponibilité et confirmons le tarif final." },
    { icon: MapPin, title: "Prenez la route", text: "Votre véhicule vous attend, préparé, à l'adresse convenue." },
  ];
  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <SectionHeading eyebrow="Réservation" title="Quatre étapes, aucune contrainte." center />
        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative text-center">
              <span className="font-display text-6xl font-light text-white/[0.06]">0{i + 1}</span>
              <Icon className="mx-auto -mt-8 h-6 w-6 text-gold/80" strokeWidth={1.25} />
              <h3 className="mt-5 font-sans text-sm uppercase tracking-wide2">{title}</h3>
              <p className="mx-auto mt-3 max-w-[16rem] text-sm leading-relaxed text-white/55">{text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-14 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/vehicules" className="btn-gold">Explorer la collection</Link>
          <Link href="/devis" className="btn-ghost">Demander un devis</Link>
        </div>
      </div>
    </section>
  );
}

export function About({ withHeading = true }: { withHeading?: boolean }) {
  const values = [
    { title: "Discrétion", text: "Votre demande est traitée en toute confidentialité, par un interlocuteur unique." },
    { title: "Exigence", text: "Chaque véhicule est contrôlé, nettoyé et préparé avant chaque remise des clés." },
    { title: "Réactivité", text: "Une réponse rapide sur WhatsApp, 7 jours sur 7, et une disponibilité mise à jour en temps réel." },
  ];
  return (
    <section className="border-t border-white/5 py-24 md:py-32">
      <div className="container grid grid-cols-1 gap-14 lg:grid-cols-2">
        {withHeading ? (
          <SectionHeading eyebrow="À propos" title="Née d'une passion pour l'automobile et le service.">
            PRESTIGE CONCIERGERIE est née d&apos;une conviction simple : louer une voiture devrait être aussi agréable que la conduire.
            Du trajet quotidien à l&apos;événement d&apos;une vie, nous mettons le même soin à chaque location, entre la Belgique, les
            Hauts-de-France et Paris.
          </SectionHeading>
        ) : (
          <div />
        )}
        <ul className="space-y-8 self-end">
          {values.map((v, i) => (
            <li key={v.title} className="flex gap-6 border-b border-white/5 pb-8 last:border-0">
              <span className="font-display text-2xl text-gold/70">0{i + 1}</span>
              <div>
                <h3 className="font-sans text-sm uppercase tracking-luxe">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{v.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
