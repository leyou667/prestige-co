/** Types et règles de disponibilité partagés entre serveur (Google Calendar) et client (calendrier). */

export interface BusyRange {
  /** Premier jour indisponible (inclus), YYYY-MM-DD */
  start: string;
  /** Dernier jour indisponible (inclus), YYYY-MM-DD */
  end: string;
}

export function rangesOverlap(a: BusyRange, b: BusyRange) {
  return a.start <= b.end && b.start <= a.end;
}

export function isDayBusy(busy: BusyRange[], iso: string) {
  return busy.some((b) => iso >= b.start && iso <= b.end);
}

/** Durée maximale d'une demande en ligne et horizon de réservation (garde-fous anti-abus). */
export const MAX_RENTAL_DAYS = 60;
export const BOOKING_HORIZON_DAYS = 365;
