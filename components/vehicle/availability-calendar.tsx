"use client";

import * as React from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { isDayBusy, rangesOverlap, type BusyRange } from "@/lib/availability";
import { cn, formatDateFr, parseISODate, toISODate } from "@/lib/utils";

interface AvailabilityState {
  busy: BusyRange[];
  configured: boolean;
  loading: boolean;
  /** true si la synchronisation a échoué : les dates ne sont pas vérifiées */
  error: boolean;
}

const POLL_MS = 4 * 60 * 1000; // fallback polling : toutes les 4 minutes
const FOCUS_DEBOUNCE_MS = 30 * 1000;

/**
 * Indisponibilités d'un véhicule (Google Calendar), rafraîchies périodiquement.
 * Aucun appel si aucun véhicule n'est choisi ; pause quand l'onglet est masqué.
 */
export function useAvailability(vehicleId: string | null | undefined) {
  const [state, setState] = React.useState<AvailabilityState>({ busy: [], configured: true, loading: Boolean(vehicleId), error: false });
  const lastLoad = React.useRef(0);

  const load = React.useCallback(async () => {
    if (!vehicleId) return;
    lastLoad.current = Date.now();
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch(`/api/availability?vehicle=${encodeURIComponent(vehicleId)}`, { cache: "no-store" });
      const data = (await res.json()) as { busy?: BusyRange[]; configured?: boolean; error?: string };
      setState({ busy: data.busy ?? [], configured: data.configured ?? false, loading: false, error: !res.ok || Boolean(data.error) });
    } catch {
      setState((s) => ({ ...s, loading: false, error: true }));
    }
  }, [vehicleId]);

  React.useEffect(() => {
    if (!vehicleId) return setState({ busy: [], configured: true, loading: false, error: false });
    load();
    let id: number | undefined;
    const start = () => {
      window.clearInterval(id);
      id = window.setInterval(load, POLL_MS);
    };
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return window.clearInterval(id);
      if (Date.now() - lastLoad.current > FOCUS_DEBOUNCE_MS) load();
      start();
    };
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [vehicleId, load]);

  const isBusy = React.useCallback((iso: string) => isDayBusy(state.busy, iso), [state.busy]);
  const rangeIsFree = React.useCallback((from: string, to: string) => !state.busy.some((b) => rangesOverlap(b, { start: from, end: to })), [state.busy]);
  return { ...state, isBusy, rangeIsFree, reload: load };
}

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

export function AvailabilityCalendar({
  availability,
  from,
  to,
  onSelect,
}: {
  availability: ReturnType<typeof useAvailability>;
  from?: string;
  to?: string;
  /** Sélection d'une période au clic (1er clic = départ, 2e clic = retour) */
  onSelect?: (from: string, to: string) => void;
}) {
  const today = React.useMemo(() => toISODate(new Date()), []);
  const [cursor, setCursor] = React.useState(() => {
    const d = parseISODate(from) ?? new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [pending, setPending] = React.useState<string | null>(null);

  const months = [cursor, new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)];
  const canGoBack = cursor > new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const click = (iso: string) => {
    if (!onSelect || iso < today || availability.isBusy(iso)) return;
    if (!pending) {
      setPending(iso);
      onSelect(iso, iso);
    } else {
      const [a, b] = iso < pending ? [iso, pending] : [pending, iso];
      setPending(null);
      onSelect(a, b);
    }
  };

  const navBtn = "inline-flex h-11 w-11 items-center justify-center rounded-full text-subtle transition hover:bg-white/10 disabled:opacity-20";

  return (
    <div className="rounded-2xl border border-white/10 bg-anthracite p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" disabled={!canGoBack} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className={navBtn} aria-label="Mois précédent">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="label tracking-luxe">Disponibilités</p>
        <button type="button" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className={navBtn} aria-label="Mois suivant">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {availability.error && (
        <p role="status" className="mb-4 flex items-start gap-2 rounded-lg border border-gold/30 bg-gold/5 px-3 py-2 text-xs text-subtle">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
          Disponibilités non vérifiées pour le moment : nous confirmerons la disponibilité avec vous sur WhatsApp.
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 sm:gap-10">
        {months.map((month, mi) => {
          const first = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
          const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
          return (
            <div key={month.toISOString()} className={cn(mi === 1 && "hidden sm:block")}>
              <p className="mb-3 text-center font-display text-lg capitalize">
                {new Intl.DateTimeFormat("fr-BE", { month: "long", year: "numeric" }).format(month)}
              </p>
              <div className="grid grid-cols-7 gap-1 text-center text-2xs text-muted" aria-hidden="true">
                {WEEKDAYS.map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {Array.from({ length: first }).map((_, i) => (
                  <span key={`e${i}`} />
                ))}
                {Array.from({ length: days }).map((_, i) => {
                  const iso = toISODate(new Date(month.getFullYear(), month.getMonth(), i + 1));
                  const past = iso < today;
                  const busy = availability.isBusy(iso);
                  const selected = from && to && iso >= from && iso <= to;
                  const edge = iso === from || iso === to;
                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={past || busy || !onSelect}
                      onClick={() => click(iso)}
                      aria-label={`${formatDateFr(iso)}${busy ? " — réservé" : ""}${iso === today ? " — aujourd'hui" : ""}`}
                      aria-pressed={onSelect ? Boolean(selected) : undefined}
                      className={cn(
                        "nums relative h-11 rounded-md text-xs transition sm:h-10",
                        past && "text-white/20",
                        !past && !busy && "text-white/85 hover:bg-white/10",
                        busy && !past && "cursor-not-allowed bg-red-500/10 text-red-300/60 line-through",
                        iso === today && "ring-1 ring-inset ring-gold/60",
                        selected && !busy && "bg-gold/20 text-white",
                        edge && "!bg-gold !text-ink",
                        !onSelect && "cursor-default",
                      )}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-2xs text-muted">
        <div className="flex flex-wrap gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm border border-white/40" /> Disponible
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-red-500/40" /> Réservé
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-gold" /> Votre sélection
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm ring-1 ring-inset ring-gold/60" /> Aujourd&apos;hui
          </span>
        </div>
        <button type="button" onClick={availability.reload} className="inline-flex min-h-9 items-center gap-1.5 hover:text-white" aria-label="Actualiser les disponibilités">
          <RefreshCw className={cn("h-3 w-3", availability.loading && "animate-spin")} />
          {availability.configured ? "Synchronisé avec l'agenda" : "Disponibilités confirmées sur demande"}
        </button>
      </div>
    </div>
  );
}
