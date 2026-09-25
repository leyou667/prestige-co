import Link from "next/link";
import { Logo } from "./logo";
import { CATEGORIES } from "@/lib/categories";
import { CITIES, citySeoSlug } from "@/lib/cities";
import { MAIN_NAV, SECONDARY_NAV } from "@/lib/navigation";
import { SITE, whatsappUrl, GENERIC_WHATSAPP_MESSAGE } from "@/lib/site";

// Liens nombreux : pas de préchargement automatique (évite des dizaines de requêtes inutiles)
const linkCls = "inline-block py-1.5 text-subtle transition hover:text-white";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="site-footer" className="border-t border-white/5 bg-ink pb-28 pt-16 md:pb-10">
      <div className="container grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo className="w-28" sizes="112px" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted">
            Conciergerie automobile : location de véhicules, de la citadine économique à la supercar, livrés en Belgique et dans le
            Nord de la France jusqu&apos;à Paris.
          </p>
          <div className="mt-6 flex flex-col items-start text-sm">
            <a href={whatsappUrl(GENERIC_WHATSAPP_MESSAGE)} className={linkCls} target="_blank" rel="noopener noreferrer">
              WhatsApp · <span className="nums">{SITE.phone}</span>
            </a>
            <a href={`mailto:${SITE.email}`} className={linkCls}>
              {SITE.email}
            </a>
          </div>
        </div>

        <nav aria-label="Catégories" className="md:col-span-2">
          <p className="eyebrow mb-3">Collection</p>
          <ul className="text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.code}>
                <Link href={`/${c.seoSlug}`} prefetch={false} className={linkCls}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Villes desservies" className="md:col-span-4">
          <p className="eyebrow mb-3">Villes desservies</p>
          <ul className="grid grid-cols-2 gap-x-4 text-sm sm:grid-cols-3">
            {CITIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/${citySeoSlug(c)}`} prefetch={false} className={linkCls}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Informations" className="md:col-span-2">
          <p className="eyebrow mb-3">Maison</p>
          <ul className="text-sm">
            {[...MAIN_NAV.slice(1), ...SECONDARY_NAV].map((item) => (
              <li key={item.href}>
                <Link href={item.href} prefetch={false} className={linkCls}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="container mt-14">
        <div className="flex flex-col gap-2 border-t border-white/5 pt-6 text-xs text-muted sm:flex-row sm:justify-between">
          <p>
            © {year} {SITE.name}. Tous droits réservés.
          </p>
          <p className="title-luxe text-2xs">Belgique · Hauts-de-France · Paris</p>
        </div>
      </div>
    </footer>
  );
}
