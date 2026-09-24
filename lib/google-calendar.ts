import "server-only";
import { SITE } from "./site";
import { VEHICLES, getVehicleById, vehicleName } from "./vehicles";
import { parseISODate, toISODate } from "./utils";

/**
 * Intégration Google Calendar API v3 (OAuth2, refresh token du compte dédié PRESTIGE CONCIERGERIE).
 *
 * Isolation des disponibilités :
 *  - soit un calendrier par véhicule (GOOGLE_CALENDAR_MAP),
 *  - soit un calendrier commun où chaque événement porte le tag privé `vehicle=<id>`
 *    (extendedProperties.private.vehicle). Un événement créé à la main dans Google Calendar
 *    peut aussi être rattaché via son titre en le préfixant par `[<id>]`, ex. "[porsche-taycan] Client X".
 *
 * Synchro :
 *  - site → Google : POST /api/reservations crée un événement (statut "tentative").
 *  - Google → site : push notifications (events.watch) sur /api/calendar-webhook qui invalide
 *    le cache "calendar". Fallback : le cache expire toutes les 4 minutes (polling) et le
 *    calendrier côté client se rafraîchit à la même fréquence.
 */

export const CALENDAR_CACHE_TAG = "calendar";
export const POLL_SECONDS = 240;

const API = "https://www.googleapis.com/calendar/v3";

export function isCalendarConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN);
}

function calendarMap(): Record<string, string> {
  try {
    return process.env.GOOGLE_CALENDAR_MAP ? JSON.parse(process.env.GOOGLE_CALENDAR_MAP) : {};
  } catch {
    console.error("[calendar] GOOGLE_CALENDAR_MAP n'est pas un JSON valide");
    return {};
  }
}

const defaultCalendar = () => process.env.GOOGLE_CALENDAR_ID || "primary";

export function calendarIdFor(vehicleId: string) {
  return calendarMap()[vehicleId] || defaultCalendar();
}

/** Tous les calendriers à surveiller (dédoublonnés) */
export function allCalendarIds() {
  return Array.from(new Set(VEHICLES.map((v) => calendarIdFor(v.id))));
}

let tokenCache: { token: string; expiresAt: number } | null = null;

async function accessToken() {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`OAuth2 Google : ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

interface GEvent {
  id: string;
  status?: string;
  summary?: string;
  transparency?: string;
  start: { date?: string; dateTime?: string };
  end: { date?: string; dateTime?: string };
  extendedProperties?: { private?: Record<string, string> };
}

async function listEvents(calendarId: string): Promise<GEvent[]> {
  const token = await accessToken();
  const now = new Date();
  const timeMin = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const timeMax = new Date(now.getFullYear() + 1, now.getMonth() + 1, 1).toISOString();
  const events: GEvent[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({ singleEvents: "true", orderBy: "startTime", maxResults: "2500", timeMin, timeMax });
    if (pageToken) params.set("pageToken", pageToken);
    const res = await fetch(`${API}/calendars/${encodeURIComponent(calendarId)}/events?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      // Cache partagé, invalidé par le webhook ; expire de toute façon toutes les 4 min (fallback polling)
      next: { revalidate: POLL_SECONDS, tags: [CALENDAR_CACHE_TAG] },
    });
    if (!res.ok) throw new Error(`Google Calendar : ${res.status} ${await res.text()}`);
    const json = (await res.json()) as { items?: GEvent[]; nextPageToken?: string };
    events.push(...(json.items ?? []));
    pageToken = json.nextPageToken;
  } while (pageToken);
  return events;
}

export interface BusyRange {
  /** Premier jour indisponible (inclus), YYYY-MM-DD */
  start: string;
  /** Dernier jour indisponible (inclus), YYYY-MM-DD */
  end: string;
}

function eventVehicle(e: GEvent) {
  const tag = e.extendedProperties?.private?.vehicle;
  if (tag) return tag;
  const m = e.summary?.match(/^\s*\[([a-z0-9-]+)\]/i);
  return m?.[1].toLowerCase();
}

