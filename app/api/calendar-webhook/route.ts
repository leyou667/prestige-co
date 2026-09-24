import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { CALENDAR_CACHE_TAG } from "@/lib/google-calendar";

export const dynamic = "force-dynamic";

/**
 * Point d'entrée des push notifications Google Calendar (events.watch).
 * Google n'envoie pas le contenu de l'événement, seulement un signal de changement :
 * on invalide le cache des disponibilités, la prochaine lecture reflète l'état réel
 * (ex. un événement supprimé côté Google Calendar libère immédiatement le véhicule).
 */
export async function POST(request: Request) {
  const expected = process.env.GOOGLE_WEBHOOK_TOKEN;
  const token = request.headers.get("x-goog-channel-token");
  if (expected && token !== expected) {
    return NextResponse.json({ error: "Jeton invalide" }, { status: 401 });
  }
  const state = request.headers.get("x-goog-resource-state");
  // "sync" = message initial à l'ouverture du canal ; "exists"/"not_exists" = changement
  if (state !== "sync") revalidateTag(CALENDAR_CACHE_TAG, { expire: 0 });
  return new NextResponse(null, { status: 204 });
}
