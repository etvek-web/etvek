import { z } from "zod";

export const contentStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const currencyEnum = z.enum(["ARS", "USD"]);
export const levelEnum = z.enum(["PROFESIONAL", "SEMI_PROFESIONAL", "OTRO"]);
export const admissionStatusEnum = z.enum([
  "NUEVA",
  "PENDIENTE",
  "CONTACTADA",
  "EVALUACION_AGENDADA",
  "PENDIENTE_DE_PAGO",
  "COMPROBANTE_RECIBIDO",
  "CONFIRMADA",
  "CERRADA",
  "RECHAZADA",
]);
export const paymentStatusEnum = z.enum(["PENDIENTE", "COMPROBANTE_RECIBIDO", "VERIFICADO", "RECHAZADO"]);

const optionalText = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional();

const optionalUrl = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional()
  .refine((v) => !v || /^https?:\/\//.test(v) || v.startsWith("/"), {
    message: "Debe ser una URL válida (https://…) o una ruta interna (/…).",
  });

const optionalInt = z
  .union([z.string(), z.number(), z.null()])
  .transform((v) => {
    if (v === null || v === "" || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? Math.round(n) : null;
  })
  .nullable();

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido."),
  password: z.string().min(1, "Ingresá tu contraseña."),
});

/** Formulario público de admisión (PDF, sección 6). */
export const admissionSchema = z.object({
  fullName: z.string().trim().min(3, "Ingresá tu nombre completo.").max(120),
  email: z.string().trim().toLowerCase().email("Email inválido."),
  dialCode: z.string().trim().regex(/^\+\d{1,4}$/, "Código de país inválido."),
  whatsapp: z
    .string()
    .trim()
    .min(6, "Ingresá tu WhatsApp.")
    .max(20)
    .regex(/^[\d\s-]+$/, "Solo números."),
  countryId: z.string().trim().min(1, "Elegí tu país de residencia."),
  style: z.string().trim().max(160).optional().or(z.literal("")),
  level: levelEnum,
  objective: z.string().trim().min(10, "Contanos tu objetivo (mínimo 10 caracteres).").max(2000),
  programId: z.string().trim().optional().or(z.literal("")),
  source: z.string().trim().max(80).optional().or(z.literal("")),
  consent: z.literal(true, { errorMap: () => ({ message: "Necesitamos tu consentimiento para contactarte." }) }),
  /** Honeypot anti-spam: debe llegar vacío. */
  website: z.string().max(0, "Envío rechazado.").optional().or(z.literal("")),
});

export type AdmissionInput = z.infer<typeof admissionSchema>;

export const programSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/, "Slug inválido (solo a-z, 0-9 y guiones)."),
  subtitle: optionalText,
  summary: optionalText,
  description: optionalText,
  duration: optionalText,
  sessions: optionalText,
  icon: optionalText,
  imageId: optionalText,
  ctaLabel: optionalText,
  ctaHref: optionalUrl,
  priceArs: optionalInt,
  priceUsd: optionalInt,
  showPrice: z.coerce.boolean().default(false),
  featured: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  status: contentStatusEnum.default("PUBLISHED"),
  features: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
});

export const sectionSchema = z.object({
  eyebrow: optionalText,
  title: optionalText,
  subtitle: optionalText,
  body: optionalText,
  imageId: optionalText,
  ctaLabel: optionalText,
  ctaHref: optionalUrl,
  ctaLabel2: optionalText,
  ctaHref2: optionalUrl,
  isVisible: z.coerce.boolean().default(true),
  status: contentStatusEnum.default("PUBLISHED"),
  sortOrder: z.coerce.number().int().default(0),
  items: z
    .array(z.object({ title: z.string().trim().min(1).max(200), body: optionalText, icon: optionalText }))
    .max(24)
    .default([]),
});

export const credentialSchema = z.object({
  label: z.string().trim().min(2).max(200),
  detail: optionalText,
  icon: optionalText,
  sortOrder: z.coerce.number().int().default(0),
  status: contentStatusEnum.default("PUBLISHED"),
});

export const timelineSchema = z.object({
  year: optionalText,
  date: optionalText,
  title: z.string().trim().min(2).max(200),
  institution: optionalText,
  description: optionalText,
  country: optionalText,
  city: optionalText,
  imageId: optionalText,
  link: optionalUrl,
  category: optionalText,
  featured: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  status: contentStatusEnum.default("PUBLISHED"),
});

