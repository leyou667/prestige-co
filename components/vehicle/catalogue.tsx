"use client";

import * as React from "react";
import { SlidersHorizontal, X, Search, CalendarDays } from "lucide-react";
import { CATEGORIES, type CategoryCode } from "@/lib/categories";
import { getCity } from "@/lib/cities";
import { BRANDS, POWER_RANGE, PRICE_RANGE, VEHICLES } from "@/lib/vehicles";
import {
  DEFAULT_FILTERS,
  countActiveFilters,
  filterVehicles,
  filtersToSearchParams,
  type CatalogueFilters,
  type CatalogueSort,
} from "@/lib/catalogue";
import { cn, formatDateFr, formatPrice } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { CitySelect } from "@/components/forms/city-select";
import { OVERLAY_ATTR } from "@/components/layout/whatsapp-float";
import { VehicleGrid } from "./vehicle-grid";

/** Véhicules indisponibles sur la période recherchée (Google Calendar). */
function useUnavailable(from: string, to: string) {
  const [unavailable, setUnavailable] = React.useState<Set<string>>(new Set());
  React.useEffect(() => {
    if (!from || !to) return setUnavailable(new Set());
    const ctrl = new AbortController();
    fetch(`/api/availability?from=${from}&to=${to}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: { unavailable?: string[] }) => setUnavailable(new Set(d.unavailable ?? [])))
      .catch(() => {});
    return () => ctrl.abort();
  }, [from, to]);
  return unavailable;
}

/** Synchronise les filtres dans l'URL (partageable), sans rechargement serveur. */
function useUrlSync(f: CatalogueFilters) {
  const qs = filtersToSearchParams(f).toString();
  React.useEffect(() => {
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [qs]);
}

export function Catalogue({ initial }: { initial: Partial<CatalogueFilters> }) {
  const [f, setF] = React.useState<CatalogueFilters>({ ...DEFAULT_FILTERS, ...initial });
  const [sort, setSort] = React.useState<CatalogueSort>("price-asc");
  const [panelOpen, setPanelOpen] = React.useState(false);
  const set = <K extends keyof CatalogueFilters>(key: K, value: CatalogueFilters[K]) => setF((prev) => ({ ...prev, [key]: value }));

  useUrlSync(f);
  const unavailable = useUnavailable(f.from, f.to);
  const results = React.useMemo(() => filterVehicles(f, sort, unavailable), [f, sort, unavailable]);
  const activeCount = countActiveFilters(f);
  const city = getCity(f.city);
  const models = React.useMemo(() => Array.from(new Set(VEHICLES.filter((v) => !f.brand || v.brand === f.brand).map((v) => v.model))), [f.brand]);

  // Sur mobile, le panneau de filtres s'ouvre en plein écran : on bloque le défilement de la page
  React.useEffect(() => {
    if (!panelOpen || window.matchMedia("(min-width: 768px)").matches) return;
    const html = document.documentElement;
    html.setAttribute(OVERLAY_ATTR, "");
    html.style.overflow = "hidden";
    return () => {
      html.removeAttribute(OVERLAY_ATTR);
      html.style.overflow = "";
    };
  }, [panelOpen]);

  const toggleCategory = (code: CategoryCode) =>
    set("categories", f.categories.includes(code) ? f.categories.filter((c) => c !== code) : [...f.categories, code]);
  const reset = () => setF(DEFAULT_FILTERS);

  const query = new URLSearchParams({ ...(f.city && { ville: f.city }), ...(f.from && { du: f.from }), ...(f.to && { au: f.to }) }).toString();

  const advanced = (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <label className="block">
        <span className="label mb-2 block">Marque</span>
        <select value={f.brand} onChange={(e) => setF((p) => ({ ...p, brand: e.target.value, model: "" }))} className="field">
          <option value="">Toutes les marques</option>
          {BRANDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="label mb-2 block">Modèle</span>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input list="models" value={f.model} onChange={(e) => set("model", e.target.value)} placeholder="Ex. Taycan" className="field pl-9" />
          <datalist id="models">
            {models.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>
      </label>
      <div>
        <span className="label mb-2 flex justify-between">
          Prix / jour{" "}
          <span className="nums normal-case tracking-normal text-subtle">
            {formatPrice(f.price[0])} – {formatPrice(f.price[1])}
          </span>
        </span>
        <Slider min={PRICE_RANGE[0]} max={PRICE_RANGE[1]} step={5} value={f.price} onValueChange={(v) => set("price", v as [number, number])} thumbLabels={["Prix minimum", "Prix maximum"]} className="mt-4" />
      </div>
      <div>
        <span className="label mb-2 flex justify-between">
          Puissance{" "}
          <span className="nums normal-case tracking-normal text-subtle">
            {f.power[0]} – {f.power[1]} ch
          </span>
        </span>
        <Slider min={POWER_RANGE[0]} max={POWER_RANGE[1]} step={5} value={f.power} onValueChange={(v) => set("power", v as [number, number])} thumbLabels={["Puissance minimum", "Puissance maximum"]} className="mt-4" />
      </div>
    </div>
  );

  return (
    <div>
      <div className="sticky top-[var(--header-h)] z-30 -mx-5 border-b border-white/5 bg-ink/95 px-5 py-3 md:mx-0 md:rounded-2xl md:border md:border-white/10 md:bg-anthracite md:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:px-0 lg:flex-1 lg:flex-wrap">
            {CATEGORIES.map((c) => (
              <li key={c.code} className="shrink-0">
                <button
                  type="button"
                  onClick={() => toggleCategory(c.code)}
                  aria-pressed={f.categories.includes(c.code)}
                  className={cn(
                    "min-h-10 rounded-full border px-4 py-2.5 text-2xs uppercase tracking-wide2 transition",
                    f.categories.includes(c.code) ? "border-gold bg-gold text-ink" : "border-white/15 text-subtle hover:border-white/40",
                  )}
                >
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <CitySelect value={f.city} onChange={(v) => set("city", v)} emptyLabel="Toutes les villes" className="field !py-2.5 lg:w-48" />
            <button
              type="button"
              onClick={() => setPanelOpen((o) => !o)}
              aria-expanded={panelOpen}
              aria-controls="catalogue-filters"
              aria-label={`Filtres${activeCount ? ` (${activeCount} actifs)` : ""}`}
              className="relative inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-white/15 px-3.5 text-xs uppercase tracking-wide2 text-subtle transition hover:border-white/40"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline" aria-hidden="true">
                Filtres
              </span>
              {activeCount > 0 && (
                <span aria-hidden="true" className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-2xs text-ink">
                  {activeCount}
                </span>
              )}
            </button>
          </div>
        </div>
        {/* Desktop / tablette : panneau intégré à la barre */}
        <div id="catalogue-filters" className={cn("hidden overflow-hidden", panelOpen && "md:block")}>
          <div className="pt-5">{advanced}</div>
        </div>
      </div>

      {/* Mobile : panneau plein écran avec bouton de validation */}
      {panelOpen && (
        <div role="dialog" aria-modal="true" aria-label="Filtres" className="fixed inset-0 z-[60] flex flex-col bg-ink md:hidden">
          <div className="flex h-[var(--header-h)] items-center justify-between border-b border-white/10 px-5">
            <p className="title-luxe text-xs">Filtres</p>
            <button type="button" onClick={() => setPanelOpen(false)} aria-label="Fermer les filtres" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">{advanced}</div>
          <div className="flex gap-3 border-t border-white/10 px-5 py-4" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
            <button type="button" onClick={reset} className="btn-ghost flex-1">
              Réinitialiser
            </button>
            <button type="button" onClick={() => setPanelOpen(false)} className="btn-gold flex-[2] whitespace-nowrap !px-4 !tracking-[0.12em]">
              Voir {results.length} véhicule{results.length > 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          <span className="nums text-white">{results.length}</span> véhicule{results.length > 1 ? "s" : ""}
          {city && (
            <>
              {" "}
              à <span className="text-white">{city.name}</span>
            </>
          )}
          {f.from && f.to && (
            <span className="ml-2 inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" /> <span className="nums">{formatDateFr(f.from)} → {formatDateFr(f.to)}</span>
              <button type="button" onClick={() => setF((p) => ({ ...p, from: "", to: "" }))} aria-label="Effacer les dates" className="ml-1 inline-flex h-8 w-8 items-center justify-center hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
        </p>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button type="button" onClick={reset} className="min-h-11 text-xs text-muted underline-offset-4 hover:text-white hover:underline">
              Réinitialiser
            </button>
          )}
          <select value={sort} onChange={(e) => setSort(e.target.value as CatalogueSort)} className="field !w-auto !py-2.5 text-xs" aria-label="Trier">
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="power-desc">Puissance</option>
          </select>
        </div>
      </div>

      {results.length ? (
        <VehicleGrid vehicles={results} city={city?.name} query={query || undefined} unavailable={unavailable} priorityCount={2} />
      ) : (
        <div className="rounded-2xl border border-white/10 py-20 text-center">
          <p className="font-display text-2xl">Aucun véhicule ne correspond.</p>
          <p className="mt-2 text-sm text-muted">Élargissez vos critères ou contactez-nous : nous trouvons souvent une solution.</p>
          <button type="button" onClick={reset} className="btn-ghost mt-6">
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}
