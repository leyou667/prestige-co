import { CAUTION_TEXT, CATEGORIES, MIN_PRICE, conditionTiers } from "./categories";
import { CITIES } from "./cities";

export interface FaqItem {
  q: string;
  a: string;
}

/** Questions fréquentes — réponses générées depuis les données du site (aucune promesse non vérifiée). */
export function faqItems(): FaqItem[] {
  const tiers = conditionTiers()
    .map((t) => `catégories ${t.codes.join(", ")} : ${t.minAge} ans et ${t.minLicenseYears} ans de permis minimum`)
    .join(" ; ");
  const be = CITIES.filter((c) => c.country === "BE").length;
  const fr = CITIES.filter((c) => c.country === "FR").length;
  return [
    {
      q: "Comment réserver un véhicule ?",
      a: "Choisissez un véhicule, indiquez la ville et vos dates : le devis est calculé instantanément en ligne. Envoyez-le ensuite sur WhatsApp, nous vous confirmons la disponibilité et le tarif final.",
    },
    { q: "Quelles sont les conditions d'âge et de permis ?", a: `Elles dépendent de la catégorie du véhicule — ${tiers}.` },
    { q: "Quel est le montant de la caution ?", a: `La caution est ${CAUTION_TEXT.toLowerCase()}.` },
    {
      q: "Où livrez-vous les véhicules ?",
      a: `Nous livrons et reprenons le véhicule à l'adresse de votre choix (domicile, hôtel, gare, bureau) dans ${be} villes en Belgique et ${fr} villes du Nord de la France jusqu'à Paris.`,
    },
    {
      q: "Quels types de véhicules proposez-vous ?",
      a: `${CATEGORIES.length} catégories, de la citadine économique dès ${MIN_PRICE} € par jour aux utilitaires aménagés, SUV premium et supercars.`,
    },
    {
      q: "Le kilométrage est-il limité ?",
      a: "Une option « kilométrage illimité » peut être ajoutée au moment du devis, tout comme un conducteur additionnel, un siège enfant ou la livraison à domicile.",
    },
  ];
}
