import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AccountForm } from "@/components/admin/account-form";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.id } });
  const sessions = await prisma.session.count({ where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } } });

  return (
    <>
      <AdminPageHeader title="Cuenta" description="Datos de acceso al panel." />
      <AccountForm name={user.name} email={user.email} />
      <div className="mt-10 border-t border-paper/10 pt-6 text-xs text-paper/40">
        <p>Sesiones activas: {sessions}</p>
        {user.lastLoginAt && <p className="mt-1">Último ingreso: {formatDate(user.lastLoginAt)}</p>}
        <p className="mt-1">Cambiar la contraseña cierra todas las demás sesiones abiertas.</p>
      </div>
    </>
  );
}
