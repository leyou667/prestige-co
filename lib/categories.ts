export type CategoryCode = "D" | "C" | "B" | "U" | "A" | "S" | "S+";

export interface Category {
  code: CategoryCode;
  /** Libellé court utilisé par les filtres rapides */
  label: string;
  /** Nom complet de la catégorie */
  name: string;
  fromPrice: number;
  seoSlug: string;
  minAge: number;
  minLicenseYears: number;
  tagline: string;
}

export const CATEGORIES: Category[] = [
  { code: "D", label: "Économique", name: "Économiques", fromPrice: 29, seoSlug: "location-voiture-economique-belgique", minAge: 21, minLicenseYears: 3, tagline: "Citadines agiles et sobres pour la ville." },
  { code: "C", label: "Compacte", name: "Compactes", fromPrice: 39, seoSlug: "location-voiture-compacte-belgique", minAge: 21, minLicenseYears: 3, tagline: "Polyvalentes, pour le quotidien comme pour la route." },
  { code: "B", label: "Confort", name: "Confort", fromPrice: 49, seoSlug: "location-voiture-confort-belgique", minAge: 21, minLicenseYears: 3, tagline: "Espace, confort et familiales jusqu'à 7 places." },
  { code: "U", label: "Utilitaire", name: "Utilitaires", fromPrice: 45, seoSlug: "location-utilitaire-belgique", minAge: 21, minLicenseYears: 3, tagline: "Ludospaces aménagés pour vos transports et chantiers." },
  { code: "A", label: "Premium", name: "Premium", fromPrice: 59, seoSlug: "location-voiture-premium-belgique", minAge: 21, minLicenseYears: 3, tagline: "Finitions haut de gamme, boîtes automatiques, électrique." },
  { code: "S", label: "Luxe", name: "Luxe & Prestige", fromPrice: 89, seoSlug: "location-voiture-luxe-belgique", minAge: 23, minLicenseYears: 5, tagline: "Le raffinement des grandes marques allemandes." },
  { code: "S+", label: "Supercar", name: "Supercars", fromPrice: 500, seoSlug: "location-supercar-belgique", minAge: 23, minLicenseYears: 5, tagline: "Performances d'exception, expérience inoubliable." },
];

export function getCategory(code: CategoryCode) {
  return CATEGORIES.find((c) => c.code === code)!;
}

export function getCategoryBySeoSlug(slug: string) {
  return CATEGORIES.find((c) => c.seoSlug === slug);
}

export function parseCategory(value: string | null | undefined): CategoryCode | undefined {
  if (!value) return undefined;
  const v = value.trim().toUpperCase().replace(" ", "+");
  return CATEGORIES.find((c) => c.code === v || c.label.toUpperCase() === v)?.code;
}

export const CAUTION_TEXT = "Communiquée sur demande selon véhicule et durée de location";

export function conditionsFor(code: CategoryCode) {
  const c = getCategory(code);
  return { minAge: c.minAge, minLicenseYears: c.minLicenseYears, caution: CAUTION_TEXT };
}
