export const SITE = {
  name: "PRESTIGE CONCIERGERIE",
  shortName: "Prestige Conciergerie",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.prestige-conciergerie.com").replace(/\/$/, ""),
  description:
    "PRESTIGE CONCIERGERIE — conciergerie automobile et location de véhicules, de la citadine économique à la supercar, en Belgique et dans le Nord de la France jusqu'à Paris.",
  whatsapp: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "32470000000").replace(/\D/g, ""),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@prestige-conciergerie.com",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+32 470 00 00 00",
  logo: "/logo/logo-prestige-conciergerie.png",
  areaServed: ["Belgique", "Hauts-de-France", "Île-de-France"],
} as const;

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${SITE.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function bookingMessage(opts: { vehicle: string; from?: string; to?: string; city?: string }) {
  return [
    `Bonjour ${SITE.name},`,
    `Je souhaiterais réserver ${opts.vehicle}.`,
    `📅 Du : ${opts.from || "[date]"} au ${opts.to || "[date]"}`,
    `📍 Ville : ${opts.city || "[ville]"}`,
    `Pouvez-vous me confirmer la disponibilité et le tarif final ?`,
  ].join("\n");
}

export const GENERIC_WHATSAPP_MESSAGE = `Bonjour ${SITE.name},\nJe souhaiterais des informations pour une location de véhicule.`;
