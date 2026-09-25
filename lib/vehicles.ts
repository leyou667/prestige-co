import type { CategoryCode } from "./categories";
import { ZONES, ALL_CITIES, type CityName } from "./cities";

export type Fuel = "Essence" | "Diesel" | "Électrique";
export type Transmission = "Manuelle" | "Automatique";

export interface VehiclePhoto {
  src: string;
  alt: string;
}

export type VehicleStyle = "eco" | "confort" | "sport" | "luxe";

export interface Vehicle {
  /** Identifiant stable (utilisé aussi comme tag Google Calendar) */
  id: string;
  brand: string;
  model: string;
  /** Précision affichée sous le modèle (aménagement, finition…) */
  variant?: string;
  category: CategoryCode;
  year: number;
  pricePerDay: number;
  powerHp: number;
  engine: string;
  fuel: Fuel;
  transmission: Transmission;
  seats: number;
  doors: number;
  features: string[];
  /** Style dominant, utilisé par le conseiller */
  style: VehicleStyle;
  baseCity: CityName;
  cities: CityName[];
  available: boolean;
  /** Photo de la carte catalogue (object-fit: cover) */
  cardImage?: string;
  photos: VehiclePhoto[];
  description: string;
}

const uniq = (...lists: readonly (readonly CityName[])[]): CityName[] => Array.from(new Set(lists.flat()));

/** Véhicules dont la photo principale a un fond retravaillé (fichier <id>-studio.jpg). */
const STUDIO_PHOTOS = new Set([
  "renault-twingo",
  "ford-fiesta",
  "fiat-punto",
  "citroen-c5-sw",
  "citroen-nemo",
  "renault-kangoo-echelle-plancher",
  "toyota-yaris",
  "renault-4-e-tech",
  "bmw-x2",
  "vw-t-roc",
]);

function studioPhoto(id: string) {
  return `/vehicules/${id}/${id}-studio.jpg`;
}

function gallery(id: string, label: string, views: string[]): VehiclePhoto[] {
  return views.map((view, i) => ({
    // La photo retravaillée remplace la 1re vue (même angle)
    src: i === 0 && STUDIO_PHOTOS.has(id) ? studioPhoto(id) : `/vehicules/${id}/${id}-${String(i + 1).padStart(2, "0")}.jpg`,
    alt: `${label} — ${view} — location PRESTIGE CONCIERGERIE`,
  }));
}

type Seed = Omit<Vehicle, "photos" | "available" | "cities"> & {
  views?: string[];
  cities?: CityName[];
  available?: boolean;
};

const BRUXELLES_WALLONIE = uniq(ZONES.bruxellesBrabant, ZONES.wallonie);
const BELGIQUE = uniq(ZONES.bruxellesBrabant, ZONES.wallonie, ZONES.flandre);
const NORD = uniq(ZONES.nordFrance, ["Bruxelles", "Mons", "Charleroi"]);

