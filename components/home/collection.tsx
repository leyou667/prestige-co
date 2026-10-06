import Link from "next/link";
import { CategoryRail } from "./category-rail";
import { VehicleGrid } from "@/components/vehicle/vehicle-grid";
import { MIN_PRICE } from "@/lib/categories";
import { VEHICLES, getVehicleById, type Vehicle } from "@/lib/vehicles";

const FEATURED = ["porsche-taycan", "bmw-x2", "vw-t-roc", "renault-4-e-tech"].map(getVehicleById).filter(Boolean) as Vehicle[];

/** Juste après le hero : les catégories en images, puis la sélection du moment. */
export function Collection() {
  return (
    <section aria-labelledby="collection-titre" className="pb-24 pt-16 md:pb-32 md:pt-24">
      <div className="container">
        <div className="mb-20 flex flex-col justify-between gap-6 md:mb-24 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 id="collection-titre" className="font-display text-4xl font-light leading-[1.05] sm:text-5xl lg:text-[3.5rem]">
              La collection
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
              {VEHICLES.length} véhicules, de la citadine à {MIN_PRICE} € par jour jusqu&apos;à la Porsche Taycan. Chacun est contrôlé,
              nettoyé et préparé avant la remise des clés.
            </p>
          </div>
          <Link href="/vehicules" className="btn-ghost self-start md:self-auto">
            Voir la collection
          </Link>
        </div>

        <CategoryRail />

        <h3 className="h-sub mb-8 mt-20 md:mt-24">Sélection du moment</h3>
        <VehicleGrid vehicles={FEATURED} layout="carousel" />
      </div>
    </section>
  );
}
