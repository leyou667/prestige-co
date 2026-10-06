"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { CitySelect } from "@/components/forms/city-select";
import { DateRangeFields } from "@/components/forms/date-range-fields";

const bare = "w-full appearance-none bg-transparent text-sm outline-none";

/**
 * Recherche du hero : ville + dates, une seule ligne sur ordinateur.
 * Sur mobile, le formulaire est replié derrière un bouton pour laisser la vidéo et le titre respirer.
 */
export function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [city, setCity] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("ville", city);
    if (from) params.set("du", from);
    if (to) params.set("au", to);
    router.push(`/vehicules${params.size ? `?${params}` : ""}`);
  };

  return (
    <div className="max-w-4xl">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="hero-search"
        className={cn(
          "flex min-h-14 w-full items-center gap-3 rounded-full border border-white/20 bg-ink/70 px-5 text-left text-sm text-subtle active:scale-[0.98] md:hidden",
          open && "hidden",
        )}
        style={{ transition: "transform 160ms var(--ease-out)" }}
      >
        <Search className="h-4 w-4 text-gold" aria-hidden="true" />
        Choisir une ville et des dates
      </button>

      <form
        id="hero-search"
        onSubmit={submit}
        role="search"
        aria-label="Rechercher un véhicule"
        className={cn(
          "grid-cols-2 gap-1.5 rounded-2xl border border-white/15 bg-ink/75 p-1.5 md:grid md:grid-cols-[1.1fr_1fr_1fr_auto] md:rounded-full",
          open ? "grid animate-fade-up [animation-duration:300ms]" : "hidden",
        )}
      >
        <Field id="search-city" icon={<MapPin className="h-3.5 w-3.5" />} label="Ville" className="col-span-2 md:col-span-1">
          <CitySelect id="search-city" value={city} onChange={setCity} emptyLabel="Toutes les villes" className={bare} />
        </Field>
        <DateRangeFields
          from={from}
          to={to}
          onChange={(f, t) => {
            setFrom(f);
            setTo(t);
          }}
          inputClassName="w-full bg-transparent text-sm outline-none"
          renderField={({ id, label, input }) => (
            <Field key={id} id={id} icon={<CalendarDays className="h-3.5 w-3.5" />} label={label}>
              {input}
            </Field>
          )}
        />
        <button type="submit" className="btn-gold col-span-2 min-h-[3.25rem] md:col-span-1 md:!px-7">
          <Search className="h-4 w-4" aria-hidden="true" /> Rechercher
        </button>
      </form>
    </div>
  );
}

function Field({ id, icon, label, children, className }: { id: string; icon: React.ReactNode; label: string; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col justify-center rounded-xl px-4 py-2.5 transition-colors focus-within:bg-white/[0.08] hover:bg-white/[0.05] md:rounded-full md:px-5",
        className,
      )}
    >
      <label htmlFor={id} className="label mb-0.5 flex items-center gap-1.5">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}
