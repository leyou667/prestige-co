"use client";

import * as React from "react";
import { Check, Share2 } from "lucide-react";

/** Partager la fiche : feuille de partage native sur mobile, sinon copie du lien. */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = React.useState(false);
  const share = async () => {
    const url = window.location.href.split("?")[0];
    try {
      if (navigator.share) return await navigator.share({ title, url });
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <button type="button" onClick={share} className="inline-flex min-h-9 items-center gap-1.5 text-xs text-muted transition hover:text-white" aria-live="polite">
      {copied ? <Check className="h-3.5 w-3.5 text-gold" /> : <Share2 className="h-3.5 w-3.5" />}
      {copied ? "Lien copié" : "Partager"}
    </button>
  );
}
