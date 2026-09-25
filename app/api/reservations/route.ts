import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { CALENDAR_CACHE_TAG, createReservationEvent, getBusyRanges, isCalendarConfigured } from "@/lib/google-calendar";
import { BOOKING_HORIZON_DAYS, MAX_RENTAL_DAYS, rangesOverlap } from "@/lib/availability";
import { EMAIL_RE, PHONE_RE, cleanLine, clientIp, createRateLimiter, sameOrigin } from "@/lib/security";
import { computeQuote, isKnownOption } from "@/lib/quote";
import { getVehicleById, vehicleName } from "@/lib/vehicles";
import { getCity } from "@/lib/cities";
import { SITE } from "@/lib/site";
import { addDays, parseISODate, rentalDays, toISODate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 10_000;
/** Délai minimal entre l'affichage du formulaire et l'envoi (les robots envoient instantanément). */
const MIN_FILL_MS = 3_000;

// Garde-fou par instance (5 demandes / 10 min / IP). À compléter par une règle WAF Vercel
// sur /api/reservations pour une limite partagée entre instances.
const isRateLimited = createRateLimiter(5, 10 * 60_000);

const bad = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function POST(request: Request) {
  // 1. Forme de la requête : JSON uniquement (force un preflight CORS), même origine, taille bornée
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return bad("Content-Type non supporté", 415);
  if (!sameOrigin(request, SITE.url)) return bad("Origine non autorisée", 403);
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return bad("Requête trop volumineuse", 413);

  const ip = clientIp(request);
  if (ip && isRateLimited(ip)) return bad("Trop de demandes, réessayez plus tard.", 429);

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return bad("Requête trop volumineuse", 413);
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return bad("Requête invalide");
    body = parsed as Record<string, unknown>;
  } catch {
    return bad("Requête invalide");
  }

  // 2. Anti-robots : champ piège invisible + délai minimal de remplissage
  if (typeof body.website === "string" && body.website.trim() !== "") return NextResponse.json({ ok: true, synced: false });
  const startedAt = Number(body.startedAt);
  if (Number.isFinite(startedAt) && Date.now() - startedAt < MIN_FILL_MS) return NextResponse.json({ ok: true, synced: false });

  // 3. Validation stricte
  const vehicle = getVehicleById(typeof body.vehicleId === "string" ? body.vehicleId : undefined);
  const city = getCity(typeof body.city === "string" ? body.city : undefined);
  const fromStr = typeof body.from === "string" ? body.from : undefined;
  const toStr = typeof body.to === "string" ? body.to : undefined;
  const from = parseISODate(fromStr);
  const to = parseISODate(toStr);
  const today = parseISODate(toISODate(new Date()))!;
  const horizon = addDays(today, BOOKING_HORIZON_DAYS);

  if (body.acceptedTerms !== true) return bad("Conditions générales non acceptées");
  if (!vehicle || !city) return bad("Véhicule ou ville invalide");
  if (!vehicle.cities.includes(city.name)) return bad("Ce véhicule n'est pas livrable dans cette ville");
  if (!from || !to || to < from || from < today || to > horizon) return bad("Dates invalides");
  const days = rentalDays(fromStr!, toStr!);
  if (days > MAX_RENTAL_DAYS) return bad(`Durée maximale en ligne : ${MAX_RENTAL_DAYS} jours. Contactez-nous pour une location longue durée.`);

  const optionIds = Array.isArray(body.options) ? body.options.filter((o): o is string => typeof o === "string" && isKnownOption(o)).slice(0, 10) : [];
  const name = cleanLine(body.name, 80);
  const phone = cleanLine(body.phone, 30);
  const email = cleanLine(body.email, 120);
  if (phone && !PHONE_RE.test(phone)) return bad("Téléphone invalide");
  if (email && !EMAIL_RE.test(email)) return bad("E-mail invalide");

  if (!isCalendarConfigured()) {
    return NextResponse.json({ ok: true, synced: false, message: "Google Calendar non configuré — demande transmise via WhatsApp uniquement." });
  }

  // 4. Prix recalculé côté serveur : l'estimation envoyée par le navigateur est ignorée
  const quote = computeQuote(vehicle, days, optionIds);
  const range = { start: toISODate(from), end: toISODate(to) };

  try {
    const busy = await getBusyRanges(vehicle.id);
    if (busy.some((b) => rangesOverlap(b, range))) {
      return NextResponse.json({ ok: false, conflict: true, error: "Ce véhicule n'est pas disponible sur ces dates." }, { status: 409 });
    }
    const event = await createReservationEvent({
      vehicleId: vehicle.id,
      from: range.start,
      to: range.end,
      city: city.name,
      options: quote.options.map((o) => o.label),
      estimate: quote.total,
      name,
      phone,
      email,
    });
    revalidateTag(CALENDAR_CACHE_TAG, { expire: 0 });
    return NextResponse.json({ ok: true, synced: true, eventId: event.id, vehicle: vehicleName(vehicle, "full") });
  } catch (error) {
    console.error("[reservations]", error);
    return bad("Synchronisation Google Calendar indisponible", 502);
  }
}
