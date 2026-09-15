import { AdminPageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { loadSettingsValues } from "@/lib/settings-values";

export const dynamic = "force-dynamic";

export default async function Page() {
  const values = await loadSettingsValues();
  return (
    <>
      <AdminPageHeader title="Apariencia" description="Logo, imagen Open Graph y paleta de la marca." />
      <SettingsForm values={values} group="apariencia" />
    </>
  );
}
