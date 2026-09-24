import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { SITE } from "@/lib/site";

export function Breadcrumbs({ items }: { items: { label: string; href: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-8 text-xs text-white/45">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <li key={it.href} className="inline-flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3 w-3" />}
            {i === items.length - 1 ? (
              <span aria-current="page" className="text-white/75">{it.label}</span>
            ) : (
              <Link href={it.href} className="hover:text-white">{it.label}</Link>
            )}
          </li>
        ))}
      </ol>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.label, item: `${SITE.url}${it.href}` })),
        }}
      />
    </nav>
  );
}
