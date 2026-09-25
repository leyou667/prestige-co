import { preload } from "react-dom";
import { Sparkles } from "lucide-react";
import { HeroBackground } from "./hero-background";
import { SearchBar } from "./search-bar";
import { QuickFilters } from "./quick-filters";
import { Advisor } from "./advisor";
import { HERO_POSTER, HERO_POSTER_MOBILE } from "@/components/media/background-video";

/** Hero unique : recherche + préselection rapide + conseiller IA, sur fond vidéo en parallaxe léger. */
export function Hero() {
  // Le poster est l'élément LCP sur desktop : on le précharge en priorité haute
  preload(HERO_POSTER, { as: "image", fetchPriority: "high", media: "(min-width: 768px)" });
  preload(HERO_POSTER_MOBILE, { as: "image", fetchPriority: "high", media: "(max-width: 767px)" });

  return (
    <section className="relative isolate -mt-[var(--header-h)] overflow-hidden pb-16 pt-28 md:pb-24 md:pt-36">
      <HeroBackground />
      <div className="container">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-start lg:gap-12">
          <div className="animate-fade-up">
            <p className="eyebrow">Conciergerie automobile</p>
            <h1 className="mt-4 font-display text-4xl font-light leading-[1.05] sm:text-5xl lg:text-6xl">
              Location de véhicules,
              <br />
              <span className="text-subtle">de l&apos;économique à la supercar.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-subtle sm:text-base">
              PRESTIGE CONCIERGERIE livre votre véhicule en Belgique et dans le Nord de la France jusqu&apos;à Paris. Choisissez,
              réservez, nous nous occupons du reste.
            </p>
            {/* Accès direct au conseiller sur mobile (il se trouve plus bas dans le flux) */}
            <a href="#conseiller" className="btn-ghost mt-6 lg:hidden">
              <Sparkles className="h-4 w-4 text-gold" /> Laissez-nous choisir pour vous
            </a>
            <div className="mt-8 space-y-6">
              <SearchBar />
              <QuickFilters />
            </div>
          </div>
          <Advisor className="animate-fade-up [animation-delay:200ms]" />
        </div>
      </div>
    </section>
  );
}
