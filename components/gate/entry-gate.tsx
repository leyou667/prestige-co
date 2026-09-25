"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { WhatsAppIcon } from "@/components/icons";
import { BackgroundVideo } from "@/components/media/background-video";
import { GENERIC_WHATSAPP_MESSAGE, whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "pc-gate";
export const GATE_PASSED_EVENT = "pc:gate-passed";
const EXIT_MS = 700;

/** Script inline (dans <head>) : évite tout flash du gate s'il a déjà été franchi pendant la session. */
export const gateBootScript = `try{if(sessionStorage.getItem("${STORAGE_KEY}")==="1")document.documentElement.dataset.gate="passed"}catch(e){}`;

export function isGatePassed() {
  return typeof document !== "undefined" && document.documentElement.dataset.gate === "passed";
}

type Choice = "collection" | "advisor" | "whatsapp" | "stay";

/**
 * Écran d'entrée bloquant.
 * Les animations d'apparition sont en CSS (visibles avant le chargement du JavaScript) ;
 * la vidéo n'est montée que si le gate est réellement affiché.
 */
export function EntryGate() {
  const [state, setState] = React.useState<"pending" | "open" | "leaving" | "closed">("pending");
  const router = useRouter();
  const pathname = usePathname();
  const firstButton = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    setState(isGatePassed() ? "closed" : "open");
  }, []);

  const enter = React.useCallback(
    (choice: Choice) => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {}
      document.getElementById("site-root")?.removeAttribute("inert");
      if (choice === "whatsapp") {
        window.open(whatsappUrl(GENERIC_WHATSAPP_MESSAGE), "_blank", "noopener,noreferrer");
      } else if (choice === "collection" && pathname !== "/vehicules") {
        router.push("/vehicules");
      } else if (choice === "advisor") {
        if (pathname === "/") document.getElementById("conseiller")?.scrollIntoView({ behavior: "smooth" });
        else router.push("/#conseiller");
      }
      setState("leaving");
      window.setTimeout(() => {
        document.documentElement.dataset.gate = "passed";
        window.dispatchEvent(new Event(GATE_PASSED_EVENT));
        setState("closed");
      }, EXIT_MS);
    },
    [pathname, router],
  );

  React.useEffect(() => {
    if (state !== "open") return;
    // Contenu du site inaccessible (clavier / lecteurs d'écran) tant qu'aucun choix n'est fait
    const root = document.getElementById("site-root");
    root?.setAttribute("inert", "");
    firstButton.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && enter("stay");
    window.addEventListener("keydown", onKey);
    return () => {
      root?.removeAttribute("inert");
      window.removeEventListener("keydown", onKey);
    };
  }, [state, enter]);

  if (state === "closed") return null;

  return (
    <div
      id="entry-gate"
      role="dialog"
      aria-modal="true"
      aria-label="Bienvenue chez PRESTIGE CONCIERGERIE"
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-between overflow-hidden bg-ink transition-opacity ease-out",
        state === "leaving" && "pointer-events-none opacity-0",
      )}
      style={{ transitionDuration: `${EXIT_MS}ms` }}
    >
      <BackgroundVideo active={state === "open"} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-black/80" />

      <div className="relative z-10 mt-10 w-36 animate-fade-in sm:mt-14 sm:w-48 [animation-delay:150ms]">
        <Logo href={null} priority />
      </div>

      <div className="relative z-10 mb-10 flex w-full flex-col items-center px-5 sm:mb-16">
        <p className="title-luxe mb-3 animate-fade-in text-center text-[0.7rem] text-subtle [animation-delay:350ms] sm:text-xs">
          Conciergerie automobile — Belgique · Nord de la France · Paris
        </p>
        <p className="mb-9 animate-fade-up text-center font-display text-3xl font-light text-white [animation-delay:450ms] sm:text-5xl">
          L&apos;exception, à votre porte.
        </p>
        <div className="flex w-full max-w-3xl animate-fade-up flex-col gap-3 [animation-delay:650ms] sm:flex-row sm:justify-center">
          <GateButton ref={firstButton} onClick={() => enter("collection")} featured>
            Explorer notre collection
          </GateButton>
          <GateButton onClick={() => enter("advisor")}>Notre conseiller IA</GateButton>
          <GateButton onClick={() => enter("whatsapp")}>
            <WhatsAppIcon className="h-4 w-4" />
            Réserver via WhatsApp
          </GateButton>
        </div>
        <button
          type="button"
          onClick={() => enter("stay")}
          className="mt-6 animate-fade-in text-xs text-subtle underline-offset-4 transition hover:text-white hover:underline [animation-delay:900ms]"
        >
          Entrer sur le site
        </button>
      </div>
    </div>
  );
}

const GateButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { featured?: boolean }>(
  ({ children, featured, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      {...props}
      className={cn(
        "group relative inline-flex min-h-[3.25rem] flex-1 items-center justify-center gap-2 overflow-hidden rounded-full border bg-black/40 px-6 py-4 text-[0.72rem] uppercase tracking-wide2 text-white transition duration-500 hover:border-gold hover:bg-white/10 sm:flex-none sm:px-7",
        featured ? "border-gold/70" : "border-white/30",
      )}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </button>
  ),
);
GateButton.displayName = "GateButton";
