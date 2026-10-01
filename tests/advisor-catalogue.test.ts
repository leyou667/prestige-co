import { describe, expect, it } from "vitest";
import { recommend } from "@/lib/advisor";
import { DEFAULT_FILTERS, countActiveFilters, filterVehicles } from "@/lib/catalogue";
import { VEHICLES } from "@/lib/vehicles";

describe("conseiller IA (déterministe)", () => {
  it("ne propose que des utilitaires pour des marchandises", () => {
    const r = recommend({ usage: "pro", passengers: "utilitaire", budget: "lt50" });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((s) => s.vehicle.category === "U")).toBe(true);
  });

  it("respecte le budget maximum", () => {
    const r = recommend({ usage: "quotidien", passengers: "1-2", budget: "lt50", style: "eco" });
    expect(r.every((s) => s.vehicle.pricePerDay <= 50)).toBe(true);
  });

  it("met la supercar en tête pour un événement à gros budget", () => {
    const r = recommend({ usage: "evenement", passengers: "1-2", budget: "300+", style: "sport" });
    expect(r[0].vehicle.id).toBe("porsche-taycan");
  });

  it("propose toujours au moins un véhicule et au plus trois, sans doublon de modèle", () => {
    const r = recommend({ usage: "voyage", passengers: "5+", budget: "lt50" });
    expect(r.length).toBeGreaterThanOrEqual(1);
    expect(r.length).toBeLessThanOrEqual(3);
    expect(new Set(r.map((s) => `${s.vehicle.brand} ${s.vehicle.model}`)).size).toBe(r.length);
  });
});

describe("filtres du catalogue", () => {
  it("sans filtre, renvoie toute la flotte triée par prix", () => {
    const r = filterVehicles(DEFAULT_FILTERS, "price-asc", new Set());
    expect(r).toHaveLength(VEHICLES.length);
    expect(r[0].pricePerDay).toBeLessThanOrEqual(r[r.length - 1].pricePerDay);
    expect(countActiveFilters(DEFAULT_FILTERS)).toBe(0);
  });

  it("filtre par ville et catégorie", () => {
    const r = filterVehicles({ ...DEFAULT_FILTERS, city: "paris", categories: ["S+"] }, "price-asc", new Set());
    expect(r.map((v) => v.id)).toEqual(["porsche-taycan"]);
  });

  it("place les véhicules indisponibles en fin de liste", () => {
    const r = filterVehicles(DEFAULT_FILTERS, "price-asc", new Set(["renault-twingo"]));
    expect(r[r.length - 1].id).toBe("renault-twingo");
  });
});
