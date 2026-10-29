// Payload plano (una fila) que se envía a GHL, Google Sheets, Microsoft y webhooks, y que usa la exportación CSV.
import { CONTEXT_QUESTIONS, contextLabel, AGE_BANDS, type TargetType } from "./questions";
import { PROFILE_TEXTS } from "./texts";
import type { ResponseRow } from "./store";
import type { ResultKind } from "./types";

const RESULT_LABEL: Record<string, string> = {
  red: "Rojo", blue: "Azul", combined: "Combinado", insufficient: "Información insuficiente",
};
const ANSWER_LABEL = ["Nunca", "Rara vez", "A veces", "Frecuentemente", "Casi siempre"];

export type FlatPayload = Record<string, string | number | boolean | null>;

export function buildPayload(r: ResponseRow): FlatPayload {
  const target = (r.target_type as TargetType) || "self";
  const p: FlatPayload = {
    response_id: r.id,
    created_at: r.created_at,
    completed_at: r.status === "completed" ? r.updated_at : null,
    status: r.status,
    quiz_version: r.quiz_version,
    name: r.name,
    first_name: (r.name || "").trim().split(/\s+/)[0] || "",
    last_name: (r.name || "").trim().split(/\s+/).slice(1).join(" "),
    email: r.email,
    phone: r.phone || "",
    consent_privacy: r.consent_privacy,
    consent_marketing: r.consent_marketing,
    target_type: r.target_type,
    target_label: r.target_type === "other" ? "Sobre otra persona" : r.target_type === "self" ? "Sobre mí" : "",
    subject_name: r.subject_name || "",
    age_band: r.age_band,
    age_label: AGE_BANDS.find((a) => a.value === r.age_band)?.label || "",
    result: r.result,
    result_label: r.result ? RESULT_LABEL[r.result] : "",
    profile_name: r.result ? PROFILE_TEXTS[r.result as ResultKind].name : "",
    FL: r.fl, FR: r.fr, RL: r.rl, RR: r.rr,
    guide_urls: (r.guide_urls || []).join(" | "),
  };
  for (let i = 1; i <= 36; i++) {
    const v = r.answers?.[String(i)];
    p[`q${String(i).padStart(2, "0")}`] = v === undefined ? "" : v === null ? "No observado" : ANSWER_LABEL[v] ?? v;
  }
  for (const q of CONTEXT_QUESTIONS) {
    const raw = (r.context as any)?.[`q${q.id}`];
    const keys: string[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
    p[`q${q.id}`] = keys.map((k) => contextLabel(q.id, k, target)).join(" | ");
  }
  const utm = r.utm || {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) p[k] = utm[k] || "";
  return p;
}

export function toCSV(rows: FlatPayload[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}
