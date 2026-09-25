"use client";

import * as React from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

/** Case obligatoire « J'ai lu et accepté les conditions générales » avec message d'erreur accessible. */
export function TermsCheckbox({
  checked,
  onChange,
  error,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Affiche le message d'erreur (ex. après une tentative d'envoi sans cocher) */
  error?: boolean;
  className?: string;
}) {
  const id = React.useId();
  return (
    <div className={className}>
      <div className="flex items-start gap-3 text-sm text-subtle">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(v) => onChange(v === true)}
          aria-required="true"
          aria-invalid={error || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5"
        />
        <label htmlFor={id} className="cursor-pointer">
          J&apos;ai lu et accepté les{" "}
          <Link href="/conditions-generales" target="_blank" className="text-gold underline-offset-4 hover:underline">
            conditions générales
          </Link>
          <span className="text-gold"> *</span>
        </label>
      </div>
      <p id={`${id}-error`} role="alert" className={cn("mt-2 text-xs text-red-300", !error && "sr-only")}>
        {error ? "Veuillez accepter les conditions générales pour continuer." : ""}
      </p>
    </div>
  );
}
