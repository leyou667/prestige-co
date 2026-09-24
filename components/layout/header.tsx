"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { SlideTabs } from "@/components/ui/slide-tabs";
import { WhatsAppIcon } from "@/components/icons";
import { GENERIC_WHATSAPP_MESSAGE, whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Accueil", href: "/" },
  { label: "Services", href: "/services" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => setMenuOpen(false), [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const activeIndex = TABS.findIndex((t) => (t.href === "/" ? pathname === "/" : pathname.startsWith(t.href)));

  return (
    <header
      id="site-header"
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled || menuOpen ? "border-b border-white/5 bg-ink/85 backdrop-blur-xl" : "bg-gradient-to-b from-black/70 to-transparent",
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4 md:h-20">
        <Logo className="w-[74px] md:w-[92px]" priority />

        <nav aria-label="Navigation principale" className="absolute left-1/2 hidden -translate-x-1/2 md:block">
          <SlideTabs tabs={TABS} activeIndex={activeIndex} />
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/vehicules" className="btn-gold hidden !px-5 !py-2.5 md:inline-flex">
            Réserver
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-menu"
            aria-label="Navigation mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col bg-ink px-6 pb-10 pt-8 md:hidden"
          >
            <ul className="flex flex-col gap-1">
              {[...TABS, { label: "Collection", href: "/vehicules" }, { label: "Devis", href: "/devis" }].map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className={cn(
                      "block border-b border-white/5 py-4 text-sm uppercase tracking-luxe",
                      pathname === t.href ? "text-gold" : "text-white/85",
                    )}
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col gap-3">
              <Link href="/vehicules" className="btn-gold w-full !py-4">
                Réserver
              </Link>
              <a href={whatsappUrl(GENERIC_WHATSAPP_MESSAGE)} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full !py-4">
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
