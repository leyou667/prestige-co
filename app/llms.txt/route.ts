import { CATEGORIES, CAUTION_TEXT, conditionsSummary } from "@/lib/categories";
import { CITIES, citySeoSlug } from "@/lib/cities";
import { SITE } from "@/lib/site";
import { formatPrice } from "@/lib/utils";
import { VEHICLES, vehicleHref, vehicleName } from "@/lib/vehicles";

export const dynamic = "force-static";

/**
 * /llms.txt — résumé lisible par les assistants IA (format llmstxt.org) :
 * qui nous sommes, l'offre, les tarifs, les conditions et les pages utiles. Généré depuis les données du site.
 */
export function GET() {
  const u = (path: string) => `${SITE.url}${path}`;
  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    "Conciergerie automobile : location de véhicules livrés et repris à l'adresse du client (domicile, hôtel, gare, bureau).",
    `Réservation : devis instantané en ligne puis confirmation de la disponibilité et du tarif final sur WhatsApp. Contact : ${SITE.email}.`,
    "",
    "## Conditions de location",
    `- ${conditionsSummary()}`,
    `- Caution : ${CAUTION_TEXT.toLowerCase()}.`,
    "",
    "## Catégories",
    ...CATEGORIES.map((c) => `- [${c.name} (${c.code}) — dès ${c.fromPrice} €/jour](${u(`/${c.seoSlug}`)}): ${c.tagline}`),
    "",
    "## Véhicules",
    ...VEHICLES.map(
      (v) =>
        `- [${vehicleName(v, "full")}](${u(vehicleHref(v))}): catégorie ${v.category}, ${formatPrice(v.pricePerDay)}/jour, ${v.powerHp} ch, ${v.fuel.toLowerCase()}, boîte ${v.transmission.toLowerCase()}, ${v.seats} places.`,
    ),
    "",
    "## Villes desservies",
    CITIES.map((c) => `[${c.name}](${u(`/${citySeoSlug(c)}`)})`).join(", "),
    "",
    "## Pages utiles",
    `- [Collection complète](${u("/vehicules")})`,
    `- [Demander un devis](${u("/devis")})`,
    `- [Services](${u("/services")})`,
    `- [Contact](${u("/contact")})`,
    `- [Conditions générales](${u("/conditions-generales")})`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
