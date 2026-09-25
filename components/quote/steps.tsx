"use client";

import { AlertTriangle } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { citiesForVehicle } from "@/lib/cities";
import { RENTAL_OPTIONS, optionPrice } from "@/lib/options";
import { cn, formatPrice } from "@/lib/utils";
import { VEHICLES, vehicleName, type Vehicle } from "@/lib/vehicles";
import { Checkbox } from "@/components/ui/checkbox";
import { DateRangeFields } from "@/components/forms/date-range-fields";
import { VehicleVisual } from "@/components/vehicle/vehicle-visual";
import { AvailabilityCalendar, type useAvailability } from "@/components/vehicle/availability-calendar";

const legend = "mb-6 font-display text-3xl font-light";

export function VehicleStep({ selected, onPick }: { selected: string; onPick: (id: string) => void }) {
  return (
    <fieldset>
      <legend className={legend}>Quel véhicule ?</legend>
      {CATEGORIES.map((c) => (
        <div key={c.code} className="mb-8">
          <p className="eyebrow mb-3">{c.name}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {VEHICLES.filter((v) => v.category === c.code).map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => onPick(v.id)}
                aria-pressed={v.id === selected}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-2.5 text-left transition",
                  v.id === selected ? "border-gold bg-gold/10" : "border-white/10 bg-anthracite hover:border-white/30",
                )}
              >
                <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                  <VehicleVisual vehicle={v} sizes="80px" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm">{vehicleName(v)}</span>
                  {v.variant && <span className="block truncate text-2xs text-muted">{v.variant}</span>}
                  <span className="nums block text-xs text-muted">{formatPrice(v.pricePerDay)} / jour</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </fieldset>
  );
}

export function CityStep({ vehicle, selected, onPick }: { vehicle: Vehicle; selected: string; onPick: (slug: string) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 font-display text-3xl font-light">Dans quelle ville ?</legend>
      <p className="mb-6 text-sm text-muted">Villes où la {vehicleName(vehicle)} peut être livrée.</p>
      <div className="flex flex-wrap gap-2">
        {citiesForVehicle(vehicle).map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => onPick(c.slug)}
            aria-pressed={c.slug === selected}
            className={cn(
              "min-h-11 rounded-full border px-4 py-2.5 text-sm transition",
              c.slug === selected ? "border-gold bg-gold text-ink" : "border-white/15 text-subtle hover:border-white/40",
            )}
          >
            {c.name}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function DatesStep({
  from,
  to,
  onChange,
  availability,
  free,
}: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  availability: ReturnType<typeof useAvailability>;
  free: boolean;
}) {
  return (
    <fieldset>
      <legend className={legend}>Quelles dates ?</legend>
      <div className="mb-5 grid max-w-md grid-cols-2 gap-3">
        <DateRangeFields from={from} to={to} onChange={onChange} labels={["Date de départ", "Date de retour"]} />
      </div>
      <AvailabilityCalendar availability={availability} from={from} to={to} onSelect={onChange} />
      {!free && (
        <p className="mt-4 inline-flex items-center gap-2 text-sm text-red-300" role="alert">
          <AlertTriangle className="h-4 w-4" /> Le véhicule est déjà réservé sur une partie de cette période.
        </p>
      )}
    </fieldset>
  );
}

export interface Contact {
  name: string;
  phone: string;
  email: string;
}

export function OptionsStep({
  vehicle,
  options,
  onToggle,
  contact,
  onContact,
}: {
  vehicle: Vehicle;
  options: string[];
  onToggle: (id: string, checked: boolean) => void;
  contact: Contact;
  onContact: (c: Contact) => void;
}) {
  return (
    <fieldset>
      <legend className={legend}>Des options ?</legend>
      <ul className="grid gap-3 sm:grid-cols-2">
        {RENTAL_OPTIONS.map((o) => {
          const checked = options.includes(o.id);
          const price = optionPrice(o, vehicle.category);
          return (
            <li key={o.id}>
              <label
                className={cn(
                  "flex h-full cursor-pointer gap-3 rounded-xl border p-4 transition",
                  checked ? "border-gold bg-gold/10" : "border-white/10 bg-anthracite hover:border-white/30",
                )}
              >
                <Checkbox checked={checked} onCheckedChange={(v) => onToggle(o.id, v === true)} className="mt-0.5" />
                <span className="flex-1">
                  <span className="flex justify-between gap-2 text-sm">
                    {o.label}
                    <span className="nums shrink-0 text-subtle">{price ? `${formatPrice(price)}${o.mode === "perDay" ? " / j" : ""}` : "Sur devis"}</span>
                  </span>
                  <span className="mt-1 block text-xs text-muted">{o.description}</span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
        <p className="text-xs text-muted sm:col-span-3">Vos coordonnées (facultatif) — pour que nous puissions vous recontacter.</p>
        <input className="field" aria-label="Nom" placeholder="Nom" maxLength={80} value={contact.name} onChange={(e) => onContact({ ...contact, name: e.target.value })} autoComplete="name" />
        <input className="field" aria-label="Téléphone" placeholder="Téléphone" maxLength={30} value={contact.phone} onChange={(e) => onContact({ ...contact, phone: e.target.value })} autoComplete="tel" inputMode="tel" />
        <input className="field" aria-label="E-mail" placeholder="E-mail" maxLength={120} type="email" value={contact.email} onChange={(e) => onContact({ ...contact, email: e.target.value })} autoComplete="email" />
      </div>
    </fieldset>
  );
}
