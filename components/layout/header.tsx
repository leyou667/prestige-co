"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { SlideTabs } from "./slide-tabs";
import { WhatsAppIcon } from "@/components/icons";
import { GENERIC_WHATSAPP_MESSAGE, whatsappUrl } from "@/lib/site";
import { MAIN_NAV, SECONDARY_NAV, isActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";

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

  // Blocage du défilement fiable (iOS compris) pendant que le menu est ouvert
  React.useEffect(() => {
    const els = [document.documentElement, document.body];
    els.forEach((el) => (el.style.overflow = menuOpen ? "hidden" : ""));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    if (menuOpen) window.addEventListener("keydown", onKey);
    return () => {
      els.forEach((el) => (el.style.overflow = ""));
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const activeIndex = MAIN_NAV.findIndex((item) => isActive(item, pathname));

  return (
    <>
      <header
        id="site-header"
        className={cn(
          "sticky top-0 z-50 h-[var(--header-h)] transition-colors duration-500",
          scrolled || menuOpen ? "bg-ink/95 shadow-[0_1px_0_rgba(255,255,255,0.06)]" : "bg-gradient-to-b from-black/70 to-transparent",
        )}
      >
        <div className="container relative flex h-full items-center justify-between gap-4">
          <Logo className="w-[74px] md:w-[92px]" sizes="92px" priority />

          <nav aria-label="Navigation principale" className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
            <SlideTabs tabs={MAIN_NAV} activeIndex={activeIndex} />
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/vehicules" className="btn-gold hidden !min-h-10 !px-5 !py-2.5 md:inline-flex">
              Réserver
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white lg:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Panneau hors du <header> : il se positionne par rapport à l'écran, pas au header */}
      <nav
        id="mobile-menu"
        aria-label="Navigation mobile"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        className={cn(
          "fixed inset-x-0 top-[var(--header-h)] z-40 flex h-[calc(100dvh-var(--header-h))] flex-col overflow-y-auto overscroll-contain bg-ink px-6 pb-10 pt-6 transition duration-300 lg:hidden",
          menuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
        )}
      >
        <ul className="flex flex-col">
          {[...MAIN_NAV, ...SECONDARY_NAV].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item, pathname) ? "page" : undefined}
                className={cn(
                  "block border-b border-white/5 py-4 text-sm uppercase tracking-luxe",
                  isActive(item, pathname) ? "text-gold" : "text-white/85",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-col gap-3 pt-8">
          <Link href="/vehicules" className="btn-gold w-full !py-4">
            Réserver
          </Link>
          <a href={whatsappUrl(GENERIC_WHATSAPP_MESSAGE)} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full !py-4">
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp
          </a>
        </div>
      </nav>
    </>
  );
}
