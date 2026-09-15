import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "gold" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-clinic text-paper hover:bg-clinic-light",
  gold: "bg-gold text-ink hover:bg-gold-soft",
  outline: "border border-paper/25 text-paper hover:border-gold hover:text-gold bg-transparent",
  ghost: "text-paper/70 hover:text-paper bg-transparent",
  danger: "bg-red-900/80 text-red-50 hover:bg-red-800",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-11 px-6 text-[0.8125rem]",
  lg: "h-13 px-8 text-sm",
};

function classes(variant: Variant, size: Size, className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xs font-medium uppercase tracking-[0.12em]",
    "transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={classes(variant, size, className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  external,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: Variant;
  size?: Size;
  external?: boolean;
}) {
  const isExternal = external ?? /^https?:\/\//.test(href);
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes(variant, size, className)} {...props} />
    );
  }
  return <Link href={href} className={classes(variant, size, className)} {...props} />;
}
