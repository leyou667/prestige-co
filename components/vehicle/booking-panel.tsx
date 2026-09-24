"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileText } from "lucide-react";
import { CITIES, getCity } from "@/lib/cities";
import { bookingMessage, whatsappUrl } from "@/lib/site";
import { cn, formatDateFr, formatPrice, rentalDays, toISODate } from "@/lib/utils";
import type { Vehicle } from "@/lib/vehicles";
import { Checkbox } from "@/components/ui/checkbox";
import { WhatsAppIcon } from "@/components/icons";
import { AvailabilityCalendar, useAvailability } from "./availability-calendar";

/** Pré-rempli depuis la recherche (?ville=&du=&au=) */
export function BookingPanel({ vehicle }: { vehicle: Vehicle }) {
  const sp = useSearchParams();
  const initialFrom = sp.get("du") ?? undefined;
  const initialTo = sp.get("au") ?? undefined;
  const initialCity = sp.get("ville") ?? undefined;
  const availability = useAvailability(vehicle.id);
  const today = toISODate(new Date());
  const [from, setFrom] = React.useState(initialFrom && initialFrom >= today ? initialFrom : "");
  const [to, setTo] = React.useState(initialTo && initialFrom && initialTo >= initialFrom ? initialTo : "");
  const [city, setCity] = React.useState(() => {
    const wanted = getCity(initialCity);
    return (wanted && vehicle.cities.includes(wanted.name) ? wanted : getCity(vehicle.baseCity))?.slug ?? "";
  });
  const [accepted, setAccepted] = React.useState(false);

  const cityName = getCity(city)?.name ?? "";
  const days = from && to ? rentalDays(from, to) : 0;
  const free = from && to ? availability.rangeIsFree(from, to) : true;
  const ready = accepted && free;
  const name = `${vehicle.brand} ${vehicle.model}${vehicle.variant ? ` (${vehicle.variant})` : ""}`;

  const params = new URLSearchParams({ vehicule: vehicle.id, ...(city && { ville: city }), ...(from && { du: from }), ...(to && { au: to }) });
  const wa = whatsappUrl(bookingMessage({ vehicle: name, from: from ? formatDateFr(from) : undefined, to: to ? formatDateFr(to) : undefined, city: cityName || undefined }));

  return (
    <div className="space-y-6">
      <AvailabilityCalendar
        availability={availability}
        from={from}
        to={to}
        onSelect={(a, b) => {
          setFrom(a);
          setTo(b);
        }}
      />

      <div className="rounded-2xl border border-white/10 bg-anthracite p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-[0.6rem] uppercase tracking-wide2 text-white/50">Ville</span>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="field">
              {CITIES.filter((c) => vehicle.cities.includes(c.name)).map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[0.6rem] uppercase tracking-wide2 text-white/50">Départ</span>
            <input type="date" min={today} value={from} onChange={(e) => { setFrom(e.target.value); if (to && e.target.value > to) setTo(e.target.value); }} className="field" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[0.6rem] uppercase tracking-wide2 text-white/50">Retour</span>
            <input type="date" min={from || today} value={to} onChange={(e) => setTo(e.target.value)} className="field" />
          </label>
        </div>

        {days > 0 && (
          <p className={cn("mt-4 text-sm", free ? "text-white/70" : "text-red-300")}>
            {free
              ? <>Estimation : <span className="text-white">{formatPrice(days * vehicle.pricePerDay)}</span> pour {days} jour{days > 1 ? "s" : ""} (hors options, caution sur demande)</>
              : "Ce véhicule est déjà réservé sur une partie de cette période."}
          </p>
        )}

        <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-white/75">
          <Checkbox checked={accepted} onCheckedChange={(v) => setAccepted(v === true)} aria-required="true" className="mt-0.5" />
          <span>
            J&apos;ai lu et accepté les{" "}
            <Link href="/conditions-generales" target="_blank" className="text-gold underline-offset-4 hover:underline">
              conditions générales
            </Link>
            <span className="text-gold"> *</span>
          </span>
        </label>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/devis?${params}`}
            aria-disabled={!ready}
            onClick={(e) => !ready && e.preventDefault()}
            className={cn("btn-gold !py-3.5", !ready && "pointer-events-none opacity-40")}
          >
            <FileText className="h-4 w-4" /> Demander un devis
          </Link>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!ready}
            onClick={(e) => !ready && e.preventDefault()}
            className={cn("btn-ghost !py-3.5", !ready && "pointer-events-none opacity-40")}
          >
            <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> Réserver via WhatsApp
          </a>
        </div>
        {!accepted && <p className="mt-3 text-xs text-white/40">Veuillez accepter les conditions générales pour continuer.</p>}
      </div>
    </div>
  );
}
