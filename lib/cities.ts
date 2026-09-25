import { slugify } from "./utils";

export type Country = "BE" | "FR";

const CITY_DEFS = [
  ["Bruxelles", "BE", "Bruxelles-Capitale"],
  ["Anvers", "BE", "Flandre"],
  ["Liège", "BE", "Wallonie"],
  ["Gand", "BE", "Flandre"],
  ["Charleroi", "BE", "Wallonie"],
  ["Namur", "BE", "Wallonie"],
  ["Leuven", "BE", "Flandre"],
  ["Bruges", "BE", "Flandre"],
  ["Hasselt", "BE", "Flandre"],
  ["Mons", "BE", "Wallonie"],
  ["Waterloo", "BE", "Wallonie"],
  ["Wavre", "BE", "Wallonie"],
  ["Louvain-la-Neuve", "BE", "Wallonie"],
  ["Lille", "FR", "Hauts-de-France"],
  ["Roubaix", "FR", "Hauts-de-France"],
  ["Tourcoing", "FR", "Hauts-de-France"],
  ["Valenciennes", "FR", "Hauts-de-France"],
  ["Douai", "FR", "Hauts-de-France"],
  ["Arras", "FR", "Hauts-de-France"],
  ["Lens", "FR", "Hauts-de-France"],
  ["Dunkerque", "FR", "Hauts-de-France"],
  ["Amiens", "FR", "Hauts-de-France"],
  ["Saint-Quentin", "FR", "Hauts-de-France"],
  ["Compiègne", "FR", "Hauts-de-France"],
  ["Beauvais", "FR", "Hauts-de-France"],
  ["Paris", "FR", "Île-de-France"],
] as const satisfies readonly (readonly [string, Country, string])[];

/** Nom d'une ville desservie — une faute de frappe dans les données est détectée par TypeScript. */
export type CityName = (typeof CITY_DEFS)[number][0];

export interface City {
  name: CityName;
  slug: string;
  country: Country;
  region: string;
}

export const CITIES: City[] = CITY_DEFS.map(([name, country, region]) => ({ name, slug: slugify(name), country, region }));

export const ALL_CITIES: CityName[] = CITIES.map((c) => c.name);

export function getCity(slugOrName: string | null | undefined) {
  if (!slugOrName) return undefined;
  const s = slugify(slugOrName);
  return CITIES.find((c) => c.slug === s);
}

export function citySeoSlug(city: City) {
  return `location-voiture-${city.slug}`;
}

/** Villes où un véhicule peut être livré, dans l'ordre de la liste officielle. */
export function citiesForVehicle(v: { cities: readonly CityName[] }) {
  return CITIES.filter((c) => v.cities.includes(c.name));
}

/** Zones de mise à disposition — un véhicule est rattaché à une ou plusieurs zones. */
export const ZONES = {
  bruxellesBrabant: ["Bruxelles", "Waterloo", "Wavre", "Louvain-la-Neuve", "Leuven"],
  wallonie: ["Charleroi", "Namur", "Mons", "Liège", "Wavre", "Louvain-la-Neuve"],
  flandre: ["Anvers", "Gand", "Bruges", "Hasselt", "Leuven"],
  nordFrance: ["Lille", "Roubaix", "Tourcoing", "Valenciennes", "Douai", "Arras", "Lens", "Dunkerque"],
  picardieParis: ["Amiens", "Saint-Quentin", "Compiègne", "Beauvais", "Paris"],
} as const satisfies Record<string, readonly CityName[]>;
