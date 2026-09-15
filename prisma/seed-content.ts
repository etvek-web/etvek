/**
 * Contenido inicial de ETVEK.
 * Fuente de verdad: "Brief y Requerimientos Técnicos: Desarrollo Web ETVEK" (Web ETVEK.pdf).
 * Este contenido es únicamente el estado inicial: a partir del primer deploy se edita desde /admin.
 */

/** Datos de contacto provistos por el cliente. Editables desde /admin. */
export const CONTACT = {
  whatsappNumber: "5493492280617",
  contactEmail: "contacto@etvek.com",
};

export const COUNTRIES = [
  { name: "Argentina", code: "AR", dialCode: "+54", flag: "🇦🇷", timezone: "America/Argentina/Buenos_Aires" },
  { name: "Chile", code: "CL", dialCode: "+56", flag: "🇨🇱", timezone: "America/Santiago" },
  { name: "Colombia", code: "CO", dialCode: "+57", flag: "🇨🇴", timezone: "America/Bogota" },
  { name: "México", code: "MX", dialCode: "+52", flag: "🇲🇽", timezone: "America/Mexico_City" },
  { name: "Estados Unidos", code: "US", dialCode: "+1", flag: "🇺🇸", timezone: "America/New_York" },
  { name: "Uruguay", code: "UY", dialCode: "+598", flag: "🇺🇾", timezone: "America/Montevideo" },
];

export const CREDENTIALS = [
  { label: "Graduada del ISATC — Teatro Colón", icon: "landmark" },
  { label: "Solista del Programa Colón Federal en representación del Teatro Colón", icon: "drama" },
  {
    label: "Representante de Argentina en México (Gran Museo del Mundo Maya)",
    detail: "Formación con Armando Manzanero",
    icon: "globe",
  },
  {
    label: "Becaria del Dr. Alejandro Cordero (Ciudadano Ilustre CABA)",
    detail: "Fundación Williams",
    icon: "award",
  },
  { label: "Especialización en Fonoaudiología & Rehabilitación Vocal", icon: "stethoscope" },
  {
    label: "Atención Online en Argentina, Chile, Colombia, México, EE. UU. y Uruguay",
    icon: "globe-2",
  },
];

export const PILLARS = [
  {
    title: "Rigor Anatomofisiológico",
    body: "Entendemos la musculatura intrínseca de la laringe, la presión subglótica y el sellado cordal para eliminar la fatiga y prevenir lesiones.",
    icon: "activity",
  },
  {
    title: "Precisión Acústica",
    body: "Optimizamos los tractos vocales y formantes de resonancia para cortar la mezcla en vivo o en estudio sin esfuerzo.",
    icon: "audio-waveform",
  },
  {
    title: "Mapeo y Rehabilitación Científica",
    body: "Combinamos la exigencia de la técnica lírica con la evidencia fonoaudiológica para reeducar voces dañadas.",
    icon: "microscope",
  },
];

export const MANIFESTO_BODY = `La mayoría de las clases de canto convencionales se basan en la repetición empírica o metáforas abstractas. En ETVEK, abordamos la voz profesional desde su matriz real: la biomecánica, la anatomía laríngea y la física acústica.

Nuestros tres pilares innegociables:`;

export const MANIFESTO_QUOTE = "Tu voz no es una abstracción: es un órgano biológico y un sistema acústico.";

