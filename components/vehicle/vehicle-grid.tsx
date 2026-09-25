import { VehicleTiltCard } from "./vehicle-tilt-card";
import { vehicleHref, type Vehicle } from "@/lib/vehicles";
import { cn } from "@/lib/utils";

/**
 * Mobile : cartes empilées. Desktop : grille qui remplit la largeur disponible.
 * `layout="fixed"` : 2 puis 4 colonnes (sélections de 4 véhicules, sans carte orpheline).
 */
export function VehicleGrid({
  vehicles,
  city,
  query,
  unavailable,
  priorityCount = 0,
  layout = "fluid",
}: {
  vehicles: Vehicle[];
  city?: string;
  /** Paramètres transmis à la fiche (dates / ville recherchées) */
  query?: string;
  unavailable?: Set<string>;
  /** Nombre d'images chargées en priorité (uniquement si la grille est en haut de page) */
  priorityCount?: number;
  layout?: "fluid" | "fixed";
}) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-6 lg:gap-8",
        layout === "fixed" ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-[repeat(auto-fill,minmax(17rem,1fr))]",
      )}
    >
      {vehicles.map((v, i) => (
        <li key={v.id} className="flex justify-center">
          <VehicleTiltCard
            vehicle={v}
            city={city}
            priority={i < priorityCount}
            unavailable={unavailable?.has(v.id)}
            ctaHref={query ? `${vehicleHref(v)}?${query}` : undefined}
          />
        </li>
      ))}
    </ul>
  );
}
