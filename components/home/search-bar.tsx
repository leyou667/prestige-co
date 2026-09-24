"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Search, Car } from "lucide-react";
import { CITIES } from "@/lib/cities";
import { CATEGORIES } from "@/lib/categories";
import { cn, toISODate } from "@/lib/utils";

export function SearchBar() {
  const router = useRouter();
  const [city, setCity] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [category, setCategory] = React.useState("");
  const today = React.useMemo(() => toISODate(new Date()), []);

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
      className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/45 p-2 backdrop-blur-xl lg:grid-cols-[1fr_1.25fr_1.25fr_1fr_auto]"
    >
      <Field icon={<MapPin className="h-4 w-4" />} label="Ville" className="col-span-2 lg:col-span-1">
        <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full appearance-none bg-transparent text-sm outline-none" aria-label="Ville">
          <option value="">Toutes</option>
          <optgroup label="Belgique">
            {CITIES.filter((c) => c.country === "BE").map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </optgroup>
          <optgroup label="France">
            {CITIES.filter((c) => c.country === "FR").map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </optgroup>
        </select>
      </Field>
      <Field icon={<CalendarDays className="h-4 w-4" />} label="Départ">
        <input
          type="date"
          min={today}
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            if (to && e.target.value > to) setTo(e.target.value);
          }}
          className="w-full bg-transparent text-sm outline-none"
          aria-label="Date de départ"
        />
      </Field>
      <Field icon={<CalendarDays className="h-4 w-4" />} label="Retour">
        <input type="date" min={from || today} value={to} onChange={(e) => setTo(e.target.value)} className="w-full bg-transparent text-sm outline-none" aria-label="Date de retour" />
      </Field>
      <Field icon={<Car className="h-4 w-4" />} label="Catégorie" className="col-span-2 lg:col-span-1">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full appearance-none bg-transparent text-sm outline-none" aria-label="Catégorie">
          <option value="">Toutes</option>
          {CATEGORIES.map((c) => (
            <option key={c.code} value={c.code}>{c.label} ({c.code})</option>
          ))}
        </select>
      </Field>
      <button type="submit" className="btn-gold col-span-2 h-full min-h-[3.25rem] rounded-xl lg:col-span-1 lg:!px-5">
        <Search className="h-4 w-4" /> <span className="lg:sr-only">Rechercher</span>
      </button>
    </form>
  );
}

function Field({ icon, label, children, className }: { icon: React.ReactNode; label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("flex min-w-0 flex-col justify-center rounded-xl bg-white/[0.04] px-3.5 py-2.5 transition focus-within:bg-white/[0.08]", className)}>
      <span className="mb-1 flex items-center gap-1.5 text-[0.58rem] uppercase tracking-wide2 text-white/50">
        {icon} {label}
      </span>
      {children}
    </label>
  );
}
