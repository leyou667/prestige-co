import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons";
import { GENERIC_WHATSAPP_MESSAGE, whatsappUrl } from "@/lib/site";

/** Dernier écran avant le pied de page : on retrouve l'image du hero, et l'action sous la main. */
export function FinalCta() {
  return (
    <section aria-labelledby="final-titre" className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[url(/video/hero-poster-480.webp)] bg-cover bg-[center_40%] md:bg-[url(/video/hero-poster.webp)]"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />
      <div className="container py-24 md:py-36">
        <h2 id="final-titre" className="max-w-2xl font-display text-4xl font-light leading-[1.05] sm:text-5xl lg:text-6xl">
          Votre date, votre ville. On s&apos;occupe du reste.
        </h2>
        <p className="mt-5 max-w-md text-base leading-relaxed text-subtle">
          Devis immédiat en ligne, confirmation sur WhatsApp, véhicule livré à l&apos;adresse de votre choix.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/devis" className="btn-gold">
            Demander un devis
          </Link>
          <a href={whatsappUrl(GENERIC_WHATSAPP_MESSAGE)} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> Réserver via WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
