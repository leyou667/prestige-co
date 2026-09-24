"use client";

import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/icons";
import { GENERIC_WHATSAPP_MESSAGE, whatsappUrl } from "@/lib/site";

/** Bouton WhatsApp flottant, fixe en bas de l'écran (mobile uniquement). */
export function WhatsAppFloat() {
  const pathname = usePathname();
  if (pathname.startsWith("/devis")) return null;
  return (
    <a
      href={whatsappUrl(GENERIC_WHATSAPP_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Réserver via WhatsApp"
      className="no-print fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-[#1A1A1A]/90 text-white shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-md transition active:scale-95 md:hidden"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <WhatsAppIcon className="h-6 w-6 text-[#25D366]" />
    </a>
  );
}
