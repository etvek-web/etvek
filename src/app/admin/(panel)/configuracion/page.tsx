import { AdminPageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { loadSettingsValues } from "@/lib/settings-values";

export const dynamic = "force-dynamic";

export default async function Page() {
  const values = await loadSettingsValues();
  return (
    <>
      <AdminPageHeader title="Configuración" description="Datos generales del estudio, contacto y botón de WhatsApp." />
      <SettingsForm values={values} group="general" />
    </>
  );
}
