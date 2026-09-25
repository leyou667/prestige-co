import type { CategoryCode } from "./categories";

export interface RentalOption {
  id: string;
  label: string;
  description: string;
  /** Prix par jour (perDay) ou forfait (flat) */
  price: number;
  mode: "perDay" | "flat";
  /** Tarif spécifique pour les catégories S / S+ */
  premiumPrice?: number;
}

/** Tarifs indicatifs des options — à ajuster par PRESTIGE CONCIERGERIE */
export const RENTAL_OPTIONS: RentalOption[] = [
  { id: "livraison", label: "Livraison & reprise à l'adresse de votre choix", description: "Remise des clés à domicile, à l'hôtel ou à la gare.", price: 49, mode: "flat", premiumPrice: 99 },
  { id: "conducteur", label: "Conducteur additionnel", description: "Un second conducteur autorisé (mêmes conditions d'âge et de permis).", price: 10, mode: "perDay", premiumPrice: 25 },
  { id: "km-illimite", label: "Kilométrage illimité", description: "Roulez sans compter.", price: 15, mode: "perDay", premiumPrice: 90 },
  { id: "rachat-franchise", label: "Protection renforcée", description: "Réduction de la franchise en cas de sinistre.", price: 12, mode: "perDay", premiumPrice: 60 },
  { id: "siege-enfant", label: "Siège enfant / rehausseur", description: "Installé avant la remise du véhicule.", price: 5, mode: "perDay" },
  { id: "chauffeur", label: "Chauffeur privé", description: "Un chauffeur professionnel à votre disposition (sur devis).", price: 0, mode: "flat" },
];

export function optionPrice(option: RentalOption, category: CategoryCode) {
  const premium = category === "S" || category === "S+";
  return premium && option.premiumPrice != null ? option.premiumPrice : option.price;
}

export function optionTotal(option: RentalOption, category: CategoryCode, days: number) {
  const p = optionPrice(option, category);
  return option.mode === "perDay" ? p * days : p;
}