function toRange(e: GEvent): BusyRange | null {
  const start = e.start.date ?? (e.start.dateTime ? toISODate(new Date(e.start.dateTime)) : null);
  let end: string | null = null;
  if (e.end.date) {
    // Les dates de fin "journée entière" sont exclusives chez Google
    const d = parseISODate(e.end.date)!;
    d.setDate(d.getDate() - 1);
    end = toISODate(d);
  } else if (e.end.dateTime) {
    end = toISODate(new Date(e.end.dateTime));
  }
  if (!start || !end) return null;
  return { start, end: end < start ? start : end };
}

export async function getBusyRanges(vehicleId: string): Promise<BusyRange[]> {
  const calendarId = calendarIdFor(vehicleId);
  const dedicated = calendarId !== defaultCalendar() || Boolean(calendarMap()[vehicleId]);
  const events = await listEvents(calendarId);
  return events
    .filter((e) => e.status !== "cancelled" && e.transparency !== "transparent")
    .filter((e) => (dedicated ? true : eventVehicle(e) === vehicleId))
    .map(toRange)
    .filter((r): r is BusyRange => r !== null);
}

export interface ReservationInput {
  vehicleId: string;
  from: string;
  to: string;
  city: string;
  options: string[];
  estimate: number;
  name?: string;
  phone?: string;
  email?: string;
}

export async function createReservationEvent(input: ReservationInput) {
  const vehicle = getVehicleById(input.vehicleId);
  if (!vehicle) throw new Error("Véhicule inconnu");
  const end = parseISODate(input.to)!;
  end.setDate(end.getDate() + 1); // fin exclusive : le jour de retour reste bloqué
  const token = await accessToken();
  const body = {
    summary: `[${vehicle.id}] Demande — ${vehicleName(vehicle)}${input.name ? ` — ${input.name}` : ""}`,
    description: [
      `Demande de réservation reçue via le site ${SITE.name}.`,
      `Véhicule : ${vehicleName(vehicle)}${vehicle.variant ? ` (${vehicle.variant})` : ""}`,
      `Ville : ${input.city}`,
      `Du ${input.from} au ${input.to}`,
      `Options : ${input.options.length ? input.options.join(", ") : "aucune"}`,
      `Estimation : ${input.estimate} € (hors caution)`,
      input.name ? `Client : ${input.name}` : null,
      input.phone ? `Téléphone : ${input.phone}` : null,
      input.email ? `E-mail : ${input.email}` : null,
      "",
      "Statut : à confirmer. Supprimez cet événement pour libérer le véhicule sur le site.",
    ]
      .filter((l) => l !== null)
      .join("\n"),
    location: input.city,
    start: { date: input.from },
    end: { date: toISODate(end) },
    status: "tentative",
    colorId: "5",
    extendedProperties: { private: { vehicle: vehicle.id, source: "site" } },
  };
  const res = await fetch(`${API}/calendars/${encodeURIComponent(calendarIdFor(vehicle.id))}/events`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Création d'événement : ${res.status} ${await res.text()}`);
  return (await res.json()) as { id: string; htmlLink: string };
}

/** Enregistre (ou renouvelle) un canal de push notifications pour chaque calendrier utilisé. */
export async function registerWatchChannels() {
  const token = await accessToken();
  const address = `${SITE.url}/api/calendar-webhook`;
  const results = [];
  for (const calendarId of allCalendarIds()) {
    const res = await fetch(`${API}/calendars/${encodeURIComponent(calendarId)}/events/watch`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        type: "web_hook",
        address,
        token: process.env.GOOGLE_WEBHOOK_TOKEN,
        params: { ttl: String(7 * 24 * 3600) },
      }),
      cache: "no-store",
    });
    results.push({ calendarId, ok: res.ok, response: await res.json().catch(() => null) });
  }
  return results;
}

export function rangesOverlap(a: BusyRange, b: BusyRange) {
  return a.start <= b.end && b.start <= a.end;
}
