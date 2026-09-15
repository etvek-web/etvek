import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LoginForm } from "@/components/admin/login-form";
import { AcousticWave } from "@/components/site/acoustic-wave";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ingresar — Panel ETVEK", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/admin");
  // Sin ninguna cuenta creada, el ingreso no sirve: mandamos al alta inicial.
  if ((await prisma.user.count()) === 0) redirect("/admin/setup");

  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center px-5 py-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-40 -translate-y-1/2 opacity-20">
        <AcousticWave />
      </div>

      <div className="w-full max-w-sm">
        <p className="font-display text-3xl tracking-[0.3em] text-paper">ETVEK</p>
        <p className="mt-1.5 text-[0.65rem] uppercase tracking-[0.18em] text-paper/40">Panel administrativo</p>

        <div className="mt-8 border border-paper/10 bg-ink-800/60 p-6">
          <LoginForm />
        </div>

        <p className="mt-6 text-xs leading-relaxed text-paper/35">
          El acceso es privado. No existe registro público de usuarios: las cuentas se crean desde el servidor.
        </p>
      </div>
    </main>
  );
}
