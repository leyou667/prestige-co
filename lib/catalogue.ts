import type { CategoryCode } from "./categories";
import { getCity } from "./cities";
import { POWER_RANGE, PRICE_RANGE, VEHICLES, type Vehicle } from "./vehicles";

export interface CatalogueFilters {
  categories: CategoryCode[];
  brand: string;
  model: string;
  city: string;
  price: [number, number];
  power: [number, number];
  from: string;
  to: string;
}

export type CatalogueSort = "price-asc" | "price-desc" | "power-desc";

export const DEFAULT_FILTERS: CatalogueFilters = {
  categories: [],
  brand: "",
  model: "",
  city: "",
  price: [PRICE_RANGE[0], PRICE_RANGE[1]],
  power: [POWER_RANGE[0], POWER_RANGE[1]],
  from: "",
  to: "",
};

export function filterVehicles(f: CatalogueFilters, sort: CatalogueSort, unavailable: Set<string>): Vehicle[] {
  const q = f.model.trim().toLowerCase();
  const city = getCity(f.city);
  const list = VEHICLES.filter(
    (v) =>
      (!f.categories.length || f.categories.includes(v.category)) &&
      (!f.brand || v.brand === f.brand) &&
      (!q || `${v.brand} ${v.model} ${v.variant ?? ""}`.toLowerCase().includes(q)) &&
      (!city || v.cities.includes(city.name)) &&
      v.pricePerDay >= f.price[0] &&
      v.pricePerDay <= f.price[1] &&
      v.powerHp >= f.power[0] &&
      v.powerHp <= f.power[1],
  );
  const sorted = [...list].sort((a, b) =>
    sort === "price-asc" ? a.pricePerDay - b.pricePerDay : sort === "price-desc" ? b.pricePerDay - a.pricePerDay : b.powerHp - a.powerHp,
  );
  // Véhicules indisponibles sur les dates : en fin de liste
  return sorted.sort((a, b) => Number(unavailable.has(a.id)) - Number(unavailable.has(b.id)));
}

/** Nombre de filtres actifs (hors dates), pour le badge du bouton « Filtres ». */
export function countActiveFilters(f: CatalogueFilters) {
  return (
    f.categories.length +
    Number(!!f.brand) +
    Number(!!f.model) +
    Number(!!f.city) +
    Number(f.price[0] !== PRICE_RANGE[0] || f.price[1] !== PRICE_RANGE[1]) +
    Number(f.power[0] !== POWER_RANGE[0] || f.power[1] !== POWER_RANGE[1])
  );
}

/** Paramètres d'URL partageables reflétant les filtres. */
export function filtersToSearchParams(f: CatalogueFilters) {
  const p = new URLSearchParams();
  if (f.city) p.set("ville", f.city);
  if (f.categories.length) p.set("categorie", f.categories.join(","));
  if (f.brand) p.set("marque", f.brand);
  if (f.model.trim()) p.set("modele", f.model.trim());
  if (f.from) p.set("du", f.from);
  if (f.to) p.set("au", f.to);
  return p;
}
