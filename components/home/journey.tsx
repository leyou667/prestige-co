import Link from "next/link";
import { CITIES } from "@/lib/cities";

const STEPS = [
  { title: "Choisissez", text: "Parcourez la collection ou laissez le conseiller vous guider." },
  { title: "Demandez un devis", text: "Ville, dates, options : le prix est calculé tout de suite, sans engagement." },
  { title: "Confirmez sur WhatsApp", text: "Nous vérifions la disponibilité et confirmons le tarif, 7 jours sur 7." },
  { title: "Prenez la route", text: "Le véhicule vous attend, préparé, chez vous, à l'hôtel, à la gare ou au bureau." },
];

/**
 * Parcours de réservation (une vraie suite, d'où la numérotation).
 * La ligne de parcours se trace au fil du défilement (CSS pur, voir .route-line) ;
 * sans support du navigateur, elle est simplement affichée.
 */
export function Journey() {
  return (
    <section aria-labelledby="parcours-titre" className="py-24 md:py-32">
      <div className="container">
        <div className="max-w-2xl">
          <h2 id="parcours-titre" className="font-display text-4xl font-light leading-[1.05] sm:text-5xl lg:text-[3.5rem]">
            Réserver prend quelques minutes.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
            Livraison et reprise dans {CITIES.length} villes, en Belgique, dans le Nord de la France et à Paris. Un seul interlocuteur,
            de la demande au retour des clés.
          </p>
        </div>

        <ol className="relative mt-16 grid gap-10 pl-10 md:mt-20 md:grid-cols-4 md:gap-8 md:pl-0 md:pt-12">
          {/* Ligne de parcours : verticale sur mobile, horizontale sur ordinateur */}
          <span aria-hidden="true" className="absolute bottom-2 left-[0.6875rem] top-2 w-px bg-white/10 md:hidden" />
          <span aria-hidden="true" className="route-line route-line-v absolute bottom-2 left-[0.6875rem] top-2 w-px bg-gold/70 md:hidden" />
          <span aria-hidden="true" className="absolute left-0 right-0 top-[0.6875rem] hidden h-px bg-white/10 md:block" />
          <span aria-hidden="true" className="route-line route-line-h absolute left-0 right-0 top-[0.6875rem] hidden h-px bg-gold/70 md:block" />
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative">
              <span
                aria-hidden="true"
                className="nums absolute -left-10 top-0 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-ink text-xs text-subtle md:-top-12 md:left-0"
              >
                {i + 1}
              </span>
              <h3 className="font-display text-2xl leading-tight">
                <span className="sr-only">Étape {i + 1} : </span>
                {s.title}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">{s.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 flex flex-col gap-3 sm:flex-row">
          <Link href="/devis" className="btn-gold">
            Demander un devis
          </Link>
          <Link href="/vehicules" className="btn-ghost">
            Voir la collection
          </Link>
        </div>
      </div>
    </section>
  );
}
