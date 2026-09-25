import Link from "next/link";
import { Hero } from "@/components/home/hero";
import { About, Presentation, Process, Services } from "@/components/home/sections";
import { SectionHeading } from "@/components/ui/section-heading";
import { VehicleGrid } from "@/components/vehicle/vehicle-grid";
import { VEHICLES, getVehicleById, type Vehicle } from "@/lib/vehicles";

const FEATURED = ["porsche-taycan", "bmw-x2", "vw-t-roc", "renault-4-e-tech"].map(getVehicleById).filter(Boolean) as Vehicle[];

export default function HomePage() {
  return (
    <>
      <Hero />
      <Presentation />
      <section className="border-t border-white/5 py-24 md:py-32">
        <div className="container">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading eyebrow="La collection" title="Sélection du moment.">
              {VEHICLES.length} véhicules, de la citadine économique à la supercar électrique.
            </SectionHeading>
            <Link href="/vehicules" className="btn-ghost self-start md:self-auto">
              Toute la collection
            </Link>
          </div>
          <VehicleGrid vehicles={FEATURED} layout="fixed" />
        </div>
      </section>
      <Services />
      <Process />
      <About />
    </>
  );
}
