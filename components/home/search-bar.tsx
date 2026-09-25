"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Search, Car } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { CitySelect } from "@/components/forms/city-select";
import { DateRangeFields } from "@/components/forms/date-range-fields";

const bare = "w-full appearance-none bg-transparent text-sm outline-none";

export function SearchBar() {
  const router = useRouter();
  const [city, setCity] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [category, setCategory] = React.useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("ville", city);
    if (from) params.set("du", from);
    if (to) params.set("au", to);
    if (category) params.set("categorie", category);
    router.push(`/vehicules${params.size ? `?${params}` : ""}`);
  };

  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label="Rechercher un véhicule"
      className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/60 p-2 lg:grid-cols-[1fr_1.25fr_1.25fr_1fr_auto]"
    >
      <Field id="search-city" icon={<MapPin className="h-4 w-4" />} label="Ville" className="col-span-2 lg:col-span-1">
        <CitySelect id="search-city" value={city} onChange={setCity} emptyLabel="Toutes" className={bare} />
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
          <Field key={id} id={id} icon={<CalendarDays className="h-4 w-4" />} label={label}>
            {input}
          </Field>
        )}
      />
      <Field id="search-category" icon={<Car className="h-4 w-4" />} label="Catégorie" className="col-span-2 lg:col-span-1">
        <select id="search-category" value={category} onChange={(e) => setCategory(e.target.value)} className={bare}>
          <option value="">Toutes</option>
          {CATEGORIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label} ({c.code})
            </option>
          ))}
        </select>
      </Field>
      <button type="submit" className="btn-gold col-span-2 h-full min-h-[3.25rem] rounded-xl lg:col-span-1 lg:!px-5">
        <Search className="h-4 w-4" /> <span className="lg:sr-only">Rechercher</span>
      </button>
    </form>
  );
}

function Field({ id, icon, label, children, className }: { id: string; icon: React.ReactNode; label: string; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col justify-center rounded-xl bg-white/[0.05] px-3.5 py-2.5 transition focus-within:bg-white/[0.09] focus-within:ring-1 focus-within:ring-gold/60",
        className,
      )}
    >
      <label htmlFor={id} className="label mb-1 flex items-center gap-1.5">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}
