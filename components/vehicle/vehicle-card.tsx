import Image from "next/image";
import Link from "next/link";
import { getCategory } from "@/lib/categories";
import { cn, formatPrice } from "@/lib/utils";
import { vehicleHref, vehicleName, type Vehicle } from "@/lib/vehicles";

/**
 * Carte catalogue : la photo d'abord (pleine largeur, format 4:3), les informations dessous sur fond uni.
 * Toute la carte est cliquable (lien étendu sur le titre). Le prix est le seul élément doré.
 * Survol : léger zoom de la photo (300 ms, appareils à souris uniquement). Clic : retour tactile discret.
 */
export function VehicleCard({
  vehicle,
  city,
  href,
  priority,
  unavailable,
  className,
}: {
  vehicle: Vehicle;
  /** Ville affichée (ville recherchée) ; par défaut, ville de rattachement */
  city?: string;
  href?: string;
  priority?: boolean;
  /** Indisponible sur les dates recherchées */
  unavailable?: boolean;
  className?: string;
}) {
  const category = getCategory(vehicle.category);
  const badge = unavailable ? "Indisponible à ces dates" : vehicle.available ? null : "Sur demande";

  return (
    <article
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-anthracite transition-[border-color,transform] duration-200 hover:border-white/20 active:scale-[0.99]",
        unavailable && "opacity-70",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-graphite">
        {vehicle.cardImage && (
          <Image
            src={vehicle.cardImage}
            alt={`Location ${vehicleName(vehicle, "full")}`}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 85vw"
            quality={60}
            priority={priority}
            className="object-cover transition-transform duration-300 [@media(hover:hover)]:group-hover:scale-[1.03]"
          />
        )}
        {badge && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-3 py-1 text-xs text-subtle">{badge}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-silver">{category.name}</p>
        <h3 className="mt-1.5 font-display text-2xl leading-tight">
          <Link href={href ?? vehicleHref(vehicle)} className="after:absolute after:inset-0 focus-visible:outline-none after:focus-visible:rounded-xl after:focus-visible:outline after:focus-visible:outline-1 after:focus-visible:outline-gold">
            {vehicle.brand} {vehicle.model}
          </Link>
        </h3>
        {vehicle.variant && <p className="mt-0.5 text-sm text-muted">{vehicle.variant}</p>}
        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <ul className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted">
            <li className="nums">{vehicle.powerHp} ch</li>
            <li>{vehicle.transmission === "Automatique" ? "Automatique" : "Manuelle"}</li>
            <li>{city ?? vehicle.baseCity}</li>
          </ul>
          <p className="nums shrink-0 text-right leading-none">
            <span className="font-display text-[1.75rem] text-gold">{formatPrice(vehicle.pricePerDay)}</span>
            <span className="block pt-1 text-xs text-muted">par jour</span>
          </p>
        </div>
      </div>
    </article>
  );
}
