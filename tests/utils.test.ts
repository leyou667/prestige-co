import { describe, expect, it } from "vitest";
import { addDays, parseISODate, rentalDays, sanitizeRange, toISODate, todayISO } from "@/lib/utils";
import { rangesOverlap } from "@/lib/availability";

describe("dates", () => {
  it("refuse les dates impossibles ou mal formées", () => {
    expect(parseISODate("2027-02-30")).toBeNull();
    expect(parseISODate("2026-13-01")).toBeNull();
    expect(parseISODate("01/10/2026")).toBeNull();
    expect(parseISODate("")).toBeNull();
    expect(parseISODate(undefined)).toBeNull();
    expect(toISODate(parseISODate("2028-02-29")!)).toBe("2028-02-29");
  });

  it("compte les jours de location (minimum 1)", () => {
    expect(rentalDays("2026-10-10", "2026-10-13")).toBe(3);
    expect(rentalDays("2026-10-10", "2026-10-10")).toBe(1);
    expect(rentalDays("x", "2026-10-10")).toBe(0);
  });

  it("nettoie les paramètres d'URL ?du=&au=", () => {
    const today = todayISO();
    const tomorrow = toISODate(addDays(parseISODate(today)!, 1));
    expect(sanitizeRange("2000-01-01", tomorrow)).toEqual({ from: "", to: "" });
    expect(sanitizeRange(tomorrow, today)).toEqual({ from: tomorrow, to: "" });
    expect(sanitizeRange(today, tomorrow)).toEqual({ from: today, to: tomorrow });
  });

  it("détecte les chevauchements de périodes", () => {
    expect(rangesOverlap({ start: "2026-10-01", end: "2026-10-05" }, { start: "2026-10-05", end: "2026-10-07" })).toBe(true);
    expect(rangesOverlap({ start: "2026-10-01", end: "2026-10-04" }, { start: "2026-10-05", end: "2026-10-07" })).toBe(false);
  });
});
