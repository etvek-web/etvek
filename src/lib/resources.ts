import type { ZodTypeAny } from "zod";
import {
  countrySchema,
  credentialSchema,
  navigationSchema,
  paymentMethodSchema,
  programSchema,
  socialSchema,
  successCaseSchema,
  testimonialSchema,
  timelineSchema,
} from "@/lib/validation";
import { TAGS, type CacheTag } from "@/lib/cache";

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "boolean"
  | "select"
  | "media"
  | "icon"
  | "slug"
  | "color"
  | "stringList";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  hint?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  colSpan?: 1 | 2;
};

export type ResourceDef = {
  key: string;
  model: string;
  label: string;
  singular: string;
  description?: string;
  schema: ZodTypeAny;
  fields: FieldDef[];
  listColumns: { name: string; label: string }[];
  titleField: string;
  tag: CacheTag;
  sortable: boolean;
  duplicable: boolean;
  softDelete?: boolean;
  relation?: { field: string; model: string; label: string };
};

const STATUS_FIELD: FieldDef = {
  name: "status",
  label: "Estado",
  type: "select",
  options: [
    { value: "PUBLISHED", label: "Publicado" },
    { value: "DRAFT", label: "Borrador" },
    { value: "ARCHIVED", label: "Archivado" },
  ],
};

const ORDER_FIELD: FieldDef = { name: "sortOrder", label: "Orden", type: "number" };

