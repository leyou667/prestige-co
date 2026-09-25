import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { WhatsAppIcon } from "@/components/icons";
import { GENERIC_WHATSAPP_MESSAGE, SITE, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez PRESTIGE CONCIERGERIE sur WhatsApp, par téléphone ou par e-mail pour réserver votre véhicule en Belgique, dans le Nord de la France ou à Paris.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const items = [
    { icon: WhatsAppIcon, label: "WhatsApp", value: "Réponse rapide 7j/7", href: whatsappUrl(GENERIC_WHATSAPP_MESSAGE), external: true },
    { icon: Phone, label: "Téléphone", value: SITE.phone, href: `tel:${SITE.phone.replace(/\s/g, "")}` },
    { icon: Mail, label: "E-mail", value: SITE.email, href: `mailto:${SITE.email}` },
    { icon: MapPin, label: "Zone d'intervention", value: "Belgique · Hauts-de-France · Paris", href: "/vehicules" },
  ];
  return (
    <div className="container page-top pb-24">
      <SectionHeading as="h1" eyebrow="Contact" title="Parlons de votre prochaine route.">
        Une question, une demande particulière, un événement à préparer ? Un conseiller PRESTIGE CONCIERGERIE vous répond.
      </SectionHeading>
      <ul className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/5 bg-white/5 sm:grid-cols-2">
        {items.map(({ icon: Icon, label, value, href, external }) => (
          <li key={label}>
            <Link
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group flex h-full items-start gap-5 bg-anthracite p-8 transition hover:bg-graphite"
            >
              <Icon className="mt-1 h-5 w-5 text-gold/80" />
              <span>
                <span className="block text-2xs uppercase tracking-luxe text-muted">{label}</span>
                <span className="mt-2 block font-display text-2xl group-hover:text-gold">{value}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <Link href="/devis" className="btn-gold">Demander un devis</Link>
        <Link href="/#conseiller" className="btn-ghost">Consulter le conseiller IA</Link>
      </div>
    </div>
  );
}