export const testimonialSchema = z.object({
  name: z.string().trim().min(2).max(120),
  role: optionalText,
  project: optionalText,
  country: optionalText,
  quote: z.string().trim().min(10).max(1200),
  videoUrl: optionalUrl,
  instagram: optionalText,
  imageId: optionalText,
  sortOrder: z.coerce.number().int().default(0),
  status: contentStatusEnum.default("DRAFT"),
});

export const successCaseSchema = z.object({
  person: z.string().trim().min(2).max(120),
  project: optionalText,
  objective: z.string().trim().min(5).max(600),
  process: optionalText,
  result: optionalText,
  country: optionalText,
  imageId: optionalText,
  consent: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  status: contentStatusEnum.default("DRAFT"),
});

export const countrySchema = z.object({
  name: z.string().trim().min(2).max(80),
  code: z.string().trim().length(2).toUpperCase(),
  dialCode: z.string().trim().regex(/^\+\d{1,4}$/, "Formato: +54"),
  flag: optionalText,
  timezone: optionalText,
  sortOrder: z.coerce.number().int().default(0),
  status: contentStatusEnum.default("PUBLISHED"),
});

export const paymentMethodSchema = z.object({
  name: z.string().trim().min(2).max(120),
  currency: currencyEnum,
  instructions: optionalText,
  holder: optionalText,
  bank: optionalText,
  cbu: optionalText,
  alias: optionalText,
  accountInfo: optionalText,
  sortOrder: z.coerce.number().int().default(0),
  status: contentStatusEnum.default("PUBLISHED"),
});

export const navigationSchema = z.object({
  label: z.string().trim().min(1).max(60),
  href: z.string().trim().min(1).max(200),
  location: z.enum(["HEADER", "FOOTER", "LEGAL"]).default("HEADER"),
  isExternal: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  status: contentStatusEnum.default("PUBLISHED"),
});

export const socialSchema = z.object({
  platform: z.string().trim().min(2).max(40),
  url: z.string().trim().url("URL inválida."),
  handle: optionalText,
  sortOrder: z.coerce.number().int().default(0),
  status: contentStatusEnum.default("PUBLISHED"),
});

export const seoSchema = z.object({
  path: z.string().trim().min(1).max(200),
  metaTitle: optionalText,
  metaDescription: optionalText,
  ogTitle: optionalText,
  ogDescription: optionalText,
  ogImageId: optionalText,
  canonical: optionalUrl,
  noindex: z.coerce.boolean().default(false),
});

export const settingsSchema = z.object({
  siteName: z.string().trim().min(1).max(80),
  tagline: optionalText,
  contactEmail: z.string().trim().toLowerCase().email(),
  whatsappNumber: optionalText,
  whatsappMessage: z.string().trim().min(5).max(300),
  whatsappEnabled: z.coerce.boolean().default(true),
  schedulerUrl: optionalUrl,
  schedulerProvider: z.enum(["calendly", "savvycal"]).default("calendly"),
  schedulerEnabled: z.coerce.boolean().default(false),
  logoId: optionalText,
  defaultOgImageId: optionalText,
  analyticsEnabled: z.coerce.boolean().default(false),
  colorBackground: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  colorPrimary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  colorAccent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  colorSurface: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  maintenanceMode: z.coerce.boolean().default(false),
  legalReviewNote: optionalText,
});

export const mediaUpdateSchema = z.object({
  alt: z.string().trim().max(300).default(""),
  description: optionalText,
  folder: optionalText,
});

export const admissionUpdateSchema = z.object({
  status: admissionStatusEnum,
});

export const noteSchema = z.object({
  body: z.string().trim().min(1, "La nota no puede estar vacía.").max(4000),
});

export const paymentSchema = z.object({
  admissionId: optionalText,
  programId: optionalText,
  methodId: optionalText,
  currency: currencyEnum,
  amount: optionalInt,
  reference: optionalText,
  status: paymentStatusEnum.default("PENDIENTE"),
});

export const accountSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().toLowerCase().email(),
    currentPassword: z.string().optional().or(z.literal("")),
    newPassword: z.string().optional().or(z.literal("")),
  })
  .refine((d) => !d.newPassword || (d.currentPassword?.length ?? 0) > 0, {
    message: "Ingresá tu contraseña actual para cambiarla.",
    path: ["currentPassword"],
  });
