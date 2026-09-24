import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const DAY = 24 * 60 * 60 * 1000;

/** Parse "YYYY-MM-DD" as a local calendar date (no timezone drift). */
export function parseISODate(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Number of rental days between two ISO dates (minimum 1). */
export function rentalDays(from: string, to: string) {
  const a = parseISODate(from);
  const b = parseISODate(to);
  if (!a || !b) return 0;
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / DAY));
}

export function formatDateFr(value: string) {
  const d = parseISODate(value);
  if (!d) return value;
  return new Intl.DateTimeFormat("fr-BE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
}
