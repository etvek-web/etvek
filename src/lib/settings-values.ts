import "server-only";
import { prisma } from "@/lib/prisma";
import type { SettingsValues } from "@/components/admin/settings-form";
import { DEFAULT_PROGRAM_MESSAGE } from "@/lib/utils";

export async function loadSettingsValues(): Promise<SettingsValues> {
  const s =
    (await prisma.siteSettings.findUnique({ where: { id: "singleton" } })) ??
    (await prisma.siteSettings.create({ data: { id: "singleton" } }));

  return {
    siteName: s.siteName,
    tagline: s.tagline,
    contactEmail: s.contactEmail,
    whatsappNumber: s.whatsappNumber,
    whatsappMessage: s.whatsappMessage,
    whatsappProgramMessage: s.whatsappProgramMessage?.trim() || DEFAULT_PROGRAM_MESSAGE,
    heroModelEnabled: s.heroModelEnabled,
    heroModelUrl: s.heroModelUrl,
    heroModelCredit: s.heroModelCredit,
    heroModelCreditUrl: s.heroModelCreditUrl,
    whatsappEnabled: s.whatsappEnabled,
    schedulerUrl: s.schedulerUrl,
    schedulerProvider: s.schedulerProvider,
    schedulerEnabled: s.schedulerEnabled,
    logoId: s.logoId,
    defaultOgImageId: s.defaultOgImageId,
    analyticsEnabled: s.analyticsEnabled,
    colorBackground: s.colorBackground,
    colorPrimary: s.colorPrimary,
    colorAccent: s.colorAccent,
    colorSurface: s.colorSurface,
    maintenanceMode: s.maintenanceMode,
    legalReviewNote: s.legalReviewNote,
  };
}
