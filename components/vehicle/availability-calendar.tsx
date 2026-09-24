"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { cn, parseISODate, toISODate } from "@/lib/utils";

export interface BusyRange {
  start: string;
  end: string;
}

interface AvailabilityState {
  busy: BusyRange[];
  configured: boolean;
  loading: boolean;
  error?: string;
  updatedAt?: Date;
}

const POLL_MS = 4 * 60 * 1000; // fallback polling : toutes les 4 minutes

/** Récupère les indisponibilités (Google Calendar) et se rafraîchit périodiquement. */
export function useAvailability(vehicleId: string) {
  const [state, setState] = React.useState<AvailabilityState>({ busy: [], configured: true, loading: true });

  const load = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/availability?vehicle=${encodeURIComponent(vehicleId)}`, { cache: "no-store" });
      const data = (await res.json()) as { busy?: BusyRange[]; configured?: boolean; error?: string };
      setState({ busy: data.busy ?? [], configured: data.configured ?? false, loading: false, error: data.error, updatedAt: new Date() });
    } catch {
      setState((s) => ({ ...s, loading: false, error: "Synchronisation indisponible" }));
    }
  }, [vehicleId]);

  React.useEffect(() => {
    load();
    const id = window.setInterval(load, POLL_MS);
    const onFocus = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [load]);

  const isBusy = React.useCallback((iso: string) => state.busy.some((b) => iso >= b.start && iso <= b.end), [state.busy]);
  const rangeIsFree = React.useCallback(
    (from: string, to: string) => !state.busy.some((b) => from <= b.end && b.start <= to),
    [state.busy],
  );
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

  return (
    <div className="rounded-2xl border border-white/10 bg-anthracite p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" disabled={!canGoBack} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="rounded-full p-2 text-white/60 transition hover:bg-white/10 disabled:opacity-20" aria-label="Mois précédent">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-[0.62rem] uppercase tracking-luxe text-white/50">Disponibilités</p>
        <button type="button" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="rounded-full p-2 text-white/60 transition hover:bg-white/10" aria-label="Mois suivant">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 sm:gap-10">
        {months.map((m, mi) => {
          const first = (new Date(m.getFullYear(), m.getMonth(), 1).getDay() + 6) % 7;
          const days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
          return (
            <div key={m.toISOString()} className={cn(mi === 1 && "hidden sm:block")}>
              <p className="mb-3 text-center font-display text-lg capitalize">
                {new Intl.DateTimeFormat("fr-BE", { month: "long", year: "numeric" }).format(m)}
              </p>
              <div className="grid grid-cols-7 gap-1 text-center text-[0.6rem] text-white/35">
                {WEEKDAYS.map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {Array.from({ length: first }).map((_, i) => (
                  <span key={`e${i}`} />
                ))}
                {Array.from({ length: days }).map((_, i) => {
                  const iso = toISODate(new Date(m.getFullYear(), m.getMonth(), i + 1));
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
                      aria-label={`${iso}${busy ? " — indisponible" : ""}`}
                      className={cn(
                        "relative h-9 rounded-md text-xs transition sm:h-10",
                        past && "text-white/15",
                        !past && !busy && "text-white/80 hover:bg-white/10",
                        busy && !past && "cursor-not-allowed bg-red-500/10 text-red-300/50 line-through",
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

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[0.65rem] text-white/45">
        <div className="flex gap-4">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-white/20" /> Disponible</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-500/40" /> Réservé</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-gold" /> Votre sélection</span>
        </div>
        <button type="button" onClick={availability.reload} className="inline-flex items-center gap-1.5 hover:text-white" aria-label="Actualiser les disponibilités">
          <RefreshCw className={cn("h-3 w-3", availability.loading && "animate-spin")} />
          {availability.configured ? "Synchronisé avec l'agenda" : "Disponibilités confirmées sur demande"}
        </button>
      </div>
    </div>
  );
}
