import Link from "next/link";
import { Logo } from "./logo";
import { CATEGORIES } from "@/lib/categories";
import { CITIES, citySeoSlug } from "@/lib/cities";
import { SITE, whatsappUrl, GENERIC_WHATSAPP_MESSAGE } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="site-footer" className="border-t border-white/5 bg-ink pb-24 pt-16 md:pb-10">
      <div className="container grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo className="w-28" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/55">
            Conciergerie automobile : location de véhicules, de la citadine économique à la supercar, livrés en Belgique et dans le
            Nord de la France jusqu&apos;à Paris.
          </p>
          <div className="mt-6 space-y-1 text-sm text-white/70">
            <a href={whatsappUrl(GENERIC_WHATSAPP_MESSAGE)} className="block hover:text-gold" target="_blank" rel="noopener noreferrer">
              WhatsApp · {SITE.phone}
            </a>
            <a href={`mailto:${SITE.email}`} className="block hover:text-gold">
              {SITE.email}
            </a>
          </div>
        </div>

        <nav aria-label="Catégories" className="md:col-span-2">
          <p className="eyebrow mb-4">Collection</p>
          <ul className="space-y-2 text-sm text-white/60">
            {CATEGORIES.map((c) => (
              <li key={c.code}>
                <Link href={`/${c.seoSlug}`} className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Villes desservies" className="md:col-span-4">
          <p className="eyebrow mb-4">Villes desservies</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-white/60 sm:grid-cols-3">
            {CITIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/${citySeoSlug(c)}`} className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Informations" className="md:col-span-2">
          <p className="eyebrow mb-4">Maison</p>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link href="/services" className="hover:text-white">Services</Link></li>
            <li><Link href="/a-propos" className="hover:text-white">À propos</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/devis" className="hover:text-white">Demander un devis</Link></li>
            <li><Link href="/conditions-generales" className="hover:text-white">Conditions générales</Link></li>
          </ul>
        </nav>
      </div>
      <div className="container mt-14 flex flex-col gap-2 border-t border-white/5 pt-6 text-xs text-white/35 sm:flex-row sm:justify-between">
        <p>© {year} {SITE.name}. Tous droits réservés.</p>
        <p className="title-luxe text-[0.6rem]">Belgique · Hauts-de-France · Paris</p>
      </div>
    </footer>
  );
}
