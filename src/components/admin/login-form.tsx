"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { login, type LoginState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, FieldError, Input } from "@/components/ui/field";

const INITIAL: LoginState = { status: "idle" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, INITIAL);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Email" required>
        {(id) => <Input id={id} name="email" type="email" autoComplete="username" required autoFocus />}
      </Field>

      <Field label="Contraseña" required>
        {(id) => <Input id={id} name="password" type="password" autoComplete="current-password" required />}
      </Field>

      {state.status === "error" && <FieldError>{state.message}</FieldError>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {pending ? "Ingresando…" : "Ingresar"}
      </Button>
    </form>
  );
}
