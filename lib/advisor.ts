/**
 * Conseiller IA — logique 100 % déterministe.
 * Aucune requête réseau, aucun modèle de langage : une table de pondération
 * croise les réponses aux questions guidées avec les catégories D/C/B/U/A/S/S+,
 * puis classe les véhicules du catalogue.
 */
import type { CategoryCode } from "./categories";
import { VEHICLES, type Vehicle } from "./vehicles";

export type Usage = "quotidien" | "weekend" | "voyage" | "evenement" | "pro";
export type Passengers = "1-2" | "3-4" | "5+" | "utilitaire";
export type Budget = "lt50" | "50-100" | "100-300" | "300+";
export type Style = "eco" | "confort" | "sport" | "luxe";

export interface AdvisorAnswers {
  usage?: Usage;
  passengers?: Passengers;
  budget?: Budget;
  style?: Style | "none";
}

interface Option<T extends string> {
  value: T;
  label: string;
}

export interface AdvisorQuestion<K extends keyof AdvisorAnswers = keyof AdvisorAnswers> {
  key: K;
  title: string;
  optional?: boolean;
  options: Option<NonNullable<AdvisorAnswers[K]>>[];
}

export const QUESTIONS: AdvisorQuestion[] = [
  {
    key: "usage",
    title: "Pour quel usage ?",
    options: [
      { value: "quotidien", label: "Quotidien" },
      { value: "weekend", label: "Week-end" },
      { value: "voyage", label: "Voyage / vacances" },
      { value: "evenement", label: "Événement (mariage, shooting)" },
      { value: "pro", label: "Professionnel" },
    ],
  },
  {
    key: "passengers",
    title: "Combien de passagers ?",
    options: [
      { value: "1-2", label: "1 – 2" },
      { value: "3-4", label: "3 – 4" },
      { value: "5+", label: "5 et plus" },
      { value: "utilitaire", label: "Utilitaire (marchandises)" },
    ],
  },
  {
    key: "budget",
    title: "Budget par jour ?",
    options: [
      { value: "lt50", label: "Moins de 50 €" },
      { value: "50-100", label: "50 – 100 €" },
      { value: "100-300", label: "100 – 300 €" },
      { value: "300+", label: "300 € et plus" },
    ],
  },
  {
    key: "style",
    title: "Style souhaité ?",
    optional: true,
    options: [
      { value: "eco", label: "Économique" },
      { value: "confort", label: "Confort" },
      { value: "sport", label: "Sportif" },
      { value: "luxe", label: "Luxe" },
      { value: "none", label: "Peu importe" },
    ],
  },
];

type Weights = Partial<Record<CategoryCode, number>>;

/** Table de mapping réponses → catégories */
export const USAGE_WEIGHTS: Record<Usage, Weights> = {
  quotidien: { D: 4, C: 4, B: 2, A: 2, U: 0 },
  weekend: { B: 3, A: 3, S: 3, C: 1, "S+": 2 },
  voyage: { B: 4, A: 3, S: 2, C: 1 },
  evenement: { "S+": 6, S: 5, A: 2 },
  pro: { U: 5, A: 2, S: 2, B: 1 },
};

export const PASSENGER_WEIGHTS: Record<Passengers, Weights> = {
  "1-2": { D: 2, C: 1, A: 1, S: 1, "S+": 2 },
  "3-4": { C: 2, B: 2, A: 2, S: 2, "S+": 1 },
  "5+": { B: 4, C: 1, A: 1, S: 1 },
  utilitaire: { U: 8 },
};

export const BUDGET_RANGES: Record<Budget, [number, number]> = {
  lt50: [0, 50],
  "50-100": [50, 100],
  "100-300": [100, 300],
  "300+": [300, Infinity],
};

export const BUDGET_WEIGHTS: Record<Budget, Weights> = {
  lt50: { D: 3, C: 3, U: 2, B: 1 },
  "50-100": { B: 3, A: 3, S: 2, U: 1 },
  "100-300": { S: 4, A: 2 },
  "300+": { "S+": 6, S: 2 },
};

