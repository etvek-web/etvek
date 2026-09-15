import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin/shell";
import { adminConfigIssues } from "@/lib/config-check";
import { ConfigNotice } from "@/components/admin/config-notice";

/** Toda página del panel exige sesión verificada en el servidor. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const issues = adminConfigIssues();
  if (issues.length) return <ConfigNotice issues={issues} />;

  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return <AdminShell userName={user.name}>{children}</AdminShell>;
}
