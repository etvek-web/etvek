"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

const CONTROL =
  "w-full rounded-xs border border-paper/15 bg-ink-700/60 px-3.5 py-2.5 text-sm text-paper placeholder:text-paper/35 " +
  "transition-colors focus:border-gold focus:outline-none focus:ring-0 disabled:opacity-50";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.14em] text-paper/55", className)}
      {...props}
    />
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs text-red-300">
      {children}
    </p>
  );
}

export function Hint({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs text-paper/45">{children}</p>;
}

type FieldProps = {
  label: string;
  error?: string;
  hint?: React.ReactNode;
  required?: boolean;
  children: (id: string) => React.ReactNode;
};

export function Field({ label, error, hint, required, children }: FieldProps) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-gold">*</span>}
      </Label>
      {children(id)}
      <Hint>{hint}</Hint>
      <FieldError>{error}</FieldError>
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(CONTROL, className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(CONTROL, "min-h-28 resize-y leading-relaxed", className)} {...props} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, ...props },
  ref,
) {
  return <select ref={ref} className={cn(CONTROL, "appearance-none pr-8", className)} {...props} />;
});

export function Checkbox({ className, label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm text-paper/70">
      <input
        type="checkbox"
        className={cn("mt-0.5 size-4 shrink-0 rounded-xs border-paper/30 bg-ink-700 accent-clinic", className)}
        {...props}
      />
      <span className="leading-snug">{label}</span>
    </label>
  );
}
