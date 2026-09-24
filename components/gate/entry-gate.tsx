"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { WhatsAppIcon } from "@/components/icons";
import { GENERIC_WHATSAPP_MESSAGE, whatsappUrl } from "@/lib/site";

const STORAGE_KEY = "pc-gate";

/** Script inline (dans <head>) : évite tout flash du gate s'il a déjà été franchi pendant la session. */
export const gateBootScript = `try{if(sessionStorage.getItem("${STORAGE_KEY}")==="1")document.documentElement.dataset.gate="passed"}catch(e){}`;

type Choice = "collection" | "advisor" | "whatsapp";

export function EntryGate() {
  const [open, setOpen] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const firstButton = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (document.documentElement.dataset.gate === "passed") {
      setOpen(false);
      return;
    }
    // Contenu du site inaccessible (clavier / lecteurs d'écran) tant qu'aucun choix n'est fait
    const root = document.getElementById("site-root");
    root?.setAttribute("inert", "");
    firstButton.current?.focus({ preventScroll: true });
    return () => root?.removeAttribute("inert");
  }, []);

  const enter = (choice: Choice) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    document.getElementById("site-root")?.removeAttribute("inert");
    if (choice === "whatsapp") {
      window.open(whatsappUrl(GENERIC_WHATSAPP_MESSAGE), "_blank", "noopener,noreferrer");
    } else if (choice === "collection" && pathname === "/") {
      router.push("/vehicules");
    } else if (choice === "advisor") {
      if (pathname === "/") document.getElementById("conseiller")?.scrollIntoView({ behavior: "smooth" });
      else router.push("/#conseiller");
    }
    setOpen(false);
  };

  return (
    <AnimatePresence onExitComplete={() => (document.documentElement.dataset.gate = "passed")}>
      {open && (
        <motion.div
          id="entry-gate"
          role="dialog"
          aria-modal="true"
          aria-label="Bienvenue chez PRESTIGE CONCIERGERIE"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-between overflow-hidden bg-ink"
          exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="/video/hero-gate-porsche.mp4"
            poster="/video/hero-gate-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-black/80" />

          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="relative z-10 mt-10 w-36 sm:mt-14 sm:w-48"
          >
            <Logo href={null} priority />
          </motion.div>

          <div className="relative z-10 mb-12 flex w-full flex-col items-center px-5 sm:mb-20">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.6 }}
              className="title-luxe mb-3 text-center text-[0.7rem] text-white/70 sm:text-xs"
            >
              Conciergerie automobile — Belgique · Nord de la France · Paris
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.8 }}
              className="mb-9 text-center font-display text-3xl font-light text-white sm:text-5xl"
            >
              L&apos;exception, à votre porte.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1 }}
              className="flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:justify-center"
            >
              <GateButton ref={firstButton} onClick={() => enter("collection")}>
                Explorer notre collection
              </GateButton>
              <GateButton onClick={() => enter("advisor")}>Notre conseiller IA</GateButton>
              <GateButton onClick={() => enter("whatsapp")}>
                <WhatsAppIcon className="h-4 w-4" />
                Réserver via WhatsApp
              </GateButton>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const GateButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      {...props}
      className="group relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-full border border-white/30 bg-black/35 px-6 py-4 text-[0.7rem] uppercase tracking-wide2 text-white backdrop-blur-md transition duration-500 hover:border-gold/70 hover:bg-white/10 focus-visible:border-gold focus-visible:outline-none sm:flex-none sm:px-7"
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </button>
  ),
);
GateButton.displayName = "GateButton";