export const RESOURCES: Record<string, ResourceDef> = {
  programas: {
    key: "programas",
    model: "program",
    label: "Programas",
    singular: "Programa",
    description: "Planes de trabajo que se muestran en la home y en /programas.",
    schema: programSchema,
    tag: TAGS.programs,
    sortable: true,
    duplicable: true,
    softDelete: true,
    titleField: "name",
    relation: { field: "features", model: "programFeature", label: "Características" },
    listColumns: [
      { name: "name", label: "Nombre" },
      { name: "subtitle", label: "Subtítulo" },
      { name: "status", label: "Estado" },
      { name: "sortOrder", label: "Orden" },
    ],
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true, colSpan: 2 },
      { name: "slug", label: "Slug", type: "slug", required: true, hint: "URL: /contacto?programa=slug" },
      { name: "subtitle", label: "Subtítulo", type: "text", colSpan: 2 },
      { name: "summary", label: "Resumen corto", type: "textarea", colSpan: 2, hint: "Se usa en la tarjeta si está cargado." },
      { name: "description", label: "Descripción", type: "textarea", colSpan: 2 },
      { name: "features", label: "Características", type: "stringList", colSpan: 2 },
      { name: "duration", label: "Duración", type: "text" },
      { name: "sessions", label: "Sesiones", type: "text" },
      { name: "icon", label: "Icono", type: "icon" },
      { name: "imageId", label: "Imagen", type: "media" },
      { name: "ctaLabel", label: "Texto del botón", type: "text" },
      { name: "ctaHref", label: "Enlace del botón", type: "text" },
      { name: "priceArs", label: "Precio ARS", type: "number", hint: "Sin decimales. Vacío = sin precio cargado." },
      { name: "priceUsd", label: "Precio USD", type: "number" },
      { name: "showPrice", label: "Mostrar precio en la web", type: "boolean" },
      { name: "featured", label: "Destacado", type: "boolean" },
      ORDER_FIELD,
      STATUS_FIELD,
    ],
  },

  credenciales: {
    key: "credenciales",
    model: "credential",
    label: "Credenciales",
    singular: "Credencial",
    description: "Franja de autoridad de la home.",
    schema: credentialSchema,
    tag: TAGS.credentials,
    sortable: true,
    duplicable: false,
    titleField: "label",
    listColumns: [
      { name: "label", label: "Credencial" },
      { name: "status", label: "Estado" },
      { name: "sortOrder", label: "Orden" },
    ],
    fields: [
      { name: "label", label: "Texto", type: "text", required: true, colSpan: 2 },
      { name: "detail", label: "Detalle", type: "text", colSpan: 2 },
      { name: "icon", label: "Icono", type: "icon" },
      ORDER_FIELD,
      STATUS_FIELD,
    ],
  },

  trayectoria: {
    key: "trayectoria",
    model: "timelineEvent",
    label: "Trayectoria",
    singular: "Hito",
    description: "Línea de tiempo de /sobre-eliana.",
    schema: timelineSchema,
    tag: TAGS.timeline,
    sortable: true,
    duplicable: true,
    titleField: "title",
    listColumns: [
      { name: "title", label: "Título" },
      { name: "year", label: "Año" },
      { name: "category", label: "Categoría" },
      { name: "status", label: "Estado" },
    ],
    fields: [
      { name: "title", label: "Título", type: "text", required: true, colSpan: 2 },
      { name: "year", label: "Año", type: "text" },
      { name: "date", label: "Fecha exacta", type: "text", hint: "Formato AAAA-MM-DD (opcional)." },
      { name: "institution", label: "Institución", type: "text", colSpan: 2 },
      { name: "description", label: "Descripción", type: "textarea", colSpan: 2 },
      { name: "country", label: "País", type: "text" },
      { name: "city", label: "Ciudad", type: "text" },
      { name: "imageId", label: "Imagen", type: "media" },
      { name: "link", label: "Enlace", type: "text" },
      { name: "category", label: "Categoría", type: "text" },
      { name: "featured", label: "Destacado", type: "boolean" },
      ORDER_FIELD,
      STATUS_FIELD,
    ],
  },

  testimonios: {
    key: "testimonios",
    model: "testimonial",
    label: "Testimonios",
    singular: "Testimonio",
    description:
      "Sólo se publican testimonios reales. Si no hay ninguno publicado, la sección no aparece en la web.",
    schema: testimonialSchema,
    tag: TAGS.testimonials,
    sortable: true,
    duplicable: false,
    titleField: "name",
    listColumns: [
      { name: "name", label: "Nombre" },
      { name: "project", label: "Proyecto" },
      { name: "country", label: "País" },
      { name: "status", label: "Estado" },
    ],
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true },
      { name: "role", label: "Profesión", type: "text" },
      { name: "project", label: "Proyecto", type: "text" },
      { name: "country", label: "País", type: "text" },
      { name: "quote", label: "Testimonio", type: "textarea", required: true, colSpan: 2 },
      { name: "imageId", label: "Fotografía", type: "media" },
      { name: "videoUrl", label: "Video (YouTube / Vimeo)", type: "text" },
      { name: "instagram", label: "Instagram", type: "text", placeholder: "@usuario" },
      ORDER_FIELD,
      STATUS_FIELD,
    ],
  },

  "casos-exito": {
    key: "casos-exito",
    model: "successCase",
    label: "Casos de éxito",
    singular: "Caso de éxito",
    description:
      "Requiere consentimiento explícito de publicación. No se publican resultados clínicos sin autorización.",
    schema: successCaseSchema,
    tag: TAGS.successCases,
    sortable: true,
    duplicable: false,
    titleField: "person",
    listColumns: [
      { name: "person", label: "Persona / artista" },
      { name: "project", label: "Proyecto" },
      { name: "consent", label: "Consentimiento" },
      { name: "status", label: "Estado" },
    ],
    fields: [
      { name: "person", label: "Persona / artista", type: "text", required: true },
      { name: "project", label: "Proyecto", type: "text" },
      { name: "objective", label: "Objetivo", type: "textarea", required: true, colSpan: 2 },
      { name: "process", label: "Proceso", type: "textarea", colSpan: 2 },
      { name: "result", label: "Resultado", type: "textarea", colSpan: 2 },
      { name: "country", label: "País", type: "text" },
      { name: "imageId", label: "Imagen", type: "media" },
      {
        name: "consent",
        label: "Consentimiento de publicación",
        type: "boolean",
        hint: "Sin consentimiento el caso nunca se muestra públicamente.",
      },
      ORDER_FIELD,
      STATUS_FIELD,
    ],
  },

  paises: {
    key: "paises",
    model: "country",
    label: "Países",
    singular: "País",
    description: "Cobertura internacional y códigos telefónicos del formulario de admisión.",
    schema: countrySchema,
    tag: TAGS.countries,
    sortable: true,
    duplicable: false,
    titleField: "name",
    listColumns: [
      { name: "name", label: "País" },
      { name: "code", label: "Código" },
      { name: "dialCode", label: "Prefijo" },
      { name: "status", label: "Estado" },
    ],
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true },
      { name: "code", label: "Código ISO", type: "text", required: true, hint: "Dos letras: AR, CL, MX…" },
      { name: "dialCode", label: "Prefijo telefónico", type: "text", required: true, placeholder: "+54" },
      { name: "flag", label: "Bandera (emoji)", type: "text" },
      { name: "timezone", label: "Zona horaria", type: "text", placeholder: "America/Argentina/Buenos_Aires" },
      ORDER_FIELD,
      STATUS_FIELD,
    ],
  },

  "metodos-pago": {
    key: "metodos-pago",
    model: "paymentMethod",
    label: "Métodos de pago",
    singular: "Método de pago",
    description:
      "Datos bancarios y de MoneyGram. Nada está hardcodeado en el código: todo se carga y edita desde acá.",
    schema: paymentMethodSchema,
    tag: TAGS.paymentMethods,
    sortable: true,
    duplicable: false,
    titleField: "name",
    listColumns: [
      { name: "name", label: "Método" },
      { name: "currency", label: "Moneda" },
      { name: "status", label: "Estado" },
    ],
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true },
      {
        name: "currency",
        label: "Moneda",
        type: "select",
        required: true,
        options: [
          { value: "ARS", label: "ARS — Argentina" },
          { value: "USD", label: "USD — Exterior" },
        ],
      },
      { name: "instructions", label: "Instrucciones", type: "textarea", colSpan: 2 },
      { name: "holder", label: "Titular", type: "text" },
      { name: "bank", label: "Banco", type: "text" },
      { name: "cbu", label: "CBU / CVU", type: "text" },
      { name: "alias", label: "Alias", type: "text" },
      { name: "accountInfo", label: "Datos adicionales", type: "textarea", colSpan: 2 },
      ORDER_FIELD,
      STATUS_FIELD,
    ],
  },

  navegacion: {
    key: "navegacion",
    model: "navigationItem",
    label: "Navegación",
    singular: "Enlace",
    description: "Menú del encabezado, pie de página y enlaces legales.",
    schema: navigationSchema,
    tag: TAGS.navigation,
    sortable: true,
    duplicable: false,
    titleField: "label",
    listColumns: [
      { name: "label", label: "Etiqueta" },
      { name: "href", label: "Destino" },
      { name: "location", label: "Ubicación" },
      { name: "sortOrder", label: "Orden" },
    ],
    fields: [
      { name: "label", label: "Etiqueta", type: "text", required: true },
      { name: "href", label: "Destino", type: "text", required: true, placeholder: "/programas" },
      {
        name: "location",
        label: "Ubicación",
        type: "select",
        options: [
          { value: "HEADER", label: "Encabezado" },
          { value: "FOOTER", label: "Pie de página" },
          { value: "LEGAL", label: "Legales" },
        ],
      },
      { name: "isExternal", label: "Abrir en pestaña nueva", type: "boolean" },
      ORDER_FIELD,
      STATUS_FIELD,
    ],
  },

  redes: {
    key: "redes",
    model: "socialLink",
    label: "Redes sociales",
    singular: "Red social",
    schema: socialSchema,
    tag: TAGS.social,
    sortable: true,
    duplicable: false,
    titleField: "platform",
    listColumns: [
      { name: "platform", label: "Plataforma" },
      { name: "handle", label: "Usuario" },
      { name: "status", label: "Estado" },
    ],
    fields: [
      { name: "platform", label: "Plataforma", type: "text", required: true, placeholder: "Instagram" },
      { name: "url", label: "URL", type: "text", required: true },
      { name: "handle", label: "Usuario", type: "text", placeholder: "@etvek" },
      ORDER_FIELD,
      STATUS_FIELD,
    ],
  },
};

export function getResource(key: string): ResourceDef | null {
  return RESOURCES[key] ?? null;
}

export const RESOURCE_KEYS = Object.keys(RESOURCES);