const SEEDS: Seed[] = [
  // ─── D — ÉCONOMIQUES ──────────────────────────────────────────
  {
    id: "renault-twingo", brand: "Renault", model: "Twingo", category: "D", year: 2011, pricePerDay: 29,
    powerHp: 60, engine: "1.1 Essence", fuel: "Essence", transmission: "Manuelle", seats: 4, doors: 3, style: "eco",
    features: ["Citadine compacte", "Faible consommation", "Idéale en centre-ville"], baseCity: "Charleroi", cities: BRUXELLES_WALLONIE,
    views: ["vue trois-quarts avant", "vue trois-quarts arrière", "vue arrière", "sièges avant", "banquette arrière"],
    description: "La Renault Twingo est la citadine idéale pour se faufiler en ville : compacte, économique et facile à garer.",
  },
  {
    id: "opel-adam", brand: "Opel", model: "Adam", category: "D", year: 2016, pricePerDay: 32,
    powerHp: 70, engine: "1.2 Essence", fuel: "Essence", transmission: "Manuelle", seats: 4, doors: 3, style: "eco",
    features: ["Design personnalisé", "Écran tactile", "Idéale en ville"], baseCity: "Bruxelles", cities: BRUXELLES_WALLONIE,
    description: "L'Opel Adam allie style urbain et sobriété, parfaite pour les trajets du quotidien.",
  },
  {
    id: "alfa-romeo-mito", brand: "Alfa Romeo", model: "MiTo", category: "D", year: 2012, pricePerDay: 35,
    powerHp: 78, engine: "1.4 Essence", fuel: "Essence", transmission: "Manuelle", seats: 5, doors: 3, style: "sport",
    features: ["Caractère sportif italien", "Sélecteur DNA", "Faible consommation"], baseCity: "Charleroi", cities: BRUXELLES_WALLONIE,
    views: ["vue trois-quarts avant", "vue avant", "vue trois-quarts avant droite", "vue trois-quarts arrière", "vue arrière", "coffre", "banquette arrière"],
    description: "L'Alfa Romeo MiTo apporte une touche de sportivité italienne à la catégorie économique.",
  },
  // ─── C — COMPACTES ────────────────────────────────────────────
  {
    id: "ford-fiesta", brand: "Ford", model: "Fiesta", category: "C", year: 2011, pricePerDay: 39,
    powerHp: 60, engine: "1.2 Essence", fuel: "Essence", transmission: "Manuelle", seats: 5, doors: 3, style: "eco",
    features: ["Tenue de route réputée", "Économique", "Climatisation"], baseCity: "Charleroi", cities: BRUXELLES_WALLONIE,
    views: ["vue trois-quarts avant", "vue trois-quarts avant droite", "vue avant", "vue trois-quarts arrière", "vue arrière", "sièges avant", "banquette arrière"],
    description: "La Ford Fiesta, compacte agile et fiable, pour la ville comme pour les escapades du week-end.",
  },
  {
    id: "fiat-punto", brand: "Fiat", model: "Punto", category: "C", year: 2014, pricePerDay: 39,
    powerHp: 69, engine: "1.2 Essence", fuel: "Essence", transmission: "Manuelle", seats: 5, doors: 3, style: "eco",
    features: ["Habitacle spacieux", "Économique", "Climatisation"], baseCity: "Namur", cities: BRUXELLES_WALLONIE,
    views: ["vue trois-quarts avant", "vue avant", "vue trois-quarts arrière", "vue arrière", "vue trois-quarts arrière droite", "sièges avant", "banquette arrière"],
    description: "La Fiat Punto offre un habitacle généreux et une conduite simple, pour tous les usages.",
  },
  {
    id: "ford-focus", brand: "Ford", model: "Focus", category: "C", year: 2012, pricePerDay: 45,
    powerHp: 80, engine: "1.4 Essence", fuel: "Essence", transmission: "Manuelle", seats: 5, doors: 5, style: "confort",
    features: ["5 portes", "Grand coffre", "Régulateur de vitesse"], baseCity: "Lille", cities: NORD,
    description: "La Ford Focus, compacte polyvalente et confortable sur autoroute comme en ville.",
  },
  {
    id: "opel-corsa-e", brand: "Opel", model: "Corsa E", category: "C", year: 2017, pricePerDay: 42,
    powerHp: 70, engine: "1.2 Essence", fuel: "Essence", transmission: "Manuelle", seats: 5, doors: 5, style: "eco",
    features: ["5 portes", "Bluetooth", "Faible consommation"], baseCity: "Bruxelles", cities: BELGIQUE,
    description: "L'Opel Corsa E, compacte moderne et économique, idéale pour vos déplacements quotidiens.",
  },
  {
    id: "dacia-sandero", brand: "Dacia", model: "Sandero", category: "C", year: 2019, pricePerDay: 39,
    powerHp: 73, engine: "1.0 Essence", fuel: "Essence", transmission: "Manuelle", seats: 5, doors: 5, style: "eco",
    features: ["5 portes", "Coffre de 320 L", "Excellent rapport qualité-prix"], baseCity: "Mons", cities: uniq(BRUXELLES_WALLONIE, ZONES.nordFrance),
    description: "La Dacia Sandero, spacieuse et économique, le choix malin pour tous les trajets.",
  },
  // ─── B — CONFORT ──────────────────────────────────────────────
  {
    id: "citroen-c5-sw", brand: "Citroën", model: "C5 SW", category: "B", year: 2012, pricePerDay: 59,
    powerHp: 120, engine: "1.6 Essence", fuel: "Essence", transmission: "Manuelle", seats: 5, doors: 5, style: "confort",
    features: ["Break familial", "Très grand coffre", "Confort de suspension"], baseCity: "Namur", cities: BELGIQUE,
    views: ["vue trois-quarts avant", "vue avant", "vue trois-quarts avant droite", "vue trois-quarts arrière", "vue arrière", "vue trois-quarts arrière droite", "coffre"],
    description: "Le Citroën C5 SW, break au confort de roulement remarquable et au coffre généreux, parfait pour les voyages.",
  },
  {
    id: "peugeot-2008", brand: "Peugeot", model: "2008", category: "B", year: 2018, pricePerDay: 55,
    powerHp: 110, engine: "1.2 Essence", fuel: "Essence", transmission: "Manuelle", seats: 5, doors: 5, style: "confort",
    features: ["SUV urbain", "i-Cockpit", "Position de conduite haute"], baseCity: "Lille", cities: NORD,
    description: "Le Peugeot 2008, SUV urbain au design affirmé, confortable et polyvalent.",
  },
  {
    id: "citroen-c4-picasso", brand: "Citroën", model: "C4 Picasso", variant: "7 places", category: "B", year: 2012, pricePerDay: 65,
    powerHp: 120, engine: "1.6 Essence", fuel: "Essence", transmission: "Manuelle", seats: 7, doors: 5, style: "confort",
    features: ["7 places", "Grande luminosité", "Idéal familles"], baseCity: "Bruxelles", cities: BELGIQUE,
    description: "Le Citroën C4 Picasso 7 places, le monospace idéal pour les familles et les groupes.",
  },
  {
    id: "renault-clio", brand: "Renault", model: "Clio", category: "B", year: 2020, pricePerDay: 49,
    powerHp: 90, engine: "1.0 Essence", fuel: "Essence", transmission: "Manuelle", seats: 5, doors: 5, style: "confort",
    features: ["Écran multimédia", "Aides à la conduite", "Faible consommation"], baseCity: "Liège", cities: BELGIQUE,
    description: "La Renault Clio, citadine polyvalente et moderne, confortable sur tous les trajets.",
  },
  {
    id: "fiat-500", brand: "Fiat", model: "500", category: "B", year: 2017, pricePerDay: 49,
    powerHp: 69, engine: "1.2 Essence", fuel: "Essence", transmission: "Manuelle", seats: 4, doors: 3, style: "confort",
    features: ["Icône du design italien", "Maniable", "Idéale en ville"], baseCity: "Bruxelles", cities: uniq(ZONES.bruxellesBrabant, ZONES.picardieParis),
    description: "La Fiat 500, icône du style italien, charmante et parfaitement adaptée à la ville.",
  },
  {
    id: "opel-astra-plus", brand: "Opel", model: "Astra Plus", category: "B", year: 2013, pricePerDay: 55,
    powerHp: 115, engine: "1.6 Essence", fuel: "Essence", transmission: "Manuelle", seats: 5, doors: 5, style: "confort",
    features: ["Grand coffre", "Régulateur de vitesse", "Confort routier"], baseCity: "Gand", cities: BELGIQUE,
    description: "L'Opel Astra Plus, familiale confortable et spacieuse, taillée pour la route.",
  },
  {
    id: "renault-captur", brand: "Renault", model: "Captur", category: "B", year: 2020, pricePerDay: 55,
    powerHp: 90, engine: "1.0 Essence", fuel: "Essence", transmission: "Manuelle", seats: 5, doors: 5, style: "confort",
    features: ["SUV compact", "Banquette coulissante", "Écran multimédia"], baseCity: "Lille", cities: uniq(NORD, ZONES.picardieParis),
    description: "Le Renault Captur, SUV compact modulable et confortable, pour la ville comme pour les vacances.",
  },
  {
    id: "fiat-500l", brand: "Fiat", model: "500L", category: "B", year: 2016, pricePerDay: 59,
    powerHp: 105, engine: "1.6 Diesel", fuel: "Diesel", transmission: "Manuelle", seats: 5, doors: 5, style: "confort",
    features: ["Habitacle très spacieux", "Diesel économique", "Idéal voyages"], baseCity: "Anvers", cities: BELGIQUE,
    description: "La Fiat 500L, monospace compact au volume intérieur surprenant et au diesel sobre.",
  },
  {
    id: "citroen-c3", brand: "Citroën", model: "C3", category: "B", year: 2018, pricePerDay: 49,
    powerHp: 82, engine: "1.2 Essence", fuel: "Essence", transmission: "Manuelle", seats: 5, doors: 5, style: "confort",
    features: ["Suspensions confortables", "Airbump", "Écran tactile"], baseCity: "Valenciennes", cities: uniq(NORD, ZONES.picardieParis),
    description: "La Citroën C3, citadine au confort signature Citroën et au style singulier.",
  },
  // ─── U — UTILITAIRES ──────────────────────────────────────────
  {
    id: "renault-kangoo-galerie", brand: "Renault", model: "Kangoo II", variant: "Galerie de toit", category: "U", year: 2012, pricePerDay: 49,
    powerHp: 90, engine: "1.5 dCi Diesel", fuel: "Diesel", transmission: "Manuelle", seats: 2, doors: 4, style: "eco",
    features: ["Galerie de toit", "Portes arrière battantes", "Porte latérale"], baseCity: "Charleroi", cities: BRUXELLES_WALLONIE,
    views: ["vue trois-quarts avant", "vue avant", "vue trois-quarts arrière", "vue arrière", "vue trois-quarts arrière gauche", "vue trois-quarts avant droite", "espace de chargement", "poste de conduite"],
    description: "Le Renault Kangoo II équipé d'une galerie de toit, pratique pour transporter vos matériaux longs.",
  },
  {
    id: "citroen-nemo", brand: "Citroën", model: "Nemo", variant: "Cloison", category: "U", year: 2013, pricePerDay: 45,
    powerHp: 68, engine: "1.4 HDi Diesel", fuel: "Diesel", transmission: "Manuelle", seats: 2, doors: 4, style: "eco",
    features: ["Cloison de séparation", "Compact et maniable", "Diesel économique"], baseCity: "Charleroi", cities: BRUXELLES_WALLONIE,
    views: ["vue trois-quarts avant", "vue avant", "vue trois-quarts arrière", "vue arrière", "vue trois-quarts arrière droite", "poste de conduite", "espace de chargement"],
    description: "Le Citroën Nemo avec cloison, petit utilitaire maniable, idéal pour les livraisons urbaines.",
  },
  {
    id: "dacia-dokker", brand: "Dacia", model: "Dokker", category: "U", year: 2017, pricePerDay: 45,
    powerHp: 95, engine: "1.3 Diesel", fuel: "Diesel", transmission: "Manuelle", seats: 2, doors: 4, style: "eco",
    features: ["Grand volume utile", "Porte latérale", "Robuste"], baseCity: "Lille", cities: NORD,
    description: "Le Dacia Dokker, utilitaire robuste au grand volume de chargement.",
  },
  {
    id: "renault-kangoo-echelle-plancher", brand: "Renault", model: "Kangoo II", variant: "Échelle + plancher", category: "U", year: 2011, pricePerDay: 55,
    powerHp: 90, engine: "1.5 dCi Diesel", fuel: "Diesel", transmission: "Manuelle", seats: 2, doors: 4, style: "eco",
    features: ["Échelle", "Plancher aménagé", "Grille de séparation"], baseCity: "Namur", cities: BRUXELLES_WALLONIE,
    views: ["vue trois-quarts avant", "vue profil", "vue arrière", "poste de conduite", "espace de chargement", "chargement portes ouvertes", "plancher aménagé"],
    description: "Le Renault Kangoo II aménagé avec échelle et plancher, prêt pour vos chantiers.",
  },
  // ─── A — PREMIUM ──────────────────────────────────────────────
  {
    id: "toyota-yaris", brand: "Toyota", model: "Yaris", category: "A", year: 2021, pricePerDay: 59,
    powerHp: 122, engine: "1.5 Essence", fuel: "Essence", transmission: "Automatique", seats: 5, doors: 5, style: "confort",
    features: ["Boîte automatique", "Aides à la conduite", "Très faible consommation"], baseCity: "Charleroi", cities: BELGIQUE,
    views: ["vue trois-quarts avant", "vue avant", "vue trois-quarts arrière", "vue arrière", "sièges avant", "banquette arrière"],
    description: "La Toyota Yaris 122 ch à boîte automatique, douce, sûre et remarquablement sobre.",
  },
  {
    id: "vw-t-roc", brand: "Volkswagen", model: "T-Roc", category: "A", year: 2023, pricePerDay: 75,
    powerHp: 150, engine: "1.5 Essence", fuel: "Essence", transmission: "Manuelle", seats: 5, doors: 5, style: "sport",
    features: ["Toit panoramique", "Cockpit digital", "150 ch"], baseCity: "Bruxelles", cities: uniq(BELGIQUE, ZONES.nordFrance),
    views: ["vue avant", "vue trois-quarts arrière", "vue arrière", "vue trois-quarts arrière gauche", "intérieur et toit panoramique"],
    description: "Le Volkswagen T-Roc 150 ch avec toit panoramique, SUV compact dynamique et raffiné.",
  },
  {
    id: "renault-4-e-tech", brand: "Renault", model: "4 E-Tech", category: "A", year: 2025, pricePerDay: 69,
    powerHp: 150, engine: "100 % électrique", fuel: "Électrique", transmission: "Automatique", seats: 5, doors: 5, style: "confort",
    features: ["100 % électrique", "Zéro émission", "Écran OpenR Link"], baseCity: "Bruxelles", cities: uniq(BELGIQUE, ["Lille", "Paris"]),
    views: ["vue trois-quarts avant", "vue avant", "vue arrière", "habitacle", "poste de conduite", "tableau de bord"],
    description: "La nouvelle Renault 4 E-Tech 100 % électrique, icône réinventée, silencieuse et connectée.",
  },
  // ─── S — LUXE & PRESTIGE ──────────────────────────────────────
  {
    id: "bmw-x2", brand: "BMW", model: "X2", variant: "Pack M", category: "S", year: 2024, pricePerDay: 89,
    powerHp: 150, engine: "2.0 Diesel", fuel: "Diesel", transmission: "Automatique", seats: 5, doors: 5, style: "luxe",
    features: ["Pack M", "SUV coupé", "Boîte automatique", "Curved Display"], baseCity: "Bruxelles", cities: ALL_CITIES,
    views: ["vue trois-quarts avant", "vue avant", "vue profil arrière", "vue trois-quarts arrière", "vue arrière", "banquette arrière", "poste de conduite", "tableau de bord"],
    description: "Le BMW X2 Pack M, SUV coupé au caractère affirmé, alliance du luxe et de la performance.",
  },
  // ─── S+ — SUPERCARS ───────────────────────────────────────────
  {
    id: "porsche-taycan", brand: "Porsche", model: "Taycan", category: "S+", year: 2022, pricePerDay: 500,
    powerHp: 408, engine: "Électrique", fuel: "Électrique", transmission: "Automatique", seats: 4, doors: 4, style: "sport",
    features: ["408 ch", "100 % électrique", "Sportive grand tourisme"], baseCity: "Bruxelles", cities: ALL_CITIES,
    views: ["vue trois-quarts arrière de nuit"],
    description: "La Porsche Taycan 408 ch, sportive électrique d'exception : accélérations foudroyantes et silence absolu.",
  },
];

