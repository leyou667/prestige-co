"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Pencil, Printer } from "lucide-react";
import { getCategory } from "@/lib/categories";
import { getCity } from "@/lib/cities";
import { computeQuote, quoteNumber } from "@/lib/quote";
import { bookingMessage, whatsappUrl } from "@/lib/site";
import { cn, formatDateFr, formatPrice, rentalDays } from "@/lib/utils";
import { getVehicleById, vehicleHref, vehicleName } from "@/lib/vehicles";
import { WhatsAppIcon } from "@/components/icons";
import { TermsCheckbox } from "@/components/forms/terms-checkbox";
import { useAvailability } from "@/components/vehicle/availability-calendar";
import { CityStep, DatesStep, OptionsStep, VehicleStep, type Contact } from "./steps";
import { QuoteSheet } from "./quote-sheet";

const STEPS = ["Véhicule", "Ville", "Dates", "Options", "Récapitulatif"] as const;

export interface QuoteInitial {
  vehicleId?: string;
  city?: string;
  from?: string;
  to?: string;
}

/** Parcours : Véhicule → Ville → Dates → Options → Récapitulatif (imprimable) + envoi WhatsApp. */
export function QuoteBuilder({ initial }: { initial: QuoteInitial }) {
  const [vehicleId, setVehicleId] = React.useState(initial.vehicleId ?? "");
  const [city, setCity] = React.useState(initial.city ?? "");
  const [from, setFrom] = React.useState(initial.from ?? "");
  const [to, setTo] = React.useState(initial.to ?? "");
  const [options, setOptions] = React.useState<string[]>([]);
  const [contact, setContact] = React.useState<Contact>({ name: "", phone: "", email: "" });
  const [accepted, setAccepted] = React.useState(false);
  const [showTermsError, setShowTermsError] = React.useState(false);
  const [sent, setSent] = React.useState<"idle" | "synced" | "local" | "error">("idle");
  const [honeypot, setHoneypot] = React.useState("");
  const startedAt = React.useRef(Date.now());
  const [step, setStep] = React.useState(() => (!initial.vehicleId ? 0 : !initial.city ? 1 : !initial.from || !initial.to ? 2 : 3));
  const top = React.useRef<HTMLDivElement>(null);

  const vehicle = getVehicleById(vehicleId);
  const cityObj = getCity(city);
  const days = from && to ? rentalDays(from, to) : 0;
  const availability = useAvailability(vehicle?.id);
  const free = !vehicle || !from || !to || availability.rangeIsFree(from, to);

  // Ville hors zone du véhicule : on réinitialise
  React.useEffect(() => {
    if (vehicle && cityObj && !vehicle.cities.includes(cityObj.name)) setCity("");
  }, [vehicle, cityObj]);

  const quote = vehicle ? computeQuote(vehicle, days, options) : null;
  const number = quoteNumber(`${vehicleId}|${city}|${from}|${to}|${options.join(",")}`);
  const canNext = [Boolean(vehicle), Boolean(cityObj), Boolean(from && to && to >= from && free), true, true][step];
  const label = vehicle ? vehicleName(vehicle, "full") : "";
  const message = vehicle
    ? bookingMessage({ vehicle: label, from: from ? formatDateFr(from) : undefined, to: to ? formatDateFr(to) : undefined, city: cityObj?.name })
    : "";

  const goTo = (s: number) => {
    setStep(s);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const send = () => {
    if (!vehicle || !cityObj) return;
    // Création de l'événement « à confirmer » dans Google Calendar — non bloquant, le prix est recalculé côté serveur
    fetch("/api/reservations", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId: vehicle.id,
        city: cityObj.slug,
        from,
        to,
        options,
        acceptedTerms: true,
        startedAt: startedAt.current,
        website: honeypot,
        ...contact,
      }),
    })
      .then((r) => r.json())
      .then((d: { ok?: boolean; synced?: boolean }) => setSent(d.ok === false ? "error" : d.synced ? "synced" : "local"))
      .catch(() => setSent("local"));
  };

  return (
    <div ref={top} className="scroll-mt-[calc(var(--header-h)+1rem)]">
      {/* Étapes : libellé explicite sur mobile, barre segmentée sur tous les écrans */}
      <nav aria-label="Étapes du devis" className="no-print mb-10">
        <p className="mb-3 text-2xs uppercase tracking-wide2 text-subtle sm:hidden" aria-live="polite">
          Étape {step + 1}/{STEPS.length} · {STEPS[step]}
        </p>
        <ol className="grid grid-cols-5 gap-2">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                disabled={i > step}
                onClick={() => goTo(i)}
                aria-label={`Étape ${i + 1} : ${s}`}
                aria-current={i === step ? "step" : undefined}
                className={cn("block w-full py-2 text-left", i > step && "cursor-default")}
              >
                <span className={cn("block h-0.5 rounded-full transition-colors", i <= step ? "bg-gold" : "bg-white/15")} />
                <span className={cn("mt-2 hidden text-2xs uppercase tracking-wide2 sm:block", i === step ? "text-white" : "text-muted")}>
                  {i + 1}. {s}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <AnimatePresence mode="wait">
        <m.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="no-print">
          {step === 0 && (
            <VehicleStep
              selected={vehicleId}
              onPick={(id) => {
                setVehicleId(id);
                goTo(1);
              }}
            />
          )}
          {step === 1 && vehicle && (
            <CityStep
              vehicle={vehicle}
              selected={city}
              onPick={(slug) => {
                setCity(slug);
                goTo(2);
              }}
            />
          )}
          {step === 2 && vehicle && (
            <DatesStep
              from={from}
              to={to}
              onChange={(f, t) => {
                setFrom(f);
                setTo(t);
              }}
              availability={availability}
              free={free}
            />
          )}
          {step === 3 && vehicle && (
            <OptionsStep
              vehicle={vehicle}
              options={options}
              onToggle={(id, checked) => setOptions((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))}
              contact={contact}
              onContact={setContact}
            />
          )}
        </m.div>
      </AnimatePresence>

      {step === 4 && vehicle && cityObj && quote && (
        <div>
          <QuoteSheet
            number={number}
            vehicleLabel={label}
            categoryName={getCategory(vehicle.category).name}
            categoryCode={vehicle.category}
            pricePerDay={vehicle.pricePerDay}
            city={cityObj.name}
            from={from}
            to={to}
            quote={quote}
            contact={contact}
            minAge={getCategory(vehicle.category).minAge}
            minLicense={getCategory(vehicle.category).minLicenseYears}
          />
          <div className="no-print mt-8 space-y-5">
            {/* Champ piège anti-robots, invisible pour les humains */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-px w-px opacity-0"
            />
            <TermsCheckbox
              checked={accepted}
              onChange={(v) => {
                setAccepted(v);
                if (v) setShowTermsError(false);
              }}
              error={showTermsError}
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappUrl(message)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!accepted) {
                    e.preventDefault();
                    setShowTermsError(true);
                  } else send();
                }}
                className="btn-gold !py-4"
              >
                <WhatsAppIcon className="h-4 w-4" /> Envoyer sur WhatsApp
              </a>
              <button type="button" onClick={() => window.print()} className="btn-ghost !py-4">
                <Printer className="h-4 w-4" /> Imprimer / PDF
              </button>
              <button type="button" onClick={() => goTo(3)} className="btn-ghost !py-4">
                <Pencil className="h-4 w-4" /> Modifier
              </button>
            </div>
            {sent !== "idle" && (
              <p className={cn("inline-flex items-center gap-2 text-sm", sent === "error" ? "text-red-300" : "text-subtle")} role="status">
                <Check className="h-4 w-4 text-gold" />
                {sent === "synced"
                  ? "Demande enregistrée — nous vous confirmons la disponibilité sur WhatsApp."
                  : sent === "error"
                    ? "La demande n'a pas pu être enregistrée en ligne, mais votre message WhatsApp suffit : nous vous répondons rapidement."
                    : "Demande transmise — nous vous répondons sur WhatsApp."}
              </p>
            )}
          </div>
        </div>
      )}

      {step < 4 && (
        <div
          className="no-print sticky bottom-0 z-30 -mx-5 mt-10 flex items-center justify-between gap-3 border-t border-white/10 bg-ink/95 px-5 py-3 md:static md:mx-0 md:bg-transparent md:px-0 md:pt-6"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <button type="button" onClick={() => goTo(Math.max(0, step - 1))} disabled={step === 0} className="btn-ghost !px-4 disabled:opacity-30 sm:!px-6">
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Retour</span>
          </button>
          {vehicle && (
            <p className="nums min-w-0 flex-1 truncate text-center text-xs text-muted md:text-sm">
              <span className="hidden md:inline">
                {label}
                {cityObj && ` · ${cityObj.name}`}
                {days > 0 && " · "}
              </span>
              {days > 0 && quote ? (
                <>
                  {days} j · <span className="text-white">{formatPrice(quote.total)}</span>
                </>
              ) : (
                <span className="md:hidden">{vehicleName(vehicle)}</span>
              )}
            </p>
          )}
          <button type="button" onClick={() => goTo(step + 1)} disabled={!canNext} className="btn-gold !px-4 sm:!px-6">
            {step === 3 ? "Voir le devis" : "Continuer"} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
      {vehicle && step === 0 && (
        <p className="no-print mt-4 text-xs text-muted">
          Véhicule sélectionné :{" "}
          <Link href={vehicleHref(vehicle)} className="underline">
            {label}
          </Link>
        </p>
      )}
    </div>
  );
}