export const STYLE_WEIGHTS: Record<Style, Weights> = {
  eco: { D: 3, C: 3, U: 1 },
  confort: { B: 3, A: 3, S: 1 },
  sport: { "S+": 4, S: 2, A: 1 },
  luxe: { S: 4, "S+": 4, A: 1 },
};

export interface Suggestion {
  vehicle: Vehicle;
  score: number;
  reasons: string[];
}

function seatsNeeded(p?: Passengers) {
  if (p === "3-4") return 4;
  if (p === "5+") return 5;
  return 1;
}

export function recommend(answers: AdvisorAnswers, limit = 3): Suggestion[] {
  const { usage, passengers, budget, style } = answers;
  const [minBudget, maxBudget] = budget ? BUDGET_RANGES[budget] : [0, Infinity];
  const wantsCargo = passengers === "utilitaire";

  const score = (v: Vehicle, relaxBudget: boolean): Suggestion | null => {
    // Filtres stricts
    if (wantsCargo && v.category !== "U") return null;
    if (!wantsCargo && v.category === "U" && usage !== "pro") return null;
    if (!wantsCargo && v.seats < seatsNeeded(passengers)) return null;
    if (!relaxBudget && v.pricePerDay > maxBudget) return null;

    const reasons: string[] = [];
    let s = 0;
    s += usage ? USAGE_WEIGHTS[usage][v.category] ?? 0 : 0;
    s += passengers ? PASSENGER_WEIGHTS[passengers][v.category] ?? 0 : 0;
    s += budget ? BUDGET_WEIGHTS[budget][v.category] ?? 0 : 0;
    if (style && style !== "none") {
      s += STYLE_WEIGHTS[style][v.category] ?? 0;
      if (v.style === style) {
        s += 3;
        reasons.push(
          { eco: "Sobre et économique", confort: "Confort privilégié", sport: "Caractère sportif", luxe: "Standing premium" }[style],
        );
      }
    }
    if (budget) {
      if (v.pricePerDay >= minBudget && v.pricePerDay <= maxBudget) {
        s += 3;
        reasons.push("Dans votre budget");
      } else if (v.pricePerDay < minBudget) {
        s += 1;
        reasons.push("En dessous de votre budget");
      } else {
        s -= 4;
        reasons.push("Légèrement au-dessus du budget");
      }
    }
    if (passengers === "5+" && v.seats >= 7) {
      s += 3;
      reasons.push(`${v.seats} places`);
    }
    if (wantsCargo) reasons.push("Espace de chargement");
    if (usage === "voyage" && /coffre|break|spacieux/i.test(v.features.join(" ") + v.description)) {
      s += 1;
      reasons.push("Grand volume de coffre");
    }
    if (usage === "evenement" && (v.category === "S+" || v.category === "S")) reasons.push("Effet garanti pour votre événement");
    if (usage === "quotidien" && v.transmission === "Automatique") s += 1;
    return { vehicle: v, score: s, reasons: Array.from(new Set(reasons)).slice(0, 3) };
  };

  const rank = (relax: boolean) =>
    VEHICLES.filter((v) => v.available)
      .map((v) => score(v, relax))
      .filter((x): x is Suggestion => x !== null)
      .sort((a, b) => b.score - a.score || a.vehicle.pricePerDay - b.vehicle.pricePerDay || a.vehicle.id.localeCompare(b.vehicle.id));

  let results = rank(false);
  if (results.length === 0) results = rank(true);

  // Diversité : pas deux fois le même modèle (ex. deux Kangoo) si une alternative existe
  const picked: Suggestion[] = [];
  const seen = new Set<string>();
  for (const r of results) {
    const key = `${r.vehicle.brand}-${r.vehicle.model}`;
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(r);
    if (picked.length === limit) break;
  }
  return picked;
}
