import { MANIFESTO_BODY, MANIFESTO_QUOTE, PILLARS, BIO_PARAGRAPHS } from "./seed-content";
import type { SectionKind } from "@prisma/client";

type SeedItem = { title: string; body?: string | null; icon?: string | null };
type SeedSection = {
  key: string;
  kind: SectionKind;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaLabel2?: string;
  ctaHref2?: string;
  items?: SeedItem[];
  data?: Record<string, unknown>;
};
type SeedPage = {
  slug: string;
  title: string;
  seo: { metaTitle: string; metaDescription: string };
  sections: SeedSection[];
};

const LEGAL_NOTE =
  "⚠ Texto base pendiente de revisión profesional. Debe ser revisado por un asesor legal antes de su publicación definitiva.";

export const PAGES: SeedPage[] = [
  {
    slug: "home",
    title: "Inicio",
    seo: {
      metaTitle: "ETVEK — Estudio Técnico Vocal de Eliana Kestler",
      metaDescription:
        "Optimizá y rehabilitá tu voz con estándar de élite y respaldo científico. Entrenamiento y rehabilitación vocal 100% online para cantantes profesionales.",
    },
    sections: [
      {
        key: "hero",
        kind: "HERO",
        eyebrow: "Estudio Técnico Vocal de Eliana Kestler",
        title: "Optimizá y rehabilitá tu voz con estándar de élite y respaldo científico.",
        subtitle:
          "Alto rendimiento vocal, fonoaudiología y rehabilitación vocal. Atención 100% online en Argentina, Chile, Colombia, México, EE. UU. y Uruguay.",
        ctaLabel: "Solicitar Evaluación Vocal",
        ctaHref: "/contacto",
        ctaLabel2: "Ver programas",
        ctaHref2: "/programas",
      },
      {
        key: "credenciales",
        kind: "CREDENTIAL_STRIP",
        eyebrow: "Respaldo",
        title: "Formación, escenarios y rigor clínico",
      },
      {
        key: "manifiesto",
        kind: "MANIFESTO",
        eyebrow: "Manifiesto",
        title: "El Manifiesto ETVEK — Donde la ciencia de la voz se encuentra con el alto rendimiento artístico.",
        subtitle: "No enseñamos a cantar. Optimizamos, protegemos y rehabilitamos tu instrumento.",
        body: MANIFESTO_BODY,
        items: PILLARS,
        data: { quote: MANIFESTO_QUOTE },
      },
      {
        key: "programas",
        kind: "PROGRAM_GRID",
        eyebrow: "Planes & Programas",
        title: "Cuatro planes de trabajo",
        subtitle: "Diagnóstico, alto rendimiento, rehabilitación y asesoría técnica para producción.",
        ctaLabel: "Ver todos los programas",
        ctaHref: "/programas",
      },
      {
        key: "cobertura",
        kind: "COUNTRY_COVERAGE",
        eyebrow: "Cobertura internacional",
        title: "Atención 100% online",
        subtitle: "Sesiones con detección automática de zona horaria según tu país de residencia.",
      },
      {
        key: "testimonios",
        kind: "TESTIMONIALS",
        eyebrow: "Casos",
        title: "Testimonios y casos de éxito",
      },
      {
        key: "cta-final",
        kind: "CTA",
        title: "Tu voz no es una abstracción: es un órgano biológico y un sistema acústico.",
        subtitle: "Solicitá tu evaluación vocal y recibí un diagnóstico funcional de tu instrumento.",
        ctaLabel: "Solicitar Evaluación Vocal",
        ctaHref: "/contacto",
      },
    ],
  },
  {
    slug: "sobre-eliana",
    title: "Sobre Eliana & Método ETVEK",
    seo: {
      metaTitle: "Sobre Eliana Kestler & Método ETVEK",
      metaDescription:
        "Soprano Lírico-Spinto, graduada del Instituto Superior de Arte del Teatro Colón y especialista en técnica y rehabilitación vocal con formación en Fonoaudiología.",
    },
    sections: [
      {
        key: "hero",
        kind: "HERO",
        eyebrow: "Sobre Eliana",
        title: "Eliana Estefanía Kestler",
        subtitle:
          "Soprano Lírico-Spinto | Graduada del Instituto Superior de Arte del Teatro Colón | Especialista en Técnica y Rehabilitación Vocal con Formación en Fonoaudiología",
        ctaLabel: "Solicitar Evaluación Vocal",
        ctaHref: "/contacto",
      },
      {
        key: "biografia",
        kind: "BIO",
        eyebrow: "Trayectoria",
        title: "Maestría escénica de élite y rigor biomédico",
        body: BIO_PARAGRAPHS.join("\n\n"),
      },
      {
        key: "metodo",
        kind: "PILLARS",
        eyebrow: "Método ETVEK",
        title: "Tres pilares innegociables",
        subtitle: "La voz abordada desde su matriz real: biomecánica, anatomía laríngea y física acústica.",
        items: PILLARS,
      },
      {
        key: "timeline",
        kind: "TIMELINE",
        eyebrow: "Línea de tiempo",
        title: "Formación, escenarios y clínica",
      },
      {
        key: "cta",
        kind: "CTA",
        title: "Trabajemos sobre tu instrumento",
        subtitle: "Evaluación diagnóstica vocal con informe técnico escrito.",
        ctaLabel: "Solicitar Evaluación Vocal",
        ctaHref: "/contacto",
      },
    ],
  },
  {
    slug: "programas",
    title: "Planes & Programas",
    seo: {
      metaTitle: "Planes & Programas — ETVEK",
      metaDescription:
        "Evaluación diagnóstica vocal, entrenamiento de alto rendimiento, rehabilitación y reeducación vocal y asesoría técnica para producción y estudio.",
    },
    sections: [
      {
        key: "hero",
        kind: "HERO",
        eyebrow: "Planes & Programas",
        title: "Cuatro planes de trabajo, un mismo estándar técnico.",
        subtitle:
          "Cada programa parte de un diagnóstico funcional y se ajusta a la exigencia real de tu proyecto artístico.",
        ctaLabel: "Solicitar Admisión",
        ctaHref: "/contacto",
      },
      { key: "grilla", kind: "PROGRAM_GRID", title: "Programas" },
      {
        key: "pagos",
        kind: "PAYMENT_INFO",
        eyebrow: "Pagos",
        title: "Modalidad de pago",
        subtitle: "Seleccioná tu moneda según tu país de residencia.",
      },
      {
        key: "cta",
        kind: "CTA",
        title: "¿No sabés qué plan necesitás?",
        subtitle: "Empezá por la Evaluación Diagnóstica Vocal y definamos el camino con datos.",
        ctaLabel: "Solicitar Evaluación Vocal",
        ctaHref: "/contacto",
      },
    ],
  },
  {
    slug: "modalidad-online",
    title: "Modalidad Online & Cobertura Internacional",
    seo: {
      metaTitle: "Modalidad Online & Cobertura Internacional — ETVEK",
      metaDescription:
        "Atención 100% online en Argentina, Chile, Colombia, México, Estados Unidos y Uruguay, con detección automática de zona horaria.",
    },
    sections: [
      {
        key: "hero",
        kind: "HERO",
        eyebrow: "Modalidad Online",
        title: "Atención 100% online, sin perder precisión técnica.",
        subtitle:
          "El trabajo se sostiene sobre diagnóstico, registro y seguimiento: la distancia no baja el estándar.",
        ctaLabel: "Solicitar Evaluación Vocal",
        ctaHref: "/contacto",
      },
      {
        key: "como-funciona",
        kind: "PILLARS",
        eyebrow: "Cómo funciona",
        title: "El proceso, paso a paso",
        items: [
          {
            title: "1. Solicitud de admisión",
            body: "Completás el formulario con tu proyecto, nivel y objetivo principal. La admisión es filtrada: cada caso se evalúa antes de asignar un plan.",
            icon: "clipboard-list",
          },
          {
            title: "2. Evaluación diagnóstica",
            body: "Sesión online de 60 minutos para analizar el estado biomecánico y acústico de tu voz, con informe técnico escrito.",
            icon: "stethoscope",
          },
          {
            title: "3. Plan de trabajo",
            body: "Según el diagnóstico se define el programa: alto rendimiento, rehabilitación o asesoría técnica para producción.",
            icon: "route",
          },
          {
            title: "4. Seguimiento",
            body: "Sesiones individuales, rutinas de acondicionamiento y soporte entre encuentros según el plan contratado.",
            icon: "repeat",
          },
        ],
      },
      {
        key: "cobertura",
        kind: "COUNTRY_COVERAGE",
        eyebrow: "Cobertura",
        title: "Países de atención",
        subtitle: "La agenda detecta automáticamente tu zona horaria.",
      },
      {
        key: "agenda",
        kind: "SCHEDULER",
        eyebrow: "Agenda",
        title: "Reservá tu sesión",
        subtitle: "Elegí el horario que mejor se ajuste a tu huso horario.",
      },
      {
        key: "cta",
        kind: "CTA",
        title: "Empecemos por el diagnóstico",
        ctaLabel: "Solicitar Evaluación Vocal",
        ctaHref: "/contacto",
      },
    ],
  },
  {
    slug: "contacto",
    title: "Contacto & Admisión",
    seo: {
      metaTitle: "Contacto & Admisión — ETVEK",
      metaDescription:
        "Solicitá tu evaluación vocal en ETVEK. Formulario de admisión para cantantes profesionales y semi-profesionales.",
    },
    sections: [
      {
        key: "hero",
        kind: "HERO",
        eyebrow: "Contacto & Admisión",
        title: "Solicitá tu Evaluación Vocal",
        subtitle:
          "La admisión es filtrada: contanos tu proyecto y tu objetivo para evaluar si ETVEK es el espacio adecuado para tu voz.",
      },
      { key: "formulario", kind: "CONTACT_FORM", title: "Formulario de admisión" },
      {
        key: "pagos",
        kind: "PAYMENT_INFO",
        eyebrow: "Pagos",
        title: "Modalidad de pago",
        subtitle: "Argentina en ARS · Exterior en USD.",
      },
      { key: "agenda", kind: "SCHEDULER", eyebrow: "Agenda", title: "Reservá tu sesión" },
    ],
  },
  {
    slug: "privacidad",
    title: "Política de Privacidad",
    seo: {
      metaTitle: "Política de Privacidad — ETVEK",
      metaDescription: "Cómo ETVEK trata los datos personales enviados a través del formulario de admisión.",
    },
    sections: [
      {
        key: "contenido",
        kind: "RICH_TEXT",
        title: "Política de Privacidad",
        body: `${LEGAL_NOTE}

Responsable del tratamiento
ETVEK — Estudio Técnico Vocal de Eliana Kestler.

Datos que recolectamos
A través del formulario de admisión recolectamos: nombre completo, email, número de WhatsApp con código de país, país de residencia, estilo musical o proyecto, nivel declarado y objetivo principal. Cuando corresponde a una contratación, también recibimos comprobantes de pago.

Finalidad
Los datos se utilizan exclusivamente para evaluar la solicitud de admisión, coordinar sesiones, gestionar pagos y mantener el vínculo profesional. No se venden ni se ceden a terceros con fines comerciales.

Información sensible
El campo "objetivo principal" puede contener referencias al estado de tu voz. Esa información se trata con confidencialidad profesional, no se envía a herramientas de analítica y no se publica en ningún caso.

Comprobantes de pago
Los comprobantes se almacenan como archivos privados. No tienen URL pública y solo son accesibles desde el panel administrativo con sesión autenticada.

Conservación
Los datos se conservan mientras dure la relación profesional y por el plazo que exija la normativa aplicable.

Tus derechos
Podés solicitar el acceso, la rectificación o la supresión de tus datos escribiendo a la dirección de contacto publicada en este sitio.`,
      },
    ],
  },
  {
    slug: "terminos",
    title: "Términos y Condiciones",
    seo: {
      metaTitle: "Términos y Condiciones — ETVEK",
      metaDescription: "Condiciones de contratación de los programas de ETVEK.",
    },
    sections: [
      {
        key: "contenido",
        kind: "RICH_TEXT",
        title: "Términos y Condiciones",
        body: `${LEGAL_NOTE}

Objeto
Estos términos regulan la contratación de los programas de entrenamiento, rehabilitación y asesoría vocal ofrecidos por ETVEK — Estudio Técnico Vocal de Eliana Kestler.

Modalidad
Todos los servicios se prestan de forma 100% online mediante videollamada. Es responsabilidad del alumno contar con conexión, dispositivo y espacio adecuados.

Admisión
La solicitud de admisión no implica la aceptación automática. ETVEK evalúa cada caso y puede no aceptar una solicitud cuando el pedido excede el alcance del servicio.

Alcance profesional
ETVEK brinda entrenamiento técnico vocal y reeducación vocal. No sustituye el diagnóstico, el tratamiento ni el seguimiento médico. En casos de lesión, el trabajo se coordina con el otorrinolaringólogo del paciente.

Pagos
Los pagos en pesos argentinos se realizan por transferencia bancaria; los pagos desde el exterior, en dólares vía MoneyGram. La sesión se confirma una vez recibido y verificado el comprobante.

Cancelaciones y reprogramaciones
Las condiciones de cancelación y reprogramación se informan al confirmar la admisión.

Propiedad intelectual
Los materiales, rutinas e informes entregados son de uso personal del alumno y no pueden reproducirse ni distribuirse sin autorización escrita.`,
      },
    ],
  },
  {
    slug: "cookies",
    title: "Política de Cookies",
    seo: {
      metaTitle: "Política de Cookies — ETVEK",
      metaDescription: "Uso de cookies en el sitio de ETVEK.",
    },
    sections: [
      {
        key: "contenido",
        kind: "RICH_TEXT",
        title: "Política de Cookies",
        body: `${LEGAL_NOTE}

Cookies necesarias
El sitio público de ETVEK no utiliza cookies de publicidad ni de seguimiento de terceros. El panel administrativo utiliza una única cookie de sesión, técnica y estrictamente necesaria, para mantener la sesión de la administradora iniciada.

Analítica
Si la analítica está habilitada desde el panel, se utiliza una medición agregada de páginas vistas sin datos personales y sin el contenido de los formularios.

Control
Podés bloquear o eliminar las cookies desde la configuración de tu navegador. Bloquear la cookie de sesión impide el acceso al panel administrativo.`,
      },
    ],
  },
];
