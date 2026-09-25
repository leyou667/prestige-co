"use client";

import * as React from "react";
import { m, useScroll, useTransform } from "framer-motion";
import { BackgroundVideo } from "@/components/media/background-video";
import { GATE_PASSED_EVENT, isGatePassed } from "@/components/gate/entry-gate";

/** Fond vidéo du hero en parallaxe légère — démarre seulement une fois l'écran d'entrée franchi. */
export function HeroBackground() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  React.useEffect(() => {
    if (isGatePassed()) return setActive(true);
    const on = () => setActive(true);
    window.addEventListener(GATE_PASSED_EVENT, on);
    return () => window.removeEventListener(GATE_PASSED_EVENT, on);
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <m.div style={{ y }} className="absolute inset-x-0 bottom-40 top-0 scale-110 opacity-45">
        <BackgroundVideo active={active} />
      </m.div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/70 to-ink" />
    </div>
  );
}
