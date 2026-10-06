"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { VEHICLES } from "@/lib/vehicles";

/** Photo représentative d'une catégorie : de préférence une photo à fond retravaillé, sinon le véhicule le plus haut de gamme. */
const CATEGORY_TILES = CATEGORIES.map((c) => {
  const score = (x: (typeof VEHICLES)[number]) => (x.cardImage?.includes("-studio") ? 10_000 : 0) + x.pricePerDay;
  const v = VEHICLES.filter((x) => x.category === c.code && x.cardImage).sort((a, b) => score(b) - score(a))[0];
  return { ...c, image: v?.cardImage, alt: v ? `${v.brand} ${v.model}, catégorie ${c.name}` : "" };
});

/** Rangée des catégories : on choisit par l'image. Défilement au doigt, flèches sur ordinateur. */
export function CategoryRail() {
  const list = React.useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = list.current;
    const tile = el?.querySelector("li");
    if (!el || !tile) return;
    el.scrollBy({ left: dir * (tile.clientWidth + 20) * 2, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="absolute -top-16 right-0 hidden gap-2 md:flex">
        <button type="button" onClick={() => scroll(-1)} aria-label="Catégories précédentes" className="btn-ghost !h-11 !w-11 !p-0">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => scroll(1)} aria-label="Catégories suivantes" className="btn-ghost !h-11 !w-11 !p-0">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <ul
        ref={list}
        className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:scroll-px-0 md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {CATEGORY_TILES.map((c) => (
          <li key={c.code} className="w-[78%] shrink-0 snap-start sm:w-[21rem]">
            <Link href={`/vehicules?categorie=${encodeURIComponent(c.code)}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-graphite">
                {c.image && (
                  <Image
                    src={c.image}
                    alt={c.alt}
                    fill
                    sizes="(min-width: 640px) 336px, 78vw"
                    quality={60}
                    className="object-cover transition-transform duration-300 [@media(hover:hover)]:group-hover:scale-[1.03]"
                  />
                )}
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-3">
                <span className="font-display text-2xl leading-tight">{c.name}</span>
                <span className="nums shrink-0 text-sm text-muted">
                  dès <span className="text-gold">{c.fromPrice} €</span>
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">{c.tagline}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
