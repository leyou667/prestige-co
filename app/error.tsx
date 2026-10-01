"use client";

import { useEffect } from "react";
import Link from "next/link";
import { GENERIC_WHATSAPP_MESSAGE, whatsappUrl } from "@/lib/site";

/** Erreur inattendue dans une page : message clair et sorties utiles, sans détail technique. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">Un imprévu sur la route</p>
      <h1 className="mt-4 font-display text-4xl font-light">Cette page n&apos;a pas pu s&apos;afficher.</h1>
      <p className="mt-4 max-w-md text-sm text-muted">Réessayez dans un instant. Si le problème persiste, nous restons joignables sur WhatsApp.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="btn-gold">
          Réessayer
        </button>
        <Link href="/vehicules" className="btn-ghost">
          Voir la collection
        </Link>
        <a href={whatsappUrl(GENERIC_WHATSAPP_MESSAGE)} target="_blank" rel="noopener noreferrer" className="btn-ghost">
          WhatsApp
        </a>
      </div>
    </div>
  );
}
