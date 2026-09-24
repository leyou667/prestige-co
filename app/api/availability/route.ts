import { NextResponse } from "next/server";
import { getBusyRanges, isCalendarConfigured, POLL_SECONDS, rangesOverlap } from "@/lib/google-calendar";
import { VEHICLES, getVehicleById } from "@/lib/vehicles";
import { parseISODate } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * GET /api/availability?vehicle=<id>          → périodes indisponibles d'un véhicule
 * GET /api/availability?from=YYYY-MM-DD&to=…  → identifiants des véhicules indisponibles sur la période
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const id = params.get("vehicle");
  const configured = isCalendarConfigured();
  const headers = { "Cache-Control": "no-store" };

  if (id) {
    const vehicle = getVehicleById(id);
    if (!vehicle) return NextResponse.json({ error: "Véhicule inconnu" }, { status: 404 });
    if (!configured) return NextResponse.json({ vehicle: vehicle.id, configured, busy: [], pollSeconds: POLL_SECONDS }, { headers });
    try {
      const busy = await getBusyRanges(vehicle.id);
      return NextResponse.json({ vehicle: vehicle.id, configured, busy, pollSeconds: POLL_SECONDS, updatedAt: new Date().toISOString() }, { headers });
    } catch (error) {
      console.error("[availability]", error);
      return NextResponse.json({ vehicle: vehicle.id, configured, busy: [], error: "Synchronisation indisponible" }, { status: 502 });
    }
  }

  const from = params.get("from");
  const to = params.get("to");
  if (!parseISODate(from) || !parseISODate(to)) return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  if (!configured) return NextResponse.json({ configured, unavailable: [] }, { headers });
  try {
    const range = { start: from!, end: to! };
    const results = await Promise.all(
      VEHICLES.map(async (v) => ((await getBusyRanges(v.id)).some((b) => rangesOverlap(b, range)) ? v.id : null)),
    );
    return NextResponse.json({ configured, unavailable: results.filter(Boolean) }, { headers });
  } catch (error) {
    console.error("[availability]", error);
    return NextResponse.json({ configured, unavailable: [], error: "Synchronisation indisponible" }, { status: 502 });
  }
}