/**
 * Photo de carte catalogue par véhicule : la photo avec fond retravaillé (aussi 1re photo de la galerie),
 * ou la photo d'origine de /public/catalogue-1-photo pour les véhicules pas encore traités.
 * Les véhicules absents de cette table affichent le placeholder stylé.
 */
const CARD_IMAGES: Record<string, string> = {
  "alfa-romeo-mito": "/catalogue-1-photo/D_Alfa-Romeo-MiTo.jpg",
  "renault-twingo": "/vehicules/renault-twingo/renault-twingo-studio.jpg",
  "ford-fiesta": "/vehicules/ford-fiesta/ford-fiesta-studio.jpg",
  "fiat-punto": "/vehicules/fiat-punto/fiat-punto-studio.jpg",
  "citroen-c5-sw": "/vehicules/citroen-c5-sw/citroen-c5-sw-studio.jpg",
  "citroen-nemo": "/vehicules/citroen-nemo/citroen-nemo-studio.jpg",
  "renault-kangoo-galerie": "/catalogue-1-photo/U_Renault-Kangoo-II-galerie-toit.jpg",
  "renault-kangoo-echelle-plancher": "/vehicules/renault-kangoo-echelle-plancher/renault-kangoo-echelle-plancher-studio.jpg",
  "toyota-yaris": "/vehicules/toyota-yaris/toyota-yaris-studio.jpg",
  "vw-t-roc": "/vehicules/vw-t-roc/vw-t-roc-studio.jpg",
  "renault-4-e-tech": "/vehicules/renault-4-e-tech/renault-4-e-tech-studio.jpg",
  "bmw-x2": "/vehicules/bmw-x2/bmw-x2-studio.jpg",
  // Photo provisoire, en attendant la photo dédiée de la Taycan
  "porsche-taycan": "/vehicules/porsche-taycan/porsche-taycan-01.jpg",
};


