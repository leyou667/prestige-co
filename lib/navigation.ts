/** Navigation partagée par le header (desktop + mobile) et le footer. */
export interface NavItem {
  label: string;
  href: string;
  /** Préfixes d'URL considérés comme faisant partie de la rubrique */
  match?: (pathname: string) => boolean;
}

export const MAIN_NAV: NavItem[] = [
  { label: "Accueil", href: "/", match: (p) => p === "/" },
  {
    label: "Collection",
    href: "/vehicules",
    match: (p) => p.startsWith("/vehicules") || p.startsWith("/location-"),
  },
  { label: "Services", href: "/services" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
];

export const SECONDARY_NAV: NavItem[] = [
  { label: "Demander un devis", href: "/devis" },
  { label: "Conditions générales", href: "/conditions-generales" },
];

export function isActive(item: NavItem, pathname: string) {
  return item.match ? item.match(pathname) : pathname.startsWith(item.href);
}
