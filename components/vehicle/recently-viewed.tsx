"use client";

import * as React from "react";
import Link from "next/link";
import { History } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getVehicleById, vehicleHref, vehicleName, type Vehicle } from "@/lib/vehicles";
import { VehicleVisual } from "./vehicle-visual";

const KEY = "pc-recent";
const MAX = 4;

function read(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** À placer sur la fiche : mémorise le véhicule consulté (localement, sur l'appareil du visiteur). */
export function TrackRecentlyViewed({ id }: { id: string }) {
  React.useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify([id, ...read().filter((x) => x !== id)].slice(0, MAX)));
    } catch {}
  }, [id]);
  return null;
}

/** « Récemment consultés » : retrouver en un geste les véhicules déjà regardés. */
export function RecentlyViewed() {
  const [items, setItems] = React.useState<Vehicle[]>([]);
  React.useEffect(() => {
    setItems(read().map((id) => getVehicleById(id)).filter((v): v is Vehicle => Boolean(v)));
  }, []);
  if (!items.length) return null;
  return (
    <section aria-labelledby="recents" className="mb-10">
      <h2 id="recents" className="label mb-3 flex items-center gap-2">
        <History className="h-3.5 w-3.5" aria-hidden="true" /> Récemment consultés
      </h2>
      <ul className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:px-0">
        {items.map((v) => (
          <li key={v.id} className="shrink-0">
            <Link href={vehicleHref(v)} className="flex w-60 items-center gap-3 rounded-xl border border-white/10 bg-anthracite p-2 transition hover:border-gold/50">
              <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg">
                <VehicleVisual vehicle={v} sizes="64px" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm">{vehicleName(v)}</span>
                <span className="nums block text-xs text-muted">{formatPrice(v.pricePerDay)} / jour</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
