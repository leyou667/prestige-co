"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, m, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/lib/vehicles";
import { VehicleVisual } from "./vehicle-visual";

/** Galerie photos réelles : carrousel + flèches + miniatures cliquables + lightbox, swipe tactile. */
export function Gallery({ vehicle }: { vehicle: Vehicle }) {
  const photos = vehicle.photos;
  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(0);
  const [lightbox, setLightbox] = React.useState(false);
  const thumbs = React.useRef<HTMLUListElement>(null);

  const go = React.useCallback(
    (delta: number) => {
      setDirection(delta);
      setIndex((i) => (i + delta + photos.length) % photos.length);
    },
    [photos.length],
  );

  React.useEffect(() => {
    // Défilement horizontal de la bande de miniatures uniquement (jamais de la page)
    const list = thumbs.current;
    const item = list?.children[index] as HTMLElement | undefined;
    if (list && item) list.scrollTo({ left: item.offsetLeft - (list.clientWidth - item.offsetWidth) / 2, behavior: "smooth" });
  }, [index]);

  React.useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, go]);

  if (!photos.length) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
        <VehicleVisual vehicle={vehicle} priority sizes="(min-width: 1024px) 60vw, 100vw" />
        <p className="absolute inset-x-0 bottom-5 text-center text-2xs uppercase tracking-luxe text-muted">
          Photos disponibles sur demande
        </p>
      </div>
    );
  }

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
  };

  const slide = (fit: "cover" | "contain", sizes: string) => (
    <AnimatePresence initial={false} custom={direction} mode="popLayout">
      <m.div
        key={index}
        custom={direction}
        initial={{ opacity: 0, x: direction >= 0 ? 60 : -60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction >= 0 ? -60 : 60 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        drag={photos.length > 1 ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={onDragEnd}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
      >
        <Image
          src={photos[index].src}
          alt={photos[index].alt}
          fill
          sizes={sizes}
          priority={index === 0}
          draggable={false}
          className={fit === "cover" ? "object-cover" : "object-contain"}
        />
      </m.div>
    </AnimatePresence>
  );

  const arrows = (big?: boolean) =>
    photos.length > 1 && (
      <>
        <button type="button" onClick={() => go(-1)} aria-label="Photo précédente" className={cn("absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:bg-black/80", big ? "p-3.5" : "p-3")}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => go(1)} aria-label="Photo suivante" className={cn("absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:bg-black/80", big ? "p-3.5" : "p-3")}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </>
    );

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-anthracite">
        {slide("cover", "(min-width: 1024px) 60vw, 100vw")}
        {arrows()}
        <button type="button" onClick={() => setLightbox(true)} aria-label="Agrandir la photo" className="absolute right-3 top-3 z-10 rounded-full border border-white/20 bg-black/50 p-3 text-white backdrop-blur-md transition hover:bg-black/80">
          <Expand className="h-4 w-4" />
        </button>
        <span className="absolute bottom-3 left-3 z-10 rounded-full bg-black/60 px-3 py-1 text-2xs tracking-wide2 text-white/80">
          {index + 1} / {photos.length}
        </span>
      </div>

      {photos.length > 1 && (
        <ul ref={thumbs} className="relative mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {photos.map((p, i) => (
            <li key={p.src} className="shrink-0">
              <button
                type="button"
                onClick={() => {
                  setDirection(i > index ? 1 : -1);
                  setIndex(i);
                }}
                aria-label={`Afficher la photo ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={cn("relative block h-16 w-24 overflow-hidden rounded-lg border transition sm:h-20 sm:w-28", i === index ? "border-gold opacity-100" : "border-white/10 opacity-50 hover:opacity-90")}
              >
                <Image src={p.src} alt="" fill sizes="112px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {lightbox && (
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label="Galerie en plein écran"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex flex-col bg-black/95"
          >
            <div className="flex items-center justify-between p-4 text-sm text-subtle">
              <span>{index + 1} / {photos.length}</span>
              <button type="button" onClick={() => setLightbox(false)} aria-label="Fermer" className="rounded-full p-3 hover:bg-white/10">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="relative flex-1">
              {slide("contain", "100vw")}
              {arrows(true)}
            </div>
            <p className="p-4 text-center text-xs text-muted">{photos[index].alt}</p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
