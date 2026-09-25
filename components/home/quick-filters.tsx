import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

/** Préselection rapide par catégorie */
export function QuickFilters() {
  return (
    <div>
      <p className="eyebrow mb-3">Préselection rapide</p>
      <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {CATEGORIES.map((c) => (
          <li key={c.code} className="shrink-0">
            <Link
              href={`/vehicules?categorie=${encodeURIComponent(c.code)}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2.5 text-2xs uppercase tracking-wide2 text-white/90 transition hover:border-gold/60 hover:text-white"
            >
              {c.label}
              <span className="nums text-muted">dès {c.fromPrice}€</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
