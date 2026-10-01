import { Plus } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqItems } from "@/lib/faq";

/** FAQ en <details> natifs : fonctionne sans JavaScript, accessible au clavier, balisée FAQPage. */
export function Faq() {
  const items = faqItems();
  return (
    <section className="border-t border-white/5 py-24 md:py-32" aria-labelledby="faq-titre">
      <div className="container grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr]">
        <SectionHeading eyebrow="Questions fréquentes" title={<span id="faq-titre">Tout ce qu&apos;il faut savoir avant de prendre la route.</span>} />
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {items.map((item) => (
            <li key={item.q}>
              <details className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-base text-white transition hover:text-gold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <Plus className="h-4 w-4 shrink-0 text-gold transition-transform duration-300 group-open:rotate-45" aria-hidden="true" />
                </summary>
                <p className="pb-6 pr-8 text-sm leading-relaxed text-muted">{item.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
        }}
      />
    </section>
  );
}