export const VEHICLES: Vehicle[] = SEEDS.map(({ views, cities, available, ...v }) => ({
  ...v,
  cities: cities ?? [v.baseCity],
  available: available ?? true,
  cardImage: v.cardImage ?? CARD_IMAGES[v.id],
  photos: views ? gallery(v.id, `${v.brand} ${v.model}`, views) : [],
}));

/**
 * Libellé unique d'un véhicule.
 * - "short"  : Renault Kangoo II
 * - "full"   : Renault Kangoo II (Galerie de toit)
 */
export function vehicleName(v: Pick<Vehicle, "brand" | "model" | "variant">, format: "short" | "full" = "short") {
  const base = `${v.brand} ${v.model}`;
  return format === "full" && v.variant ? `${base} (${v.variant})` : base;
}

/** URL SEO propre : /location-porsche-taycan-belgique */
export function vehicleSlug(v: Pick<Vehicle, "id">) {
  return `location-${v.id}-belgique`;
}

export function vehicleHref(v: Pick<Vehicle, "id">) {
  return `/${vehicleSlug(v)}`;
}

export function getVehicleById(id: string | null | undefined) {
  return id ? VEHICLES.find((v) => v.id === id) : undefined;
}

export function getVehicleBySlug(slug: string) {
  return VEHICLES.find((v) => vehicleSlug(v) === slug);
}

export const BRANDS = Array.from(new Set(VEHICLES.map((v) => v.brand))).sort((a, b) => a.localeCompare(b, "fr"));
export const PRICE_RANGE = [0, Math.max(...VEHICLES.map((v) => v.pricePerDay))] as const;
export const POWER_RANGE = [0, Math.max(...VEHICLES.map((v) => v.powerHp))] as const;
