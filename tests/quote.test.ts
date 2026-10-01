import { describe, expect, it } from "vitest";
import { computeQuote, isKnownOption, quoteNumber } from "@/lib/quote";
import { getVehicleById } from "@/lib/vehicles";

describe("devis", () => {
  const yaris = getVehicleById("toyota-yaris")!;
  const taycan = getVehicleById("porsche-taycan")!;

  it("calcule location × durée + options", () => {
    const q = computeQuote(yaris, 3, ["conducteur", "livraison"]);
    expect(q.rental).toBe(yaris.pricePerDay * 3);
    expect(q.options.find((o) => o.id === "conducteur")!.amount).toBe(30); // 10 €/j × 3
    expect(q.options.find((o) => o.id === "livraison")!.amount).toBe(49); // forfait
    expect(q.total).toBe(q.rental + 30 + 49);
  });

  it("applique les tarifs premium aux catégories S / S+", () => {
    const q = computeQuote(taycan, 2, ["livraison"]);
    expect(q.options[0].amount).toBe(99);
  });

  it("ignore les options inconnues et signale les options sur devis", () => {
    const q = computeQuote(yaris, 1, ["inconnue", "chauffeur"]);
    expect(q.options).toHaveLength(1);
    expect(q.options[0].onQuote).toBe(true);
    expect(isKnownOption("inconnue")).toBe(false);
  });

  it("produit un numéro de devis stable", () => {
    const d = new Date(2026, 9, 1);
    expect(quoteNumber("abc", d)).toBe(quoteNumber("abc", d));
    expect(quoteNumber("abc", d)).toMatch(/^PC-20261001-\d{4}$/);
  });
});
