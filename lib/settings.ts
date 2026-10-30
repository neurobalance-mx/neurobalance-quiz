// Parámetros editables desde el panel /admin. Los valores por defecto son los de la versión piloto.

export interface IntegrationSettings {
  ghl: { enabled: boolean; mode: "webhook" | "api"; webhook_url: string; api_token: string; location_id: string; tags: string };
  google_sheets: { enabled: boolean; webhook_url: string; secret: string };
  microsoft: { enabled: boolean; webhook_url: string };
  custom_webhook: { enabled: boolean; url: string; secret: string };
}

export interface AppSettings {
  thresholds: {
    profile_diff: number; // diferencia FL−FR para asignar rojo/azul
    min_strength_valid: number; // respuestas válidas mínimas por bloque de fortalezas (de 12)
    min_challenge_valid: number; // respuestas válidas mínimas por bloque de retos (de 6)
    challenge_flag_value: number; // valor desde el cual un reto se muestra como "señalado" (3 = Frecuentemente)
  };
  early_age_mode: "insufficient" | "score"; // 0–5 años: no asignar perfil mientras no exista la adaptación
  guides: { red_url: string; blue_url: string };
  privacy_url: string;
  email_note: string; // mensaje en pantalla cuando el correo se envió. {email} se reemplaza. Vacío = texto por defecto.
  email: {
    enabled: boolean;
    from: string; // "Neurobalance <resultados@dominio.com>" — el dominio debe estar verificado en Resend
    reply_to: string;
    subject: string; // {nombre} y {perfil} se reemplazan
    bcc: string; // copia interna opcional (separada por comas)
  };
  integrations: IntegrationSettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  thresholds: { profile_diff: 15, min_strength_valid: 9, min_challenge_valid: 4, challenge_flag_value: 3 },
  early_age_mode: "insufficient",
  guides: { red_url: "/guias/guia-roja.pdf", blue_url: "/guias/guia-azul.pdf" },
  privacy_url: "#",
  email_note: "",
  email: {
    enabled: false,
    from: "Neurobalance <onboarding@resend.dev>",
    reply_to: "",
    subject: "{nombre}, este es tu Perfil Cerebral Neurobalance",
    bcc: "",
  },
  integrations: {
    ghl: { enabled: false, mode: "webhook", webhook_url: "", api_token: "", location_id: "", tags: "quiz-neurobalance" },
    google_sheets: { enabled: false, webhook_url: "", secret: "" },
    microsoft: { enabled: false, webhook_url: "" },
    custom_webhook: { enabled: false, url: "", secret: "" },
  },
};

// Mezcla profunda para que agregar campos nuevos no rompa configuraciones ya guardadas.
export function mergeSettings(stored: unknown): AppSettings {
  const deep = (base: any, over: any): any => {
    if (typeof base !== "object" || base === null || Array.isArray(base)) return over ?? base;
    const out: any = { ...base };
    if (over && typeof over === "object") for (const k of Object.keys(base)) out[k] = deep(base[k], over[k]);
    return out;
  };
  return deep(DEFAULT_SETTINGS, stored);
}

export const DEFAULT_EMAIL_NOTE = "Te enviamos tu resultado y tus guías a {email}.";

// Versión sin secretos (para mostrar en el panel enmascarada si se requiere).
export function maskSecret(s: string) {
  if (!s) return "";
  return s.length <= 8 ? "••••" : `${s.slice(0, 4)}••••${s.slice(-4)}`;
}
