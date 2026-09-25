import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

/** Comparaison de secrets en temps constant (les hachages ont toujours la même longueur). */
export function safeEqual(a: string | null | undefined, b: string | null | undefined) {
  if (!a || !b) return false;
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/**
 * IP du client. Sur Vercel, `x-real-ip` / `x-vercel-forwarded-for` sont posés par la plateforme
 * (non falsifiables) ; `x-forwarded-for` n'est utilisé qu'en dernier recours.
 */
export function clientIp(request: Request) {
  const h = request.headers;
  return (
    h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    null
  );
}

/** Limiteur à fenêtre glissante, par instance. Complément d'une règle WAF / rate-limit partagé. */
export function createRateLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string) => {
    const now = Date.now();
    // Purge périodique pour éviter toute croissance mémoire
    if (hits.size > 5000) {
      for (const [k, list] of hits) if (!list.some((t) => now - t < windowMs)) hits.delete(k);
    }
    const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    list.push(now);
    hits.set(key, list);
    return list.length > max;
  };
}

/** Texte libre sur une seule ligne, sans caractères de contrôle, longueur bornée. */
export function cleanLine(value: unknown, max = 80) {
  if (typeof value !== "string") return undefined;
  const v = value.replace(/[\u0000-\u001F\u007F]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
  return v || undefined;
}

export const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i;
export const PHONE_RE = /^\+?[0-9 ().-]{6,20}$/;

/** Vérifie que la requête vient du site lui-même (quand le navigateur envoie Origin). */
export function sameOrigin(request: Request, siteUrl: string) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // clients sans Origin (curl, anciens navigateurs) : les autres garde-fous s'appliquent
  try {
    const o = new URL(origin);
    const allowed = [new URL(siteUrl).host, request.headers.get("host")].filter(Boolean);
    return allowed.includes(o.host);
  } catch {
    return false;
  }
}
