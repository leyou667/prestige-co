import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site";

/** Logo PRESTIGE CONCIERGERIE (PNG blanc, fond transparent — à utiliser sur fond sombre) */
export function Logo({ className, priority, href = "/" }: { className?: string; priority?: boolean; href?: string | null }) {
  const img = (
    <Image
      src={SITE.logo}
      alt={SITE.name}
      width={645}
      height={368}
      priority={priority}
      className={cn("h-auto w-full select-none", className)}
    />
  );
  if (href === null) return img;
  return (
    <Link href={href} aria-label={`${SITE.name} — accueil`} className="inline-block">
      {img}
    </Link>
  );
}
