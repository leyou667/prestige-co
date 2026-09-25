"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/icons";
import { GENERIC_WHATSAPP_MESSAGE, whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Attribut posé sur <html> quand un panneau plein écran (filtres) est ouvert. */
export const OVERLAY_ATTR = "data-overlay";

/**
 * Bouton WhatsApp flottant (mobile uniquement).
 * Masqué : sur le devis, sur les fiches véhicule (barre de réservation dédiée), tant que le hero
 * d'accueil est visible, et quand un panneau plein écran est ouvert.
 */
export function WhatsAppFloat() {
  const pathname = usePathname();
  const [pastHero, setPastHero] = React.useState(pathname !== "/");
  const [overlay, setOverlay] = React.useState(false);
  const [hasBookingBar, setHasBookingBar] = React.useState(false);

  React.useEffect(() => {
    setHasBookingBar(Boolean(document.querySelector("[data-booking-bar]")));
    if (pathname !== "/") return setPastHero(true);
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  React.useEffect(() => {
    const html = document.documentElement;
    const obs = new MutationObserver(() => setOverlay(html.hasAttribute(OVERLAY_ATTR)));
    obs.observe(html, { attributes: true, attributeFilter: [OVERLAY_ATTR] });
    return () => obs.disconnect();
  }, []);

  if (pathname.startsWith("/devis") || hasBookingBar) return null;
  const hidden = !pastHero || overlay;

  return (
    <a
      href={whatsappUrl(GENERIC_WHATSAPP_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Réserver via WhatsApp"
      tabIndex={hidden ? -1 : undefined}
      aria-hidden={hidden}
      className={cn(
        "no-print fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-anthracite text-white shadow-[0_10px_40px_rgba(0,0,0,0.6)] transition duration-300 active:scale-95 md:hidden",
        hidden && "pointer-events-none translate-y-4 opacity-0",
      )}
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <WhatsAppIcon className="h-6 w-6 text-[#25D366]" />
    </a>
  );
}