export const BIO_PARAGRAPHS = [
  "Nacida en Rafaela, Santa Fe, Eliana Kestler construyó una trayectoria de excelencia sostenida por la disciplina y una vocación vocal absoluta. Graduada como Cantante Lírica del Instituto Superior de Arte del Teatro Colón, su talento ha sido respaldado por becas de instituciones de primer nivel como Juventus Lyrica y la Fundación Williams. Asimismo, fue becaria del Dr. Alejandro Cordero, eminente mecenas, médico y Ciudadano Ilustre de la CABA.",
  "En representación de la Argentina, llevó su voz a escenarios internacionales como el Gran Museo del Mundo Maya de Mérida (Yucatán, México), donde además profundizó su formación en composición a través de una masterclass con la figura emblemática de la música latinoamericana, Armando Manzanero.",
  "Como artista destacada e integrante del programa Colón Federal, actuó como solista en representación del Teatro Colón, llevando la lírica a diversos escenarios del país. Ha encarnado roles protagónicos del repertorio central (Suor Angelica, Donna Elvira) y se ha presentado bajo la dirección de maestros de talla internacional como Jan Latham-Koenig y Kamal Khan.",
  "Paralelamente a su carrera artística, desarrolló una intensa labor pedagógica y clínica como especialista en la voz con formación en Fonoaudiología. Como maestra y rehabilitadora vocal, acompaña de forma 100% online a cantantes profesionales, semi-profesionales y artistas de la industria en Argentina, Chile, Colombia, México, Estados Unidos y Uruguay.",
  "Esta doble perspectiva —que fusiona la maestría escénica de élite con el rigor biomédico— convierte a ETVEK en un espacio de optimización vocal donde la técnica, la interpretación y la salud convergen en una propuesta contemporánea y científica.",
];

export const TIMELINE = [
  {
    title: "Formación inicial en Rafaela, Santa Fe",
    description:
      "Comienzo de una trayectoria de excelencia sostenida por la disciplina y una vocación vocal absoluta.",
    country: "Argentina",
    city: "Rafaela",
    category: "Formación",
  },
  {
    title: "Graduada como Cantante Lírica — Instituto Superior de Arte del Teatro Colón",
    institution: "ISATC — Teatro Colón",
    country: "Argentina",
    city: "Ciudad Autónoma de Buenos Aires",
    category: "Formación",
    featured: true,
  },
  {
    title: "Becas de Juventus Lyrica y Fundación Williams",
    institution: "Juventus Lyrica · Fundación Williams",
    country: "Argentina",
    category: "Distinciones",
  },
  {
    title: "Becaria del Dr. Alejandro Cordero",
    institution: "Dr. Alejandro Cordero — Ciudadano Ilustre de la CABA",
    description: "Mecenas y médico; respaldo a la formación lírica de Eliana.",
    country: "Argentina",
    category: "Distinciones",
    featured: true,
  },
  {
    title: "Representante de Argentina en el Gran Museo del Mundo Maya",
    institution: "Gran Museo del Mundo Maya",
    description:
      "Presentación internacional en representación de la Argentina y masterclass de composición con Armando Manzanero.",
    country: "México",
    city: "Mérida, Yucatán",
    category: "Escenarios",
    featured: true,
  },
  {
    title: "Solista del programa Colón Federal",
    institution: "Teatro Colón",
    description: "Actuación como solista en representación del Teatro Colón en diversos escenarios del país.",
    country: "Argentina",
    category: "Escenarios",
    featured: true,
  },
  {
    title: "Roles protagónicos del repertorio central",
    description:
      "Suor Angelica y Donna Elvira, bajo la dirección de maestros de talla internacional como Jan Latham-Koenig y Kamal Khan.",
    category: "Escenarios",
  },
  {
    title: "Especialización en Fonoaudiología y Rehabilitación Vocal",
    description:
      "Labor pedagógica y clínica como especialista en la voz: optimización, protección y rehabilitación del instrumento.",
    category: "Clínica",
    featured: true,
  },
  {
    title: "ETVEK — atención 100% online en seis países",
    description:
      "Acompañamiento a cantantes profesionales, semi-profesionales y artistas de la industria en Argentina, Chile, Colombia, México, Estados Unidos y Uruguay.",
    category: "ETVEK",
    featured: true,
  },
];

