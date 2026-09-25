"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const HERO_POSTER = "/video/hero-poster.webp";
export const HERO_POSTER_MOBILE = "/video/hero-poster-480.webp";

/**
 * Vidéo de fond économe :
 * - rien n'est téléchargé tant que `active` est faux (preload="none", pas d'autoplay côté serveur) ;
 * - sources adaptées à l'écran (480p mobile / 720p desktop, WebM VP9 puis MP4 H.264) ;
 * - pause automatique hors écran ou onglet masqué ;
 * - poster seul si l'utilisateur préfère réduire les animations ou économise ses données.
 */
export function BackgroundVideo({ active = true, className }: { active?: boolean; className?: string }) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = React.useState(false);

  React.useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || saveData) return;
    // La vidéo ne démarre qu'une fois la page chargée : elle ne concurrence pas l'affichage initial
    let timer: number | undefined;
    const enable = () => (timer = window.setTimeout(() => setAllowed(true), 200));
    if (document.readyState === "complete") enable();
    else window.addEventListener("load", enable, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", enable);
    };
  }, []);

  React.useEffect(() => {
    const video = ref.current;
    if (!video || !allowed || !active) return;
    let visible = true;
    const sync = () => {
      if (visible && document.visibilityState === "visible") video.play().catch(() => {});
      else video.pause();
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(video);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      video.pause();
    };
  }, [allowed, active]);

  return (
    <div
      aria-hidden="true"
      // Poster choisi selon la largeur d'écran (et non la densité), identique à celui préchargé
      className={cn("absolute inset-0 bg-[url(/video/hero-poster-480.webp)] bg-cover bg-center md:bg-[url(/video/hero-poster.webp)]", className)}
    >
      {allowed && (
        <video ref={ref} className="h-full w-full object-cover" muted loop playsInline preload="none">
          <source src="/video/hero-480.webm" type="video/webm" media="(max-width: 767px)" />
          <source src="/video/hero-480.mp4" type="video/mp4" media="(max-width: 767px)" />
          <source src="/video/hero-720.webm" type="video/webm" />
          <source src="/video/hero-720.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
}
