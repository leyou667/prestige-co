import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  children,
  center,
  as: Tag = "h2",
  className,
}: {
  /** Information de contexte, à n'utiliser que si elle apporte quelque chose (prix, catégorie…) */
  eyebrow?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  center?: boolean;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center", className)}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <Tag className="font-display text-4xl font-light leading-[1.05] sm:text-5xl lg:text-[3.5rem]">{title}</Tag>
      {children && <div className={cn("mt-6 max-w-xl text-base leading-relaxed text-muted", center && "mx-auto")}>{children}</div>}
    </div>
  );
}
