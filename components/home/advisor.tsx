"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { ArrowLeft, RotateCcw, Sparkles } from "lucide-react";
import { QUESTIONS, recommend, type AdvisorAnswers } from "@/lib/advisor";
import { getCategory } from "@/lib/categories";
import { vehicleHref } from "@/lib/vehicles";
import { cn, formatPrice } from "@/lib/utils";
import { VehicleVisual } from "@/components/vehicle/vehicle-visual";

/**
 * Conseiller IA — questions guidées uniquement.
 * Logique 100 % locale et déterministe (lib/advisor.ts) : aucun appel réseau.
 */
export function Advisor({ className }: { className?: string }) {
  const [answers, setAnswers] = React.useState<AdvisorAnswers>({});
  const [step, setStep] = React.useState(0);
  const done = step >= QUESTIONS.length;
  const results = React.useMemo(() => (done ? recommend(answers) : []), [done, answers]);

  const choose = (key: keyof AdvisorAnswers, value: string) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    setStep((s) => s + 1);
  };
  const back = () => setStep((s) => Math.max(0, s - 1));
  const restart = () => {
    setAnswers({});
    setStep(0);
  };

  const labelFor = (key: keyof AdvisorAnswers) => {
    const q = QUESTIONS.find((q) => q.key === key)!;
    return q.options.find((o) => o.value === answers[key])?.label;
  };

  return (
    <div
      id="conseiller"
      className={cn("scroll-mt-28 rounded-2xl border border-white/10 bg-black/65 p-5 sm:p-6", className)}
      aria-live="polite"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 text-gold">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-2xs uppercase tracking-luxe text-muted">Conseiller IA</p>
            <h2 className="font-display text-xl leading-tight">Le véhicule idéal en 4 questions</h2>
          </div>
        </div>
        {step > 0 && (
          <div className="flex gap-1">
            {!done && (
              <button type="button" onClick={back} className="rounded-full p-3 text-muted transition hover:bg-white/10 hover:text-white" aria-label="Question précédente">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <button type="button" onClick={restart} className="rounded-full p-3 text-muted transition hover:bg-white/10 hover:text-white" aria-label="Recommencer">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Fil de la conversation : réponses déjà données */}
      {step > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {QUESTIONS.slice(0, step).map((q) =>
            answers[q.key] ? (
              <span key={q.key} className="rounded-full bg-white/[0.07] px-3 py-1 text-2xs text-subtle">
                {labelFor(q.key)}
              </span>
            ) : null,
          )}
        </div>
      )}

      {/* Progression */}
      <div className="mb-5 flex gap-1.5" aria-hidden="true">
        {QUESTIONS.map((q, i) => (
          <span key={q.key} className={cn("h-0.5 flex-1 rounded-full transition-colors duration-500", i < step ? "bg-gold" : "bg-white/15")} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!done ? (
          <m.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.28 }}>
            <p className="mb-4 text-base text-white/90">
              <span className="mr-2 text-xs text-gold">Q{step + 1}.</span>
              {QUESTIONS[step].title}
              {QUESTIONS[step].optional && <span className="ml-2 text-xs text-muted">(optionnel)</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {QUESTIONS[step].options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => choose(QUESTIONS[step].key, o.value)}
                  className={cn(
                    "min-h-11 rounded-full border px-4 py-2.5 text-xs transition",
                    answers[QUESTIONS[step].key] === o.value
                      ? "border-gold bg-gold/15 text-white"
                      : "border-white/15 bg-white/[0.03] text-white/80 hover:border-gold/60 hover:text-white",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </m.div>
        ) : (
          <m.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <p className="mb-4 text-sm text-subtle">
              {results.length > 1 ? `Nos ${results.length} recommandations pour vous :` : "Notre recommandation pour vous :"}
            </p>
            <ul className="space-y-3">
              {results.map(({ vehicle, reasons }) => (
                <li key={vehicle.id} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg">
                    <VehicleVisual vehicle={vehicle} sizes="112px" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <p className="text-2xs uppercase tracking-wide2 text-gold/90">{getCategory(vehicle.category).label}</p>
                      <p className="truncate font-display text-lg leading-tight">
                        {vehicle.brand} {vehicle.model}
                      </p>
                      <p className="truncate text-2xs text-muted">{reasons.join(" · ")}</p>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="nums text-sm">{formatPrice(vehicle.pricePerDay)}<span className="text-muted"> / j</span></span>
                      <Link href={vehicleHref(vehicle)} className="nums rounded-full bg-white px-3.5 py-2.5 text-2xs font-medium uppercase tracking-wide2 text-ink transition hover:bg-gold">
                        Voir ce véhicule
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <button type="button" onClick={restart} className="mt-4 text-xs text-muted underline-offset-4 hover:text-white hover:underline">
              Refaire le questionnaire
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
