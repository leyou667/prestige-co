import { VehicleTiltCard } from "@/components/ui/vehicle-tilt-card";
import { vehicleHref, type Vehicle } from "@/lib/vehicles";

/** Mobile : cartes empilées. Desktop : grille qui remplit la largeur disponible. */
export function VehicleGrid({
  vehicles,
  city,
  query,
  unavailable,
}: {
  vehicles: Vehicle[];
  city?: string;
  /** Paramètres transmis à la fiche (dates / ville recherchées) */
  query?: string;
  unavailable?: Set<string>;
}) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] lg:gap-8">
      {vehicles.map((v, i) => (
        <li key={v.id} className="flex justify-center">
          <VehicleTiltCard
            vehicle={v}
            city={city}
            priority={i < 4}
            unavailable={unavailable?.has(v.id)}
            ctaHref={query ? `${vehicleHref(v)}?${query}` : undefined}
          />
        </li>
      ))}
    </ul>
  );
}
