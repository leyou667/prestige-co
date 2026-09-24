"use client";

import * as React from "react";
import { SlidersHorizontal, X, Search, CalendarDays } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CATEGORIES, type CategoryCode } from "@/lib/categories";
import { CITIES, getCity } from "@/lib/cities";
import { BRANDS, POWER_RANGE, PRICE_RANGE, VEHICLES } from "@/lib/vehicles";
import { cn, formatDateFr, formatPrice } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { VehicleGrid } from "./vehicle-grid";

export interface CatalogueFilters {
  categories: CategoryCode[];
  brand: string;
  model: string;
  city: string;
  price: [number, number];
  power: [number, number];
  from: string;
  to: string;
}

type Sort = "price-asc" | "price-desc" | "power-desc";

export function Catalogue({ initial }: { initial: Partial<CatalogueFilters> }) {
  const [f, setF] = React.useState<CatalogueFilters>({
    categories: initial.categories ?? [],
    brand: initial.brand ?? "",
    model: initial.model ?? "",
    city: initial.city ?? "",
    price: [PRICE_RANGE[0], PRICE_RANGE[1]],
    power: [POWER_RANGE[0], POWER_RANGE[1]],
    from: initial.from ?? "",
    to: initial.to ?? "",
  });
  const [sort, setSort] = React.useState<Sort>("price-asc");
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [unavailable, setUnavailable] = React.useState<Set<string>>(new Set());
  const set = <K extends keyof CatalogueFilters>(key: K, value: CatalogueFilters[K]) => setF((prev) => ({ ...prev, [key]: value }));

  // URL partageable, sans rechargement serveur
  React.useEffect(() => {
    const p = new URLSearchParams();
    if (f.city) p.set("ville", f.city);
    if (f.categories.length) p.set("categorie", f.categories.join(","));
    if (f.brand) p.set("marque", f.brand);
    if (f.from) p.set("du", f.from);
    if (f.to) p.set("au", f.to);
    const qs = p.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [f.city, f.categories, f.brand, f.from, f.to]);

  // Disponibilités sur les dates recherchées (Google Calendar)
  React.useEffect(() => {
    if (!f.from || !f.to) return setUnavailable(new Set());
    const ctrl = new AbortController();
    fetch(`/api/availability?from=${f.from}&to=${f.to}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: { unavailable?: string[] }) => setUnavailable(new Set(d.unavailable ?? [])))
      .catch(() => {});
    return () => ctrl.abort();
  }, [f.from, f.to]);

  const city = getCity(f.city);
  const models = React.useMemo(
    () => Array.from(new Set(VEHICLES.filter((v) => !f.brand || v.brand === f.brand).map((v) => v.model))),
    [f.brand],
  );

  const results = React.useMemo(() => {
    const q = f.model.trim().toLowerCase();
    const list = VEHICLES.filter(
      (v) =>
        (!f.categories.length || f.categories.includes(v.category)) &&
        (!f.brand || v.brand === f.brand) &&
        (!q || `${v.brand} ${v.model} ${v.variant ?? ""}`.toLowerCase().includes(q)) &&
        (!city || v.cities.includes(city.name)) &&
        v.pricePerDay >= f.price[0] &&
        v.pricePerDay <= f.price[1] &&
        v.powerHp >= f.power[0] &&
        v.powerHp <= f.power[1],
    );
    const sorted = [...list].sort((a, b) =>
      sort === "price-asc" ? a.pricePerDay - b.pricePerDay : sort === "price-desc" ? b.pricePerDay - a.pricePerDay : b.powerHp - a.powerHp,
    );
    // Véhicules indisponibles sur les dates : en fin de liste
    return sorted.sort((a, b) => Number(unavailable.has(a.id)) - Number(unavailable.has(b.id)));
  }, [f, city, sort, unavailable]);

  const toggleCategory = (code: CategoryCode) =>
    set("categories", f.categories.includes(code) ? f.categories.filter((c) => c !== code) : [...f.categories, code]);

  const reset = () =>
    setF({ categories: [], brand: "", model: "", city: "", price: [PRICE_RANGE[0], PRICE_RANGE[1]], power: [POWER_RANGE[0], POWER_RANGE[1]], from: "", to: "" });

  const activeCount =
    f.categories.length + Number(!!f.brand) + Number(!!f.model) + Number(!!f.city) +
    Number(f.price[0] !== PRICE_RANGE[0] || f.price[1] !== PRICE_RANGE[1]) +
    Number(f.power[0] !== POWER_RANGE[0] || f.power[1] !== POWER_RANGE[1]);

  const query = new URLSearchParams({ ...(f.city && { ville: f.city }), ...(f.from && { du: f.from }), ...(f.to && { au: f.to }) }).toString();

  const advanced = (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <label className="block">
        <span className="mb-2 block text-[0.6rem] uppercase tracking-wide2 text-white/50">Marque</span>
        <select value={f.brand} onChange={(e) => setF((p) => ({ ...p, brand: e.target.value, model: "" }))} className="field">
          <option value="">Toutes les marques</option>
          {BRANDS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-[0.6rem] uppercase tracking-wide2 text-white/50">Modèle</span>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input list="models" value={f.model} onChange={(e) => set("model", e.target.value)} placeholder="Ex. Taycan" className="field pl-9" />
          <datalist id="models">
            {models.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>
      </label>
      <div>
        <span className="mb-2 flex justify-between text-[0.6rem] uppercase tracking-wide2 text-white/50">
          Prix / jour <span className="normal-case tracking-normal text-white/80">{formatPrice(f.price[0])} – {formatPrice(f.price[1])}</span>
        </span>
        <Slider min={PRICE_RANGE[0]} max={PRICE_RANGE[1]} step={5} value={f.price} onValueChange={(v) => set("price", v as [number, number])} thumbLabels={["Prix minimum", "Prix maximum"]} className="mt-4" />
      </div>
      <div>
        <span className="mb-2 flex justify-between text-[0.6rem] uppercase tracking-wide2 text-white/50">
          Puissance <span className="normal-case tracking-normal text-white/80">{f.power[0]} – {f.power[1]} ch</span>
        </span>
        <Slider min={POWER_RANGE[0]} max={POWER_RANGE[1]} step={5} value={f.power} onValueChange={(v) => set("power", v as [number, number])} thumbLabels={["Puissance minimum", "Puissance maximum"]} className="mt-4" />
      </div>
    </div>
  );

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-5 border-b border-white/5 bg-ink/90 px-5 py-4 backdrop-blur-xl md:top-20 md:mx-0 md:rounded-2xl md:border md:border-white/10 md:bg-anthracite/80 md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0 lg:flex-1">
            {CATEGORIES.map((c) => (
              <li key={c.code} className="shrink-0">
                <button
                  type="button"
                  onClick={() => toggleCategory(c.code)}
                  aria-pressed={f.categories.includes(c.code)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-[0.65rem] uppercase tracking-wide2 transition",
                    f.categories.includes(c.code) ? "border-gold bg-gold text-ink" : "border-white/15 text-white/75 hover:border-white/40",
                  )}
                >
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <select value={f.city} onChange={(e) => set("city", e.target.value)} className="field !py-2.5 lg:w-48" aria-label="Ville">
              <option value="">Toutes les villes</option>
              {CITIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setPanelOpen((o) => !o)}
              aria-expanded={panelOpen}
              className="relative inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/15 px-3.5 text-xs uppercase tracking-wide2 text-white/80 transition hover:border-white/40"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filtres</span>
              {activeCount > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[0.55rem] text-ink">{activeCount}</span>}
            </button>
          </div>
        </div>
        <AnimatePresence initial={false}>
          {panelOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="pt-5">{advanced}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mb-6 mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/60">
          <span className="text-white">{results.length}</span> véhicule{results.length > 1 ? "s" : ""}
          {city && <> à <span className="text-white">{city.name}</span></>}
          {f.from && f.to && (
            <span className="ml-2 inline-flex items-center gap-1 text-white/50">
              <CalendarDays className="h-3.5 w-3.5" /> {formatDateFr(f.from)} → {formatDateFr(f.to)}
              <button type="button" onClick={() => setF((p) => ({ ...p, from: "", to: "" }))} aria-label="Effacer les dates" className="ml-1 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
        </p>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button type="button" onClick={reset} className="text-xs text-white/50 underline-offset-4 hover:text-white hover:underline">
              Réinitialiser
            </button>
          )}
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field !w-auto !py-2 text-xs" aria-label="Trier">
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="power-desc">Puissance</option>
          </select>
        </div>
      </div>

      {results.length ? (
        <VehicleGrid vehicles={results} city={city?.name} query={query || undefined} unavailable={unavailable} />
      ) : (
        <div className="rounded-2xl border border-white/10 py-20 text-center">
          <p className="font-display text-2xl">Aucun véhicule ne correspond.</p>
          <p className="mt-2 text-sm text-white/50">Élargissez vos critères ou contactez-nous : nous trouvons souvent une solution.</p>
          <button type="button" onClick={reset} className="btn-ghost mt-6">Réinitialiser les filtres</button>
        </div>
      )}
    </div>
  );
}
