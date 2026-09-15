import { ButtonLink } from "@/components/ui/button";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-sans text-xl font-medium tracking-tight text-paper">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-paper/50">{description}</p>}
      </div>
      {action && (
        <ButtonLink href={action.href} size="sm">
          {action.label}
        </ButtonLink>
      )}
    </div>
  );
}
