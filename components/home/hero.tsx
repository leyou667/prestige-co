"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SearchBar } from "./search-bar";
import { QuickFilters } from "./quick-filters";
import { Advisor } from "./advisor";

/** Hero unique : recherche + préselection rapide + conseiller IA, sur fond vidéo en parallaxe léger. */
export function Hero() {
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.18]);

  return (
    <section ref={ref} className="relative isolate -mt-16 overflow-hidden pb-16 pt-28 md:-mt-20 md:pb-24 md:pt-36">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <motion.div style={{ y, scale }} className="absolute inset-x-0 bottom-40 top-0">
          <video
            className="h-full w-full object-cover opacity-45"
            src="/video/hero-gate-porsche.mp4"
            poster="/video/hero-gate-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/70 to-ink" />
      </div>

      <div className="container">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-start lg:gap-12">
          <div className="animate-fade-up">
            <p className="eyebrow">Conciergerie automobile</p>
            <h1 className="mt-4 font-display text-4xl font-light leading-[1.05] sm:text-5xl lg:text-6xl">
              Location de véhicules,
              <br />
              <span className="text-white/60">de l&apos;économique à la supercar.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">
              PRESTIGE CONCIERGERIE livre votre véhicule en Belgique et dans le Nord de la France jusqu&apos;à Paris. Choisissez,
              réservez, nous nous occupons du reste.
            </p>
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
