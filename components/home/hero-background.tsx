import { BackgroundVideo } from "@/components/media/background-video";

/**
 * Fond vidéo du hero, à pleine intensité.
 * Sur l'accueil, c'est aussi la vidéo de l'écran d'entrée (une seule vidéo, jamais interrompue).
 * Dégradés : en haut pour le menu, en bas pour la lisibilité du titre.
 */
export function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <BackgroundVideo />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent md:via-ink/35" />
    </div>
  );
}
