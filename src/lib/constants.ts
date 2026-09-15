/** Constantes compartidas entre middleware (edge) y servidor. */
export const SESSION_COOKIE = "etvek_session";

export const ADMISSION_STATUS_LABELS: Record<string, string> = {
  NUEVA: "Nueva",
  PENDIENTE: "Pendiente",
  CONTACTADA: "Contactada",
  EVALUACION_AGENDADA: "Evaluación agendada",
  PENDIENTE_DE_PAGO: "Pendiente de pago",
  COMPROBANTE_RECIBIDO: "Comprobante recibido",
  CONFIRMADA: "Confirmada",
  CERRADA: "Cerrada",
  RECHAZADA: "Rechazada",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  COMPROBANTE_RECIBIDO: "Comprobante recibido",
  VERIFICADO: "Verificado",
  RECHAZADO: "Rechazado",
};

export const LEVEL_LABELS: Record<string, string> = {
  PROFESIONAL: "Profesional",
  SEMI_PROFESIONAL: "Semi-profesional",
  OTRO: "Otro",
};

export const STATUS_LABELS: Record<string, string> = {
  PUBLISHED: "Publicado",
  DRAFT: "Borrador",
  ARCHIVED: "Archivado",
};
