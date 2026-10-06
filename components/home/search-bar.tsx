"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CitySelect } from "@/components/forms/city-select";
import { DateRangeFields } from "@/components/forms/date-range-fields";
import { OVERLAY_ATTR } from "@/components/layout/whatsapp-float";

const bare = "w-full appearance-none bg-transparent text-base outline-none";

interface SearchState {
  city: string;
  from: string;
  to: string;
}

/**
 * Recherche du hero : ville + dates.
 * Ordinateur : une seule ligne, sous le titre.
 * Mobile : un bouton qui ouvre la recherche en plein écran (feuille qui monte du bas, 400 ms).
 */
export function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<SearchState>({ city: "", from: "", to: "" });
  const trigger = React.useRef<HTMLButtonElement>(null);
  const sheet = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => setMounted(true), []);

  const close = React.useCallback(() => {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }, []);

  // Feuille ouverte : défilement bloqué, barre d'action masquée, Échap pour fermer, focus dans la feuille
  React.useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    html.setAttribute(OVERLAY_ATTR, "");
    sheet.current?.querySelector<HTMLElement>("select, input, button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = "";
      html.removeAttribute(OVERLAY_ATTR);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (state.city) params.set("ville", state.city);
    if (state.from) params.set("du", state.from);
    if (state.to) params.set("au", state.to);
    setOpen(false);
    router.push(`/vehicules${params.size ? `?${params}` : ""}`);
  };

  return (
    <div className="max-w-4xl">
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex min-h-14 w-full items-center gap-3 rounded-full border border-white/20 bg-ink/70 px-5 text-left text-base text-subtle active:scale-[0.98] md:hidden"
        style={{ transition: "transform 160ms var(--ease-out)" }}
      >
        <Search className="h-4 w-4 text-silver" aria-hidden="true" />
        Choisir une ville et des dates
      </button>

      {/* Ordinateur : formulaire en ligne */}
      <SearchForm
        idPrefix="hero"
        state={state}
        onChange={setState}
        onSubmit={submit}
        className="hidden rounded-full border border-white/15 bg-ink/75 p-1.5 md:grid md:grid-cols-[1.1fr_1fr_1fr_auto] md:gap-1.5"
      />

      {/* Mobile : feuille plein écran, rendue dans <body> (au-dessus du menu) */}
      {mounted &&
        open &&
        createPortal(
          <div
            ref={sheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-sheet-title"
            className="fixed inset-0 z-[60] flex animate-sheet-up flex-col bg-ink px-5 pt-5 md:hidden"
            style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center justify-between">
              <h2 id="search-sheet-title" className="font-display text-3xl font-light">
                Votre recherche
              </h2>
              <button type="button" onClick={close} aria-label="Fermer la recherche" className="btn-ghost !h-11 !w-11 !p-0">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted">Ville de livraison et dates : nous affichons les véhicules disponibles.</p>
            <SearchForm idPrefix="sheet" state={state} onChange={setState} onSubmit={submit} stacked className="mt-8 flex flex-1 flex-col gap-3" />
          </div>,
          document.body,
        )}
    </div>
  );
}

function SearchForm({
  idPrefix,
  state,
  onChange,
  onSubmit,
  stacked,
  className,
}: {
  idPrefix: string;
  state: SearchState;
  onChange: (s: SearchState) => void;
  onSubmit: (e: React.FormEvent) => void;
  stacked?: boolean;
  className?: string;
}) {
  const field = stacked ? "rounded-xl border border-white/10 bg-white/[0.04]" : "md:rounded-full";
  return (
    <form onSubmit={onSubmit} role="search" aria-label="Rechercher un véhicule" className={className}>
      <Field id={`${idPrefix}-city`} icon={<MapPin className="h-3.5 w-3.5" />} label="Ville" className={field}>
        <CitySelect id={`${idPrefix}-city`} value={state.city} onChange={(city) => onChange({ ...state, city })} emptyLabel="Toutes les villes" className={bare} />
      </Field>
      <DateRangeFields
        from={state.from}
        to={state.to}
        onChange={(from, to) => onChange({ ...state, from, to })}
        inputClassName="w-full bg-transparent text-base outline-none"
        renderField={({ id, label, input }) => (
          <Field key={id} id={id} icon={<CalendarDays className="h-3.5 w-3.5" />} label={label} className={field}>
            {input}
          </Field>
        )}
      />
      <button type="submit" className={cn("btn-gold min-h-[3.25rem]", stacked ? "mt-auto w-full !py-4" : "md:!px-7")}>
        <Search className="h-4 w-4" aria-hidden="true" /> Rechercher
      </button>
    </form>
  );
}

function Field({ id, icon, label, children, className }: { id: string; icon: React.ReactNode; label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col justify-center px-4 py-3 transition-colors focus-within:bg-white/[0.08] hover:bg-white/[0.05] md:px-5 md:py-2.5", className)}>
      <label htmlFor={id} className="label mb-0.5 flex items-center gap-1.5">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}
