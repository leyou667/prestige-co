"use client";

import { LazyMotion, MotionConfig } from "framer-motion";

// Les fonctionnalités d'animation (y compris drag) sont chargées à la demande, hors du chemin critique
const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
