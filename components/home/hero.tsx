import type { CSSProperties } from "react";
import { preload } from "react-dom";
import { HeroBackground } from "./hero-background";
import { SearchBar } from "./search-bar";
import { HERO_POSTER, HERO_POSTER_MOBILE } from "@/components/media/background-video";

/** Ordre d'apparition du contenu quand on quitte l'écran d'entrée (voir .hero-reveal dans globals.css). */
const order = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * Hero plein écran : la vidéo est le sujet. Titre court, recherche fine.
 * Sur l'accueil, l'écran d'entrée est posé sur cette même vidéo : en le quittant, la vidéo continue
 * et seul le contenu du hero apparaît.
 */
export function Hero() {
  // Le poster est l'élément LCP : on le précharge en priorité haute
  preload(HERO_POSTER, { as: "image", fetchPriority: "high", media: "(min-width: 768px)" });
  preload(HERO_POSTER_MOBILE, { as: "image", fetchPriority: "high", media: "(max-width: 767px)" });

  return (
    <section className="relative isolate -mt-[var(--header-h)] flex min-h-[100svh] flex-col justify-end overflow-hidden">
      <HeroBackground />
      <div className="container pb-8 pt-36 md:pb-14">
        <p className="hero-reveal eyebrow" style={order(0)}>
          Conciergerie automobile en Belgique, dans le Nord de la France et à Paris
        </p>
        <h1
          className="hero-reveal mt-4 max-w-4xl font-display text-[clamp(3.25rem,9vw,6.75rem)] font-light leading-[0.92] tracking-[-0.015em]"
          style={order(1)}
        >
          L&apos;exception,
          <br />à votre porte.
          <span className="sr-only"> Location de voitures, de l&apos;économique à la supercar.</span>
        </h1>
        <p className="hero-reveal mt-6 max-w-lg text-base leading-relaxed text-subtle sm:text-lg" style={order(2)}>
          De la citadine à la supercar, votre véhicule est livré et repris à l&apos;adresse de votre choix.
        </p>
        <div className="hero-reveal mt-10" style={order(3)}>
          <SearchBar />
        </div>
      </div>
    </section>
  );
}
