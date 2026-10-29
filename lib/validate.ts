import { AGE_BANDS, CONTEXT_QUESTIONS } from "./questions";
import type { Answers, ContextAnswers, Lead, Setup } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clip = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");

export function parseLead(x: any): Lead | string {
  const name = clip(x?.name, 120), email = clip(x?.email, 160).toLowerCase(), phone = clip(x?.phone, 40);
  if (name.length < 2) return "Falta el nombre.";
  if (!EMAIL_RE.test(email)) return "El correo no es válido.";
  if (x?.consent_privacy !== true) return "Se requiere aceptar el aviso de privacidad.";
  return { name, email, phone: phone || undefined, consent_privacy: true, consent_marketing: x?.consent_marketing === true };
}

export function parseSetup(x: any): Setup | string {
  if (x?.target_type !== "self" && x?.target_type !== "other") return "Falta indicar sobre quién se responde.";
  if (!AGE_BANDS.some((a) => a.value === x?.age_band)) return "Falta el rango de edad.";
  return { target_type: x.target_type, age_band: x.age_band, subject_name: clip(x?.subject_name, 120) || undefined };
}

export function parseAnswers(x: any): Answers | string {
  const out: Answers = {};
  for (let i = 1; i <= 36; i++) {
    const v = x?.[i] ?? x?.[String(i)];
    if (v === null) out[i] = null;
    else if (Number.isInteger(v) && v >= 0 && v <= 4) out[i] = v;
    else return `Falta la respuesta a la pregunta ${i}.`;
  }
  return out;
}

export function parseContext(x: any): ContextAnswers | string {
  const out: ContextAnswers = { q40: [], q42: [] };
  for (const q of CONTEXT_QUESTIONS) {
    const keys = q.options.map((o) => o.key);
    const raw = x?.[`q${q.id}`];
    if (q.multiple) {
      const arr = Array.isArray(raw) ? Array.from(new Set(raw.filter((k: unknown) => typeof k === "string" && keys.includes(k)))) as string[] : [];
      if (!arr.length) return `Falta la respuesta a la pregunta ${q.id}.`;
      if (q.max && arr.length > q.max) return `La pregunta ${q.id} admite hasta ${q.max} opciones.`;
      const excl = q.options.filter((o) => o.exclusive).map((o) => o.key);
      (out as any)[`q${q.id}`] = arr.some((k) => excl.includes(k)) ? arr.filter((k) => excl.includes(k)).slice(0, 1) : arr;
    } else {
      if (typeof raw !== "string" || !keys.includes(raw)) return `Falta la respuesta a la pregunta ${q.id}.`;
      (out as any)[`q${q.id}`] = raw;
    }
  }
  return out;
}

export function parseUtm(x: any): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) { const v = clip(x?.[k], 120); if (v) out[k] = v; }
  return out;
}
