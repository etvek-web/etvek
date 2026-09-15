import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  as: As = "h2",
  className,
}: {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  if (!eyebrow && !title && !subtitle) return null;
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      {title && (
        <As className={cn("text-balance text-3xl leading-[1.15] sm:text-4xl lg:text-[2.9rem]")}>{title}</As>
      )}
      {subtitle && <p className="mt-5 text-pretty text-base leading-relaxed text-paper/60 sm:text-lg">{subtitle}</p>}
    </div>
  );
}