export const PROGRAMS = [
  {
    name: "Evaluación Diagnóstica Vocal",
    slug: "evaluacion-diagnostica-vocal",
    subtitle: "Diagnóstico funcional y mapeo anatomofisiológico de la voz.",
    description:
      "Valoración integral online (60 min) para analizar el estado biomecánico y acústico del cantante. Incluye evaluación de presión subglótica, sellado cordal, formantes de resonancia e informe técnico escrito.",
    duration: "60 minutos",
    sessions: "1 sesión individual",
    icon: "stethoscope",
    ctaLabel: "Reservar Sesión Diagnóstica",
    ctaHref: "/contacto",
    featured: true,
    features: [
      "Evaluación de presión subglótica",
      "Análisis de sellado cordal",
      "Mapeo de formantes de resonancia",
      "Informe técnico escrito",
    ],
  },
  {
    name: "Entrenamiento de Alto Rendimiento Vocal",
    slug: "entrenamiento-alto-rendimiento-vocal",
    subtitle: "Optimización, potencia y resistencia para artistas en activo.",
    description:
      "Programa mensual (4 sesiones individuales) para cantantes con fechas de shows, giras o estudio. Incluye rutinas de acondicionamiento, trabajo sobre repertorio, higiene vocal y soporte vía WhatsApp pre-show.",
    duration: "Programa mensual",
    sessions: "4 sesiones individuales",
    icon: "activity",
    ctaLabel: "Solicitar Admisión",
    ctaHref: "/contacto",
    featured: true,
    features: [
      "Rutinas de acondicionamiento",
      "Trabajo sobre repertorio",
      "Higiene vocal",
      "Soporte vía WhatsApp pre-show",
    ],
  },
  {
    name: "Rehabilitación & Reeducación Vocal",
    slug: "rehabilitacion-reeducacion-vocal",
    subtitle: "Tratamiento técnico-clínico para voces dañadas o con fatiga.",
    description:
      "Abordaje fonoaudiológico con ejercicios SOVTE (tubos de resonancia) para recuperar pliegues vocales con lesiones (nódulos, edemas, disfonías). Trabajo coordinado con el ORL del paciente.",
    icon: "heart-pulse",
    ctaLabel: "Solicitar Admisión",
    ctaHref: "/contacto",
    features: [
      "Ejercicios SOVTE (tubos de resonancia)",
      "Abordaje de nódulos, edemas y disfonías",
      "Trabajo coordinado con el ORL del paciente",
    ],
  },
  {
    name: "Asesoría Técnica para Producción & Estudio",
    slug: "asesoria-tecnica-produccion-estudio",
    subtitle: "Acompañamiento intensivo para la grabación de álbumes y giras.",
    description:
      "Servicio exclusivo de preparación y blindaje vocal para productores, sellos y artistas previo a entrar a cabina de grabación o encarar giras exigentes.",
    icon: "mic-vocal",
    ctaLabel: "Consultar por Proyecto",
    ctaHref: "/contacto",
    features: ["Preparación previa a cabina de grabación", "Blindaje vocal para giras exigentes", "Trabajo con productores y sellos"],
  },
];

export const PAYMENT_METHODS = [
  {
    name: "Transferencia Bancaria / Brubank",
    currency: "ARS" as const,
    instructions:
      "Pago en pesos argentinos vía transferencia bancaria. Al confirmar el plan recibirás los datos de la cuenta y podrás cargar el comprobante desde el formulario de admisión.",
  },
  {
    name: "MoneyGram",
    currency: "USD" as const,
    instructions:
      "Pago desde el exterior en dólares vía MoneyGram. Una vez realizado el envío, cargá el código MTCN para que la admisión avance.",
  },
];

export const NAVIGATION = [
  { label: "Inicio", href: "/", location: "HEADER", sortOrder: 0 },
  { label: "Sobre Eliana", href: "/sobre-eliana", location: "HEADER", sortOrder: 1 },
  { label: "Programas", href: "/programas", location: "HEADER", sortOrder: 2 },
  { label: "Modalidad Online", href: "/modalidad-online", location: "HEADER", sortOrder: 3 },
  { label: "Contacto", href: "/contacto", location: "HEADER", sortOrder: 4 },
  { label: "Sobre Eliana & Método ETVEK", href: "/sobre-eliana", location: "FOOTER", sortOrder: 0 },
  { label: "Planes & Programas", href: "/programas", location: "FOOTER", sortOrder: 1 },
  { label: "Modalidad Online & Cobertura", href: "/modalidad-online", location: "FOOTER", sortOrder: 2 },
  { label: "Contacto & Admisión", href: "/contacto", location: "FOOTER", sortOrder: 3 },
  { label: "Política de Privacidad", href: "/privacidad", location: "LEGAL", sortOrder: 0 },
  { label: "Términos y Condiciones", href: "/terminos", location: "LEGAL", sortOrder: 1 },
  { label: "Política de Cookies", href: "/cookies", location: "LEGAL", sortOrder: 2 },
];
