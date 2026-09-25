"use client";

import * as React from "react";
import { BOOKING_HORIZON_DAYS } from "@/lib/availability";
import { addDays, parseISODate, toISODate, todayISO } from "@/lib/utils";

type RenderField = (props: { id: string; label: string; input: React.ReactNode }) => React.ReactNode;

const defaultRender: RenderField = ({ id, label, input }) => (
  <div>
    <label htmlFor={id} className="label mb-1.5 block">
      {label}
    </label>
    {input}
  </div>
);

/**
 * Paire départ / retour avec une règle unique :
 * départ ≥ aujourd'hui, retour ≥ départ, et horizon de réservation borné.
 */
export function DateRangeFields({
  from,
  to,
  onChange,
  inputClassName = "field",
  renderField = defaultRender,
  labels = ["Départ", "Retour"],
}: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  inputClassName?: string;
  renderField?: RenderField;
  labels?: [string, string];
}) {
  const id = React.useId();
  const today = todayISO();
  const max = toISODate(addDays(parseISODate(today)!, BOOKING_HORIZON_DAYS));

  return (
    <>
      {renderField({
        id: `${id}-from`,
        label: labels[0],
        input: (
          <input
            id={`${id}-from`}
            type="date"
            min={today}
            max={max}
            value={from}
            onChange={(e) => {
              const f = e.target.value;
              onChange(f, to && f > to ? f : to);
            }}
            className={inputClassName}
          />
        ),
      })}
      {renderField({
        id: `${id}-to`,
        label: labels[1],
        input: (
          <input
            id={`${id}-to`}
            type="date"
            min={from || today}
            max={max}
            value={to}
            onChange={(e) => onChange(from, e.target.value)}
            className={inputClassName}
          />
        ),
      })}
    </>
  );
}
