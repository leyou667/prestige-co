import { NextResponse } from "next/server";
import { isCalendarConfigured, registerWatchChannels } from "@/lib/google-calendar";
import { safeEqual } from "@/lib/security";

export const dynamic = "force-dynamic";

/**
 * Enregistre les canaux de push notifications Google Calendar.
 * À appeler une fois après déploiement puis périodiquement (les canaux expirent, ~7 jours),
 * par exemple via un cron : GET /api/calendar-watch avec l'en-tête Authorization: Bearer <ADMIN_SECRET>.
 */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!safeEqual(provided, process.env.ADMIN_SECRET)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!isCalendarConfigured()) return NextResponse.json({ error: "Google Calendar non configuré" }, { status: 400 });
  return NextResponse.json({ channels: await registerWatchChannels() });
}
