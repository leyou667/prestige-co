"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileText } from "lucide-react";
import { citiesForVehicle, getCity } from "@/lib/cities";
import { bookingMessage, whatsappUrl } from "@/lib/site";
import { cn, formatDateFr, formatPrice, rentalDays, sanitizeRange } from "@/lib/utils";
import { vehicleName, type Vehicle } from "@/lib/vehicles";
import { WhatsAppIcon } from "@/components/icons";
import { CitySelect } from "@/components/forms/city-select";
import { DateRangeFields } from "@/components/forms/date-range-fields";
import { TermsCheckbox } from "@/components/forms/terms-checkbox";
import { AvailabilityCalendar, useAvailability } from "./availability-calendar";

/** Réservation depuis la fiche véhicule, pré-remplie depuis la recherche (?ville=&du=&au=). */
export function BookingPanel({ vehicle }: { vehicle: Vehicle }) {
  const sp = useSearchParams();
  const initial = sanitizeRange(sp.get("du"), sp.get("au"));
  const availability = useAvailability(vehicle.id);
  const [from, setFrom] = React.useState(initial.from);
  const [to, setTo] = React.useState(initial.to);
  const [city, setCity] = React.useState(() => {
    const wanted = getCity(sp.get("ville"));
    return (wanted && vehicle.cities.includes(wanted.name) ? wanted : getCity(vehicle.baseCity))?.slug ?? "";
  });
  const [accepted, setAccepted] = React.useState(false);
  const [showTermsError, setShowTermsError] = React.useState(false);

  const cityName = getCity(city)?.name ?? "";
  const days = from && to ? rentalDays(from, to) : 0;
  const free = from && to ? availability.rangeIsFree(from, to) : true;

  const params = new URLSearchParams({ vehicule: vehicle.id, ...(city && { ville: city }), ...(from && { du: from }), ...(to && { au: to }) });
  const wa = whatsappUrl(
    bookingMessage({
      vehicle: vehicleName(vehicle, "full"),
      from: from ? formatDateFr(from) : undefined,
      to: to ? formatDateFr(to) : undefined,
      city: cityName || undefined,
    }),
  );

  const setRange = (f: string, t: string) => {
    setFrom(f);
    setTo(t);
  };

  return (
    <div className="space-y-6">
      <AvailabilityCalendar availability={availability} from={from} to={to} onSelect={setRange} />

      <div className="rounded-2xl border border-white/10 bg-anthracite p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="booking-city" className="label mb-1.5 block">
              Ville
            </label>
            <CitySelect id="booking-city" value={city} onChange={setCity} cities={citiesForVehicle(vehicle)} />
          </div>
          <DateRangeFields from={from} to={to} onChange={setRange} />
        </div>

        {days > 0 && (
          <p className={cn("mt-4 text-sm", free ? "text-subtle" : "text-red-300")} aria-live="polite">
            {free ? (
              <>
                Estimation : <span className="nums text-white">{formatPrice(days * vehicle.pricePerDay)}</span> pour {days} jour
                {days > 1 ? "s" : ""} (hors options, caution sur demande)
              </>
            ) : (
              "Ce véhicule est déjà réservé sur une partie de cette période."
            )}
          </p>
        )}

        <TermsCheckbox
          className="mt-5"
          checked={accepted}
          onChange={(v) => {
            setAccepted(v);
            if (v) setShowTermsError(false);
          }}
          error={showTermsError}
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {/* Le devis n'engage à rien : les conditions sont acceptées à l'envoi final */}
          <Link href={`/devis?${params}`} className="btn-gold !py-3.5">
            <FileText className="h-4 w-4" /> Demander un devis
          </Link>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!accepted || !free) {
                e.preventDefault();
                if (!accepted) setShowTermsError(true);
              }
            }}
            className={cn("btn-ghost !py-3.5", !free && "opacity-50")}
          >
            <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> Réserver via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

/** Barre de réservation fixe en bas d'écran (mobile) : prix + accès direct au devis et à la réservation. */
export function MobileBookingBar({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div
      data-booking-bar
      className="no-print fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-white/10 bg-ink/95 px-5 py-3 md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <p className="nums min-w-0 flex-1 leading-tight">
        <span className="block truncate text-2xs uppercase tracking-wide2 text-muted">{vehicleName(vehicle)}</span>
        <span className="text-lg">{formatPrice(vehicle.pricePerDay)}</span>
        <span className="text-xs text-muted"> / jour</span>
      </p>
      <Link href={`/devis?vehicule=${vehicle.id}`} className="btn-ghost !px-4">
        Devis
      </Link>
      <a href="#reserver" className="btn-gold !px-4">
        Réserver
      </a>
    </div>
  );
}
