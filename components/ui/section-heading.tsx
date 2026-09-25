import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  children,
  center,
  as: Tag = "h2",
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  center?: boolean;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center", className)}>
      <p className="eyebrow">{eyebrow}</p>
      <Tag className="mt-4 font-display text-3xl font-light leading-tight sm:text-4xl lg:text-5xl">{title}</Tag>
      <div className={cn("hairline mt-6", center && "mx-auto")} />
      {children && <div className="mt-6 text-sm leading-relaxed text-muted sm:text-base">{children}</div>}
    </div>
  );
}
