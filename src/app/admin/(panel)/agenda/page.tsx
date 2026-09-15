import { AdminPageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { loadSettingsValues } from "@/lib/settings-values";

export const dynamic = "force-dynamic";

export default async function Page() {
  const values = await loadSettingsValues();
  return (
    <>
      <AdminPageHeader title="Agenda" description="Integración con Calendly o SavvyCal, con detección automática de zona horaria." />
      <SettingsForm values={values} group="agenda" />
    </>
  );
}
