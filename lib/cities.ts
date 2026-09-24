import { slugify } from "./utils";

export type Country = "BE" | "FR";

export interface City {
  name: string;
  slug: string;
  country: Country;
  region: string;
}

const make = (name: string, country: Country, region: string): City => ({ name, slug: slugify(name), country, region });

export const CITIES: City[] = [
  make("Bruxelles", "BE", "Bruxelles-Capitale"),
  make("Anvers", "BE", "Flandre"),
  make("Liège", "BE", "Wallonie"),
  make("Gand", "BE", "Flandre"),
  make("Charleroi", "BE", "Wallonie"),
  make("Namur", "BE", "Wallonie"),
  make("Leuven", "BE", "Flandre"),
  make("Bruges", "BE", "Flandre"),
  make("Hasselt", "BE", "Flandre"),
  make("Mons", "BE", "Wallonie"),
  make("Waterloo", "BE", "Wallonie"),
  make("Wavre", "BE", "Wallonie"),
  make("Louvain-la-Neuve", "BE", "Wallonie"),
  make("Lille", "FR", "Hauts-de-France"),
  make("Roubaix", "FR", "Hauts-de-France"),
  make("Tourcoing", "FR", "Hauts-de-France"),
  make("Valenciennes", "FR", "Hauts-de-France"),
  make("Douai", "FR", "Hauts-de-France"),
  make("Arras", "FR", "Hauts-de-France"),
  make("Lens", "FR", "Hauts-de-France"),
  make("Dunkerque", "FR", "Hauts-de-France"),
  make("Amiens", "FR", "Hauts-de-France"),
  make("Saint-Quentin", "FR", "Hauts-de-France"),
  make("Compiègne", "FR", "Hauts-de-France"),
  make("Beauvais", "FR", "Hauts-de-France"),
  make("Paris", "FR", "Île-de-France"),
];

export const CITY_NAMES = CITIES.map((c) => c.name);

export function getCity(slugOrName: string | null | undefined) {
  if (!slugOrName) return undefined;
  const s = slugify(slugOrName);
  return CITIES.find((c) => c.slug === s);
}

export function citySeoSlug(city: City) {
  return `location-voiture-${city.slug}`;
}

/** Zones de mise à disposition — un véhicule est rattaché à une ou plusieurs zones. */
export const ZONES = {
  bruxellesBrabant: ["Bruxelles", "Waterloo", "Wavre", "Louvain-la-Neuve", "Leuven"],
  wallonie: ["Charleroi", "Namur", "Mons", "Liège", "Wavre", "Louvain-la-Neuve"],
  flandre: ["Anvers", "Gand", "Bruges", "Hasselt", "Leuven"],
  nordFrance: ["Lille", "Roubaix", "Tourcoing", "Valenciennes", "Douai", "Arras", "Lens", "Dunkerque"],
  picardieParis: ["Amiens", "Saint-Quentin", "Compiègne", "Beauvais", "Paris"],
} as const;

export const ALL_CITIES = CITY_NAMES;
