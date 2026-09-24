import { NextResponse } from "next/server";
import { isCalendarConfigured, registerWatchChannels } from "@/lib/google-calendar";

export const dynamic = "force-dynamic";

/**
 * Enregistre les canaux de push notifications Google Calendar.
 * À appeler une fois après déploiement puis périodiquement (les canaux expirent, ~7 jours),
 * par exemple via un cron : GET /api/calendar-watch avec l'en-tête Authorization: Bearer <ADMIN_SECRET>.
 */
export async function GET(request: Request) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!isCalendarConfigured()) return NextResponse.json({ error: "Google Calendar non configuré" }, { status: 400 });
  return NextResponse.json({ channels: await registerWatchChannels() });
}
