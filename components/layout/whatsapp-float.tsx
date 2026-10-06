"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/icons";
import { GENERIC_WHATSAPP_MESSAGE, whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Attribut posé sur <html> quand un panneau plein écran (filtres) est ouvert. */
export const OVERLAY_ATTR = "data-overlay";

/**
 * Barre d'action mobile : « Demander un devis » + WhatsApp, toujours à portée de pouce.
 * Masquée : sur le devis, sur les fiches véhicule (barre de réservation dédiée), tant que le hero
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
    <aside
      aria-label="Contact rapide"
      aria-hidden={hidden}
      inert={hidden}
      className={cn(
        "no-print fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-white/10 bg-ink/95 px-5 pt-3 md:hidden",
        hidden && "pointer-events-none translate-y-full opacity-0",
      )}
      style={{
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        transition: "transform 300ms var(--ease-out), opacity 300ms var(--ease-out)",
      }}
    >
      <Link href="/devis" className="btn-gold flex-1">
        Demander un devis
      </Link>
      <a href={whatsappUrl(GENERIC_WHATSAPP_MESSAGE)} target="_blank" rel="noopener noreferrer" aria-label="Réserver via WhatsApp" className="btn-ghost !px-4">
        <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
      </a>
    </aside>
  );
}
