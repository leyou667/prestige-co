import { CITIES, type City } from "@/lib/cities";

/** Sélecteur de ville (options groupées Belgique / France). */
export function CitySelect({
  value,
  onChange,
  cities = CITIES,
  emptyLabel,
  className = "field",
  id,
  ariaLabel = "Ville",
}: {
  value: string;
  onChange: (slug: string) => void;
  cities?: City[];
  /** Libellé de l'option vide (ex. « Toutes les villes ») ; absent = pas d'option vide */
  emptyLabel?: string;
  className?: string;
  id?: string;
  ariaLabel?: string;
}) {
  const groups = [
    { label: "Belgique", items: cities.filter((c) => c.country === "BE") },
    { label: "France", items: cities.filter((c) => c.country === "FR") },
  ].filter((g) => g.items.length);
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={className} aria-label={id ? undefined : ariaLabel}>
      {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
      {groups.map((g) => (
        <optgroup key={g.label} label={g.label}>
          {g.items.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
