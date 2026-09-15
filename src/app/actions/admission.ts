"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { admissionSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { hashIp } from "@/lib/auth";
import { signReceiptToken } from "@/lib/tokens";
import { notifyNewAdmission } from "@/lib/notify";

export type AdmissionActionState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> }
  | { status: "success"; admissionId: string; receiptToken: string };

export async function submitAdmission(_prev: AdmissionActionState, formData: FormData): Promise<AdmissionActionState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = admissionSchema.safeParse({ ...raw, consent: raw.consent === "on" || raw.consent === "true" });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Revisá los datos del formulario.", fieldErrors };
  }

  const h = await headers();
  const ipHash = hashIp(h.get("x-forwarded-for")) ?? "anon";
  const limit = await rateLimit(`admission:${ipHash}`, 5, 60 * 60 * 1000);
  if (!limit.ok) {
    return { status: "error", message: "Recibimos varias solicitudes desde este dispositivo. Probá de nuevo más tarde." };
  }

  const data = parsed.data;
  const country = await prisma.country.findUnique({ where: { id: data.countryId } });

  const admission = await prisma.admissionRequest.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      dialCode: data.dialCode,
      whatsapp: data.whatsapp.replace(/\s|-/g, ""),
      countryId: country?.id ?? null,
      countryName: country?.name ?? null,
      style: data.style || null,
      level: data.level,
      objective: data.objective,
      programId: data.programId || null,
      source: data.source || null,
      consent: true,
      ipHash,
    },
  });

  await notifyNewAdmission(admission.id);

  return { status: "success", admissionId: admission.id, receiptToken: await signReceiptToken(admission.id) };
}
