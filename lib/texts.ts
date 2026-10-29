// Textos de resultado — BORRADOR editorial. Deben ser validados por Neurobalance antes de publicar.
import type { ResultKind } from "./types";

export const PROFILE_TEXTS: Record<ResultKind, { name: string; tag: string; description: string }> = {
  red: {
    name: "El Arquitecto Verbal",
    tag: "Perfil rojo · Hemisferio izquierdo",
    description:
      "Las respuestas muestran mayores fortalezas en habilidades verbales, secuenciales y simbólicas: uso del lenguaje, organización paso a paso, atención al detalle, memoria verbal y praxis.",
  },
  blue: {
    name: "El Integrador Contextual",
    tag: "Perfil azul · Hemisferio derecho",
    description:
      "Las respuestas muestran mayores fortalezas en habilidades visuales, espaciales y no verbales: percepción global, orientación en el espacio, lectura de emociones, tono de voz y contexto.",
  },
  combined: {
    name: "El Integrador Funcional",
    tag: "Perfil combinado",
    description:
      "Las fortalezas reportadas son similares o están distribuidas entre ambas familias de habilidades. Te compartimos ambas guías y una síntesis de las áreas con mayores puntuaciones.",
  },
  insufficient: {
    name: "Información insuficiente",
    tag: "Resultado pendiente",
    description:
      "No hay suficientes respuestas observadas para asignar un perfil con confianza. Te compartimos ambas guías como material general.",
  },
};

export const EARLY_AGE_TEXT =
  "Para menores de 6 años, el quiz requiere una adaptación de reactivos por etapa de desarrollo que todavía está en preparación. Por eso no mostramos puntajes ni asignamos un perfil; te compartimos ambas guías como material general.";

export const DISCLAIMER =
  "Este resultado es orientativo y no constituye un diagnóstico. Las puntuaciones reflejan lo reportado en el cuestionario y no representan un porcentaje físico de actividad cerebral. Fortalezas y retos se calculan por separado.";

export const CLOSING_MESSAGE =
  "¡Has completado tu Quiz de Perfil Cerebral Neurobalance! Ahora puedes conocer tus fortalezas funcionales, las habilidades que podrían requerir mayor apoyo y cómo las distintas especializaciones del cerebro contribuyen a tu vida cotidiana.";
