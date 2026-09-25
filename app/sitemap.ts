import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { CITIES, citySeoSlug } from "@/lib/cities";
import { SITE } from "@/lib/site";
import { VEHICLES, vehicleHref } from "@/lib/vehicles";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({ url: `${SITE.url}${path}`, lastModified: now, changeFrequency: "weekly", priority });
  return [
    page("/", 1),
    page("/vehicules", 0.9),
    ...VEHICLES.map((v) => ({ ...page(vehicleHref(v), 0.8), images: v.photos.slice(0, 5).map((p) => `${SITE.url}${p.src}`) })),
    ...CATEGORIES.map((c) => page(`/${c.seoSlug}`, 0.7)),
    ...CITIES.map((c) => page(`/${citySeoSlug(c)}`, 0.7)),
    page("/devis", 0.6),
    page("/services", 0.5),
    page("/a-propos", 0.4),
    page("/contact", 0.5),
    page("/conditions-generales", 0.2),
  ];
}
