"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Printer } from "lucide-react";
import { CAUTION_TEXT, CATEGORIES, getCategory } from "@/lib/categories";
import { CITIES, getCity } from "@/lib/cities";
import { RENTAL_OPTIONS, optionPrice, optionTotal } from "@/lib/options";
import { SITE, bookingMessage, whatsappUrl } from "@/lib/site";
import { cn, formatDateFr, formatPrice, rentalDays, toISODate } from "@/lib/utils";
import { VEHICLES, getVehicleById, vehicleHref } from "@/lib/vehicles";
import { Checkbox } from "@/components/ui/checkbox";
import { WhatsAppIcon } from "@/components/icons";
import { VehicleVisual } from "@/components/vehicle/vehicle-visual";
import { AvailabilityCalendar, useAvailability } from "@/components/vehicle/availability-calendar";

const STEPS = ["Véhicule", "Ville", "Dates", "Options", "Récapitulatif"] as const;

function quoteNumber(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `PC-${toISODate(new Date()).replace(/-/g, "")}-${(h % 10000).toString().padStart(4, "0")}`;
}

export function QuoteBuilder() {
  const sp = useSearchParams();
  const today = toISODate(new Date());
  const [vehicleId, setVehicleId] = React.useState(() => getVehicleById(sp.get("vehicule"))?.id ?? "");
  const [city, setCity] = React.useState(() => getCity(sp.get("ville"))?.slug ?? "");
  const [from, setFrom] = React.useState(() => (sp.get("du") ?? "") >= today ? sp.get("du") ?? "" : "");
  const [to, setTo] = React.useState(() => sp.get("au") ?? "");
  const [options, setOptions] = React.useState<string[]>([]);
  const [contact, setContact] = React.useState({ name: "", phone: "", email: "" });
  const [accepted, setAccepted] = React.useState(false);
  const [sent, setSent] = React.useState<"idle" | "synced" | "local">("idle");
  const [step, setStep] = React.useState(() => {
    if (!getVehicleById(sp.get("vehicule"))) return 0;
    if (!getCity(sp.get("ville"))) return 1;
    if (!sp.get("du") || !sp.get("au")) return 2;
    return 3;
  });

  const vehicle = getVehicleById(vehicleId);
  const cityObj = getCity(city);
  const days = from && to ? rentalDays(from, to) : 0;
  const availability = useAvailability(vehicleId || VEHICLES[0].id);
  const free = !vehicle || !from || !to || availability.rangeIsFree(from, to);

  // Ville hors zone du véhicule : on réinitialise
  React.useEffect(() => {
    if (vehicle && cityObj && !vehicle.cities.includes(cityObj.name)) setCity("");
  }, [vehicle, cityObj]);

  const selectedOptions = RENTAL_OPTIONS.filter((o) => options.includes(o.id));
  const rental = vehicle ? vehicle.pricePerDay * days : 0;
  const optionsTotal = vehicle ? selectedOptions.reduce((sum, o) => sum + optionTotal(o, vehicle.category, days), 0) : 0;
  const total = rental + optionsTotal;
  const number = quoteNumber(`${vehicleId}|${city}|${from}|${to}|${options.join(",")}`);

  const canNext = [Boolean(vehicle), Boolean(cityObj), Boolean(from && to && to >= from && free), true, true][step];
  const vehicleLabel = vehicle ? `${vehicle.brand} ${vehicle.model}${vehicle.variant ? ` (${vehicle.variant})` : ""}` : "";
  const message = vehicle
    ? bookingMessage({ vehicle: vehicleLabel, from: from ? formatDateFr(from) : undefined, to: to ? formatDateFr(to) : undefined, city: cityObj?.name })
    : "";

  const send = () => {
    if (!vehicle || !cityObj || !accepted) return;
    // Création de l'événement (statut "à confirmer") dans Google Calendar — non bloquant
    fetch("/api/reservations", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicleId: vehicle.id,
        city: cityObj.slug,
        from,
        to,
        options: selectedOptions.map((o) => o.label),
        estimate: total,
        acceptedTerms: true,
        ...contact,
      }),
    })
      .then((r) => r.json())
      .then((d: { synced?: boolean }) => setSent(d.synced ? "synced" : "local"))
      .catch(() => setSent("local"));
  };

  return (
    <div>
      {/* Étapes */}
      <ol className="no-print mb-10 grid grid-cols-5 gap-2">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              disabled={i > step}
              onClick={() => setStep(i)}
              className={cn("w-full text-left", i > step && "cursor-default")}
            >
              <span className={cn("block h-0.5 rounded-full transition-colors", i <= step ? "bg-gold" : "bg-white/10")} />
              <span className={cn("mt-2 hidden text-[0.6rem] uppercase tracking-wide2 sm:block", i === step ? "text-white" : "text-white/40")}>
                {i + 1}. {s}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="no-print">
          {step === 0 && (
            <fieldset>
              <legend className="mb-6 font-display text-3xl font-light">Quel véhicule ?</legend>
              {CATEGORIES.map((c) => (
                <div key={c.code} className="mb-8">
                  <p className="eyebrow mb-3">{c.name}</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {VEHICLES.filter((v) => v.category === c.code).map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setVehicleId(v.id);
                          setStep(1);
                        }}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-2.5 text-left transition",
                          v.id === vehicleId ? "border-gold bg-gold/10" : "border-white/10 bg-anthracite hover:border-white/30",
                        )}
                      >
                        <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                          <VehicleVisual vehicle={v} sizes="80px" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm">{v.brand} {v.model}</span>
                          {v.variant && <span className="block truncate text-[0.65rem] text-white/45">{v.variant}</span>}
                          <span className="block text-xs text-white/55">{formatPrice(v.pricePerDay)} / jour</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </fieldset>
          )}

          {step === 1 && vehicle && (
            <fieldset>
              <legend className="mb-2 font-display text-3xl font-light">Dans quelle ville ?</legend>
              <p className="mb-6 text-sm text-white/50">Villes où la {vehicle.brand} {vehicle.model} peut être livrée.</p>
              <div className="flex flex-wrap gap-2">
                {CITIES.filter((c) => vehicle.cities.includes(c.name)).map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => {
                      setCity(c.slug);
                      setStep(2);
                    }}
                    className={cn("rounded-full border px-4 py-2 text-sm transition", c.slug === city ? "border-gold bg-gold text-ink" : "border-white/15 text-white/80 hover:border-white/40")}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {step === 2 && vehicle && (
            <fieldset>
              <legend className="mb-6 font-display text-3xl font-light">Quelles dates ?</legend>
              <div className="mb-5 grid max-w-md grid-cols-2 gap-3">
                <label>
                  <span className="mb-1.5 block text-[0.6rem] uppercase tracking-wide2 text-white/50">Date de départ</span>
                  <input type="date" min={today} value={from} onChange={(e) => { setFrom(e.target.value); if (to && e.target.value > to) setTo(e.target.value); }} className="field" />
                </label>
                <label>
                  <span className="mb-1.5 block text-[0.6rem] uppercase tracking-wide2 text-white/50">Date de retour</span>
                  <input type="date" min={from || today} value={to} onChange={(e) => setTo(e.target.value)} className="field" />
                </label>
              </div>
              <AvailabilityCalendar availability={availability} from={from} to={to} onSelect={(a, b) => { setFrom(a); setTo(b); }} />
              {!free && (
                <p className="mt-4 inline-flex items-center gap-2 text-sm text-red-300">
                  <AlertTriangle className="h-4 w-4" /> Le véhicule est déjà réservé sur une partie de cette période.
                </p>
              )}
            </fieldset>
          )}

          {step === 3 && vehicle && (
            <fieldset>
              <legend className="mb-6 font-display text-3xl font-light">Des options ?</legend>
              <ul className="grid gap-3 sm:grid-cols-2">
                {RENTAL_OPTIONS.map((o) => {
                  const checked = options.includes(o.id);
                  const price = optionPrice(o, vehicle.category);
                  return (
                    <li key={o.id}>
                      <label className={cn("flex h-full cursor-pointer gap-3 rounded-xl border p-4 transition", checked ? "border-gold bg-gold/10" : "border-white/10 bg-anthracite hover:border-white/30")}>
                        <Checkbox checked={checked} onCheckedChange={(v) => setOptions((prev) => (v ? [...prev, o.id] : prev.filter((x) => x !== o.id)))} className="mt-0.5" />
                        <span className="flex-1">
                          <span className="flex justify-between gap-2 text-sm">
                            {o.label}
                            <span className="shrink-0 text-white/60">{price ? `${formatPrice(price)}${o.mode === "perDay" ? " / j" : ""}` : "Sur devis"}</span>
                          </span>
                          <span className="mt-1 block text-xs text-white/45">{o.description}</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                <p className="text-xs text-white/45 sm:col-span-3">Vos coordonnées (facultatif) — pour que nous puissions vous recontacter.</p>
                <input className="field" placeholder="Nom" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} autoComplete="name" />
                <input className="field" placeholder="Téléphone" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} autoComplete="tel" inputMode="tel" />
                <input className="field" placeholder="E-mail" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} autoComplete="email" inputMode="email" />
              </div>
            </fieldset>
          )}
        </motion.div>
      </AnimatePresence>

      {step === 4 && vehicle && cityObj && (
        <div>
          <QuoteSheet
            number={number}
            vehicleLabel={vehicleLabel}
            categoryName={getCategory(vehicle.category).name}
            categoryCode={vehicle.category}
            pricePerDay={vehicle.pricePerDay}
            city={cityObj.name}
            from={from}
            to={to}
            days={days}
            rental={rental}
            options={selectedOptions.map((o) => ({ label: o.label, amount: optionTotal(o, vehicle.category, days), onQuote: optionPrice(o, vehicle.category) === 0 }))}
            total={total}
            contact={contact}
            minAge={getCategory(vehicle.category).minAge}
            minLicense={getCategory(vehicle.category).minLicenseYears}
          />
          <div className="no-print mt-8 space-y-5">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-white/75">
              <Checkbox checked={accepted} onCheckedChange={(v) => setAccepted(v === true)} className="mt-0.5" />
              <span>
                J&apos;ai lu et accepté les{" "}
                <Link href="/conditions-generales" target="_blank" className="text-gold underline-offset-4 hover:underline">conditions générales</Link>
                <span className="text-gold"> *</span>
              </span>
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappUrl(message)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => (accepted ? send() : e.preventDefault())}
                aria-disabled={!accepted}
                className={cn("btn-gold !py-4", !accepted && "pointer-events-none opacity-40")}
              >
                <WhatsAppIcon className="h-4 w-4" /> Envoyer sur WhatsApp
              </a>
              <button type="button" onClick={() => window.print()} className="btn-ghost !py-4">
                <Printer className="h-4 w-4" /> Imprimer / PDF
              </button>
            </div>
            {sent !== "idle" && (
              <p className="inline-flex items-center gap-2 text-sm text-emerald-300/90">
                <Check className="h-4 w-4" />
                {sent === "synced" ? "Demande enregistrée — nous vous confirmons la disponibilité sur WhatsApp." : "Demande transmise — nous vous répondons sur WhatsApp."}
              </p>
            )}
          </div>
        </div>
      )}

      {step < 4 && (
        <div className="no-print mt-10 flex items-center justify-between gap-3 border-t border-white/5 pt-6">
          <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="btn-ghost disabled:opacity-30">
            <ArrowLeft className="h-4 w-4" /> Retour
          </button>
          {vehicle && (
            <p className="hidden text-sm text-white/55 md:block">
              {vehicleLabel}
              {cityObj && ` · ${cityObj.name}`}
              {days > 0 && ` · ${days} j · ${formatPrice(total)}`}
            </p>
          )}
          <button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canNext} className="btn-gold">
            {step === 3 ? "Voir le devis" : "Continuer"} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
      {vehicle && step === 0 && (
        <p className="no-print mt-4 text-xs text-white/40">
          Véhicule sélectionné : <Link href={vehicleHref(vehicle)} className="underline">{vehicleLabel}</Link>
        </p>
      )}
    </div>
  );
}

interface SheetProps {
  number: string;
  vehicleLabel: string;
  categoryName: string;
  categoryCode: string;
  pricePerDay: number;
  city: string;
  from: string;
  to: string;
  days: number;
  rental: number;
  options: { label: string; amount: number; onQuote: boolean }[];
  total: number;
  contact: { name: string; phone: string; email: string };
  minAge: number;
  minLicense: number;
}

/** Récapitulatif de devis — affichage écran (sombre) et impression / PDF (fond blanc). */
function QuoteSheet(p: SheetProps) {
  const issued = new Intl.DateTimeFormat("fr-BE", { dateStyle: "long" }).format(new Date());
  return (
    <article className="print-sheet overflow-hidden rounded-2xl border border-white/10 bg-anthracite print:rounded-none print:border-0 print:bg-white print:text-ink">
      <header className="flex flex-col gap-6 border-b border-white/10 bg-ink p-6 print:border-ink/15 print:bg-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <Image src={SITE.logo} alt={SITE.name} width={645} height={368} className="h-auto w-28 print:invert" priority />
        <div className="text-left sm:text-right">
          <p className="title-luxe text-xs text-white/60 print:text-ink/60">Devis estimatif</p>
          <p className="mt-1 font-display text-2xl">{p.number}</p>
          <p className="text-xs text-white/45 print:text-ink/50">Émis le {issued}</p>
        </div>
      </header>

      <div className="grid gap-8 p-6 sm:grid-cols-2 sm:p-8">
        <div>
          <p className="text-[0.6rem] uppercase tracking-wide2 text-white/45 print:text-ink/50">Véhicule</p>
          <p className="mt-1 font-display text-2xl">{p.vehicleLabel}</p>
          <p className="text-sm text-white/60 print:text-ink/60">{p.categoryName} (catégorie {p.categoryCode})</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[0.6rem] uppercase tracking-wide2 text-white/45 print:text-ink/50">Ville</p>
            <p className="mt-1">{p.city}</p>
          </div>
          <div>
            <p className="text-[0.6rem] uppercase tracking-wide2 text-white/45 print:text-ink/50">Durée</p>
            <p className="mt-1">{p.days} jour{p.days > 1 ? "s" : ""}</p>
          </div>
          <div>
            <p className="text-[0.6rem] uppercase tracking-wide2 text-white/45 print:text-ink/50">Départ</p>
            <p className="mt-1">{formatDateFr(p.from)}</p>
          </div>
          <div>
            <p className="text-[0.6rem] uppercase tracking-wide2 text-white/45 print:text-ink/50">Retour</p>
            <p className="mt-1">{formatDateFr(p.to)}</p>
          </div>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-y border-white/10 text-left text-[0.6rem] uppercase tracking-wide2 text-white/45 print:border-ink/15 print:text-ink/50">
            <th className="px-6 py-3 font-normal sm:px-8">Désignation</th>
            <th className="px-6 py-3 text-right font-normal sm:px-8">Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-white/5 print:border-ink/10">
            <td className="px-6 py-3 sm:px-8">Location — {formatPrice(p.pricePerDay)} × {p.days} jour{p.days > 1 ? "s" : ""}</td>
            <td className="px-6 py-3 text-right sm:px-8">{formatPrice(p.rental)}</td>
          </tr>
          {p.options.map((o) => (
            <tr key={o.label} className="border-b border-white/5 print:border-ink/10">
              <td className="px-6 py-3 sm:px-8">{o.label}</td>
              <td className="px-6 py-3 text-right sm:px-8">{o.onQuote ? "Sur devis" : formatPrice(o.amount)}</td>
            </tr>
          ))}
          <tr className="border-b border-white/5 print:border-ink/10">
            <td className="px-6 py-3 sm:px-8">Caution</td>
            <td className="px-6 py-3 text-right text-white/60 sm:px-8 print:text-ink/60">Sur demande</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td className="px-6 py-5 text-[0.65rem] uppercase tracking-luxe sm:px-8">Total estimé</td>
            <td className="px-6 py-5 text-right font-display text-3xl text-gold sm:px-8 print:text-ink">{formatPrice(p.total)}</td>
          </tr>
        </tfoot>
      </table>

      <footer className="space-y-2 border-t border-white/10 p-6 text-xs leading-relaxed text-white/50 print:border-ink/15 print:text-ink/60 sm:p-8">
        {(p.contact.name || p.contact.phone || p.contact.email) && (
          <p>Client : {[p.contact.name, p.contact.phone, p.contact.email].filter(Boolean).join(" · ")}</p>
        )}
        <p>Conditions : {p.minAge} ans minimum, {p.minLicense} ans de permis minimum. Caution : {CAUTION_TEXT.toLowerCase()}.</p>
        <p>Devis estimatif non contractuel, sous réserve de disponibilité. Le tarif final est confirmé par {SITE.name}.</p>
        <p>{SITE.name} · {SITE.phone} · {SITE.email}</p>
      </footer>
    </article>
  );
}
