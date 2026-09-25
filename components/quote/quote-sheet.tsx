import Image from "next/image";
import { CAUTION_TEXT } from "@/lib/categories";
import type { Quote } from "@/lib/quote";
import { SITE } from "@/lib/site";
import { formatDateFr, formatPrice } from "@/lib/utils";

export interface QuoteSheetProps {
  number: string;
  vehicleLabel: string;
  categoryName: string;
  categoryCode: string;
  pricePerDay: number;
  city: string;
  from: string;
  to: string;
  quote: Quote;
  contact: { name: string; phone: string; email: string };
  minAge: number;
  minLicense: number;
}

const lbl = "text-2xs uppercase tracking-wide2 text-muted print:text-ink/60";

/** Récapitulatif de devis — affichage écran (sombre) et impression / PDF (fond blanc, logo inversé). */
export function QuoteSheet(p: QuoteSheetProps) {
  const issued = new Intl.DateTimeFormat("fr-BE", { dateStyle: "long" }).format(new Date());
  const { days } = p.quote;
  return (
    <article className="print-sheet overflow-hidden rounded-2xl border border-white/10 bg-anthracite print:rounded-none print:border-0 print:bg-white print:text-ink">
      <header className="flex flex-col gap-6 border-b border-white/10 bg-ink p-6 print:border-ink/15 print:bg-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <Image src={SITE.logo} alt={SITE.name} width={645} height={368} sizes="112px" className="h-auto w-28 print:invert" priority />
        <div className="text-left sm:text-right">
          <p className="title-luxe text-xs text-muted print:text-ink/60">Devis estimatif</p>
          <p className="nums mt-1 font-display text-2xl">{p.number}</p>
          <p className="text-xs text-muted print:text-ink/50">Émis le {issued}</p>
        </div>
      </header>

      <div className="grid gap-8 p-6 sm:grid-cols-2 sm:p-8">
        <div>
          <p className={lbl}>Véhicule</p>
          <p className="mt-1 font-display text-2xl">{p.vehicleLabel}</p>
          <p className="text-sm text-muted print:text-ink/60">
            {p.categoryName} (catégorie {p.categoryCode})
          </p>
        </div>
        <dl className="nums grid grid-cols-2 gap-4 text-sm">
          {[
            ["Ville", p.city],
            ["Durée", `${days} jour${days > 1 ? "s" : ""}`],
            ["Départ", formatDateFr(p.from)],
            ["Retour", formatDateFr(p.to)],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className={lbl}>{k}</dt>
              <dd className="mt-1">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <table className="nums w-full text-sm">
        <thead>
          <tr className="border-y border-white/10 text-left print:border-ink/15">
            <th className={`px-6 py-3 font-normal sm:px-8 ${lbl}`}>Désignation</th>
            <th className={`px-6 py-3 text-right font-normal sm:px-8 ${lbl}`}>Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-white/5 print:border-ink/10">
            <td className="px-6 py-3 sm:px-8">
              Location — {formatPrice(p.pricePerDay)} × {days} jour{days > 1 ? "s" : ""}
            </td>
            <td className="px-6 py-3 text-right sm:px-8">{formatPrice(p.quote.rental)}</td>
          </tr>
          {p.quote.options.map((o) => (
            <tr key={o.id} className="border-b border-white/5 print:border-ink/10">
              <td className="px-6 py-3 sm:px-8">{o.label}</td>
              <td className="px-6 py-3 text-right sm:px-8">{o.onQuote ? "Sur devis" : formatPrice(o.amount)}</td>
            </tr>
          ))}
          <tr className="border-b border-white/5 print:border-ink/10">
            <td className="px-6 py-3 sm:px-8">Caution</td>
            <td className="px-6 py-3 text-right text-muted sm:px-8 print:text-ink/60">Sur demande</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td className="px-6 py-5 text-2xs uppercase tracking-luxe sm:px-8">Total estimé</td>
            <td className="px-6 py-5 text-right font-display text-3xl text-gold sm:px-8 print:text-ink">{formatPrice(p.quote.total)}</td>
          </tr>
        </tfoot>
      </table>

      <footer className="space-y-2 border-t border-white/10 p-6 text-xs leading-relaxed text-muted print:border-ink/15 print:text-ink/60 sm:p-8">
        {(p.contact.name || p.contact.phone || p.contact.email) && (
          <p>Client : {[p.contact.name, p.contact.phone, p.contact.email].filter(Boolean).join(" · ")}</p>
        )}
        <p>
          Conditions : {p.minAge} ans minimum, {p.minLicense} ans de permis minimum. Caution : {CAUTION_TEXT.toLowerCase()}.
        </p>
        <p>Devis estimatif non contractuel, sous réserve de disponibilité. Le tarif final est confirmé par {SITE.name}.</p>
        <p>
          {SITE.name} · <span className="nums">{SITE.phone}</span> · {SITE.email}
        </p>
      </footer>
    </article>
  );
}
