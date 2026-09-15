"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { createFirstAdmin, type SetupState } from "@/app/actions/setup";
import { Button } from "@/components/ui/button";
import { Field, FieldError, Input } from "@/components/ui/field";

const INITIAL: SetupState = { status: "idle" };

export function SetupForm() {
  const [state, formAction, pending] = useActionState(createFirstAdmin, INITIAL);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Nombre" required>
        {(id) => <Input id={id} name="name" defaultValue="Eliana Kestler" required autoComplete="name" />}
      </Field>

      <Field label="Email" required>
        {(id) => <Input id={id} name="email" type="email" required autoComplete="username" />}
      </Field>

      <Field label="Contraseña" required hint="Mínimo 12 caracteres, con mayúscula, minúscula y número.">
        {(id) => <Input id={id} name="password" type="password" required autoComplete="new-password" />}
      </Field>

      <Field label="Repetir contraseña" required>
        {(id) => <Input id={id} name="confirm" type="password" required autoComplete="new-password" />}
      </Field>

      {state.status === "error" && <FieldError>{state.message}</FieldError>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {pending ? "Creando…" : "Crear cuenta y entrar"}
      </Button>
    </form>
  );
}
