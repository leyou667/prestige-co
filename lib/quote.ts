import { RENTAL_OPTIONS, optionPrice, optionTotal } from "./options";
import { toISODate } from "./utils";
import type { Vehicle } from "./vehicles";

export interface QuoteLine {
  id: string;
  label: string;
  amount: number;
  /** Option chiffrée au cas par cas (ex. chauffeur) */
  onQuote: boolean;
}

export interface Quote {
  days: number;
  rental: number;
  options: QuoteLine[];
  total: number;
}

/** Calcul du devis — utilisé à l'identique par le navigateur et par l'API (le client ne fixe jamais le prix). */
export function computeQuote(vehicle: Pick<Vehicle, "pricePerDay" | "category">, days: number, optionIds: readonly string[]): Quote {
  const options = RENTAL_OPTIONS.filter((o) => optionIds.includes(o.id)).map((o) => ({
    id: o.id,
    label: o.label,
    amount: optionTotal(o, vehicle.category, days),
    onQuote: optionPrice(o, vehicle.category) === 0,
  }));
  const rental = vehicle.pricePerDay * days;
  return { days, rental, options, total: rental + options.reduce((s, o) => s + o.amount, 0) };
}

export function isKnownOption(id: string) {
  return RENTAL_OPTIONS.some((o) => o.id === id);
}

/** Numéro de devis lisible, stable pour une même demande. */
export function quoteNumber(seed: string, date = new Date()) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `PC-${toISODate(date).replace(/-/g, "")}-${(h % 10000).toString().padStart(4, "0")}`;
}
