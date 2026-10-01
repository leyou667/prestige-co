import { Clock, FileText, KeyRound, MapPin } from "lucide-react";
import { CITIES } from "@/lib/cities";

/** Bandeau de réassurance — uniquement des engagements déjà présents sur le site. */
export function TrustBar() {
  const items = [
    { icon: KeyRound, title: "Livré chez vous", text: "Domicile, hôtel, gare ou bureau" },
    { icon: FileText, title: "Devis instantané", text: "En ligne, sans engagement" },
    { icon: Clock, title: "Réponse 7j/7", text: "Un conseiller sur WhatsApp" },
    { icon: MapPin, title: `${CITIES.length} villes`, text: "Belgique · Nord de la France · Paris" },
  ];
  return (
    <section aria-label="Nos engagements" className="border-y border-white/5 bg-anthracite/60">
      <ul className="container grid grid-cols-2 gap-x-6 gap-y-6 py-8 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gold/80" strokeWidth={1.25} aria-hidden="true" />
            <div>
              <p className="text-sm text-white">{title}</p>
              <p className="text-xs text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
