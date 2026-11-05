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
  kids: KidsSettings;
  integrations: IntegrationSettings;
}

export interface KidsSettings {
  intensity_moderate: number;
  intensity_marked: number;
  imbalance_clear: number;
  imbalance_marked: number;
  both_high: number;
  booking_url: string;
  red_guide_url: string; // vacío = usar la guía roja general
  blue_guide_url: string;
  attach_pdf: boolean; // adjuntar el PDF además del botón de descarga
  subject: string; // {nombre} y {perfil}
  text_red: string; // {nombre}
  text_blue: string;
  text_comm: string;
  text_both: string;
  text_closing: string;
  disclaimer: string;
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
  kids: {
    intensity_moderate: 25,
    intensity_marked: 50,
    imbalance_clear: 10,
    imbalance_marked: 25,
    both_high: 30,
    booking_url: "https://www.neurobalance.mx/reserva-online",
    red_guide_url: "",
    blue_guide_url: "",
    attach_pdf: true,
    subject: "El Perfil Cerebral de {nombre}: {perfil}",
    text_red:
      "El perfil de {nombre} muestra un predominio del hemisferio izquierdo: El Arquitecto Verbal. El hemisferio izquierdo es el de las palabras, los datos, el detalle y las secuencias. En este perfil suelen destacar la memoria, el lenguaje y el interés profundo por ciertos temas. Cuando este predominio es marcado, pueden aparecer retos en las áreas que organiza el hemisferio derecho: el cuerpo, los sentidos, las emociones, la atención y la convivencia. En la guía adjunta encontrarás el contraste entre los dos hemisferios, las fortalezas de este perfil, los retos que pueden asociarse a él en niños y en adultos, y actividades para empezar en casa.",
    text_blue:
      "El perfil de {nombre} muestra un predominio del hemisferio derecho: El Integrador Contextual. El hemisferio derecho es el del cuerpo, el espacio, la intuición y la conexión con los demás. En este perfil suelen destacar la sensibilidad, la coordinación y la facilidad para leer a las personas. Cuando este predominio es marcado, pueden aparecer retos en las áreas que organiza el hemisferio izquierdo: el lenguaje, la lectura, las secuencias, la motricidad fina, la memoria y la motivación. En la guía adjunta encontrarás el contraste entre los dos hemisferios, las fortalezas de este perfil, los retos que pueden asociarse a él en niños y en adultos, y actividades para empezar en casa.",
    text_comm:
      "Que {nombre} no use el habla para comunicarse no indica cuánto entiende. El habla es una de las habilidades motoras más complejas del cuerpo, y el cerebro que comprende puede estar muy por delante de la boca que habla.",
    text_both: "Se observan rasgos de ambos perfiles, con uno más marcado que el otro.",
    text_closing:
      "Gracias por completar el Perfil Cerebral de tu hijo. Revisa la guía con calma: te ayudará a entender cómo funciona su cerebro y qué puedes hacer desde casa.",
    disclaimer: "Este ejercicio ayuda a comprender un perfil hemisférico. No es un diagnóstico ni una recomendación médica.",
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
