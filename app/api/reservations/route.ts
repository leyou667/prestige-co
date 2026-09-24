import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import {
  CALENDAR_CACHE_TAG,
  createReservationEvent,
  getBusyRanges,
  isCalendarConfigured,
  rangesOverlap,
} from "@/lib/google-calendar";
import { getVehicleById } from "@/lib/vehicles";
import { getCity } from "@/lib/cities";
import { parseISODate, toISODate } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Anti-abus minimal (par instance) : 5 demandes / 10 min / IP
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 5;
}

const clean = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) return NextResponse.json({ error: "Trop de demandes, réessayez plus tard." }, { status: 429 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  const vehicle = getVehicleById(clean(body.vehicleId));
  const city = getCity(clean(body.city));
  const from = parseISODate(clean(body.from));
  const to = parseISODate(clean(body.to));
  const today = parseISODate(toISODate(new Date()))!;

  if (!vehicle || !city || !from || !to || to < from || from < today || body.acceptedTerms !== true) {
    return NextResponse.json({ error: "Données de réservation invalides" }, { status: 400 });
  }
  const range = { start: toISODate(from), end: toISODate(to) };

  if (!isCalendarConfigured()) {
    return NextResponse.json({ ok: true, synced: false, message: "Google Calendar non configuré — demande transmise via WhatsApp uniquement." });
  }

  try {
    const busy = await getBusyRanges(vehicle.id);
    if (busy.some((b) => rangesOverlap(b, range))) {
      return NextResponse.json({ ok: false, conflict: true, error: "Ce véhicule n'est pas disponible sur ces dates." }, { status: 409 });
    }
    const options = Array.isArray(body.options) ? body.options.map((o) => clean(o, 60)).filter(Boolean) as string[] : [];
    const event = await createReservationEvent({
      vehicleId: vehicle.id,
      from: range.start,
      to: range.end,
      city: city.name,
      options: options.slice(0, 10),
      estimate: Math.max(0, Math.round(Number(body.estimate) || 0)),
      name: clean(body.name),
      phone: clean(body.phone, 40),
      email: clean(body.email),
    });
    revalidateTag(CALENDAR_CACHE_TAG, { expire: 0 });
    return NextResponse.json({ ok: true, synced: true, eventId: event.id });
  } catch (error) {
    console.error("[reservations]", error);
    return NextResponse.json({ ok: false, error: "Synchronisation Google Calendar indisponible" }, { status: 502 });
  }
}
