import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/lib/vehicles";

/**
 * Visuel de carte catalogue.
 * - `cardImage` (photo du véhicule, object-fit: cover, sans déformation) ;
 * - sinon placeholder stylé : silhouette graphique + monogramme sur fond noir/anthracite
 *   (ou première photo de galerie si elle existe).
 */
export function VehicleVisual({
  vehicle,
  className,
  sizes = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw",
  priority,
}: {
  vehicle: Vehicle;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const alt = `Location ${vehicle.brand} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ""} — PRESTIGE CONCIERGERIE`;

  if (vehicle.cardImage) {
    return <Image src={vehicle.cardImage} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", className)} />;
  }

  const photo = vehicle.photos[0];
  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_50%_35%,#2a2a2a_0%,#111_55%,#0A0A0A_100%)]", className)}>
      {photo ? (
        <Image
          src={photo.src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover brightness-[0.6] contrast-[1.15] saturate-[0.55]"
        />
      ) : (
        <>
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-[16%] text-center font-display text-[5.5rem] leading-none text-white/[0.05]"
          >
            {vehicle.brand.split(" ")[0]}
          </span>
          <CarSilhouette className="absolute left-1/2 top-[38%] w-[86%] -translate-x-1/2 text-white/25" />
          <div className="absolute left-1/2 top-[58%] h-6 w-3/4 -translate-x-1/2 rounded-[100%] bg-black/70 blur-md" />
          <span role="img" aria-label={alt} />
        </>
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)]" />
    </div>
  );
}

function CarSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 120" fill="none" className={className} aria-hidden="true">
      <path
        d="M18 88c-6 0-8-4-7-10l3-12c1-5 5-8 10-9l52-8c14-2 26-8 38-15l22-13c10-6 22-9 34-9h78c16 0 30 5 43 14l24 17c5 4 11 6 17 7l40 7c8 2 13 8 14 16l1 8c1 5-3 9-8 9h-20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M100 88h170" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M150 38l-10 20h140l-26-18c-9-6-19-8-29-8h-54c-8 0-15 2-21 6z" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <circle cx="75" cy="88" r="21" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="75" cy="88" r="10" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="298" cy="88" r="21" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="298" cy="88" r="10" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}
