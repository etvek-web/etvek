"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { updateAccount, type AccountState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, FieldError, Input } from "@/components/ui/field";

const INITIAL: AccountState = { status: "idle" };

export function AccountForm({ name, email }: { name: string; email: string }) {
  const [state, formAction, pending] = useActionState(updateAccount, INITIAL);

  return (
    <form action={formAction} className="max-w-lg space-y-6">
      <Field label="Nombre" required>
        {(id) => <Input id={id} name="name" defaultValue={name} required />}
      </Field>

      <Field label="Email" required>
        {(id) => <Input id={id} name="email" type="email" defaultValue={email} required autoComplete="username" />}
      </Field>

      <div className="border-t border-paper/10 pt-6">
        <Field label="Contraseña actual" hint="Sólo si querés cambiar la contraseña.">
          {(id) => <Input id={id} name="currentPassword" type="password" autoComplete="current-password" />}
        </Field>

        <div className="mt-6">
          <Field label="Nueva contraseña" hint="Mínimo 12 caracteres, con mayúscula, minúscula y número.">
            {(id) => <Input id={id} name="newPassword" type="password" autoComplete="new-password" />}
          </Field>
        </div>
      </div>

      {state.status === "error" && <FieldError>{state.message}</FieldError>}
      {state.status === "success" && <p className="text-sm text-gold">{state.message}</p>}

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {pending ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}
