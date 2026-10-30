// Envío del resultado por correo con Resend (https://resend.com). Requiere RESEND_API_KEY.
import type { AppSettings } from "./settings";
import type { QuizResult } from "./types";
import type { TargetType } from "./questions";
import { DISCLAIMER } from "./texts";
import type { IntegrationLog } from "./integrations";

const NAVY = "#001634", MUTED = "#5E6678", LINE = "#E3E6EC", RED = "#C8323F", BLUE = "#2763B8", BRAND = "#3FA3F4";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

export const resendConfigured = () => !!process.env.RESEND_API_KEY;

export interface EmailInput {
  to: string;
  name: string;
  target: TargetType;
  subjectName?: string;
  result: QuizResult;
  origin: string;
}

export function renderResultEmail(i: EmailInput, settings: AppSettings) {
  const r = i.result;
  const first = (i.name || "").trim().split(/\s+/)[0] || "";
  const who = i.target === "other" ? i.subjectName || "la persona evaluada" : null;
  const accent = r.result === "red" ? RED : r.result === "blue" ? BLUE : NAVY;
  const subject = settings.email.subject.replace("{nombre}", first).replace("{perfil}", r.profile.name).trim();

  const bar = (label: string, v: number | null, color: string) => `
    <tr><td style="padding:6px 0 2px;font-size:14px;color:${NAVY}">${label}</td>
        <td align="right" style="padding:6px 0 2px;font-size:14px;font-weight:600;color:${NAVY}">${v === null ? "Sin datos" : `${Math.round(v)}/100`}</td></tr>
    <tr><td colspan="2" style="padding:0 0 6px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF0F4;border-radius:4px"><tr>
        <td width="${Math.max(1, Math.round(v ?? 0))}%" style="background:${color};height:8px;border-radius:4px;font-size:0;line-height:0">&nbsp;</td>
        <td style="font-size:0;line-height:0">&nbsp;</td>
      </tr></table></td></tr>`;

  const list = (items: string[], dot: string) =>
    items.map((t) => `<tr><td width="18" valign="top" style="padding:4px 0;color:${dot};font-size:18px;line-height:20px">&#8226;</td><td style="padding:4px 0;font-size:15px;line-height:22px;color:#3D4557">${esc(t)}</td></tr>`).join("");

  const h2 = (t: string) => `<h2 style="margin:32px 0 10px;font-family:Georgia,serif;font-size:20px;font-weight:600;color:${NAVY}">${t}</h2>`;

  const scores = r.showScores ? `
    ${h2("Indicadores")}
    <p style="margin:0 0 12px;font-size:13px;color:${MUTED}">Cada indicador va de 0 a 100 y se calcula por separado.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td colspan="2" style="padding:4px 0;font-size:14px;font-weight:700;color:${NAVY}">Fortalezas</td></tr>
      ${bar("Hemisferio izquierdo", r.scores.FL, RED)}${bar("Hemisferio derecho", r.scores.FR, BLUE)}
      <tr><td colspan="2" style="padding:14px 0 4px;font-size:14px;font-weight:700;color:${NAVY}">Retos reportados</td></tr>
      ${bar("Hemisferio izquierdo", r.scores.RL, "#E39AA1")}${bar("Hemisferio derecho", r.scores.RR, "#93B1DC")}
    </table>` : "";

  const strengths = r.topCategories.length ? `${h2("Dónde destacan las fortalezas")}<table role="presentation" cellpadding="0" cellspacing="0">${list(r.topCategories, accent)}</table>` : "";
  const challenges = r.challenges.length ? `${h2("Habilidades que podrían requerir apoyo")}<table role="presentation" cellpadding="0" cellspacing="0">${list(r.challenges.map((c) => c.label), "#C9CED8")}</table>` : "";

  const buttons = r.guides.map((g) => `
    <tr><td style="padding:0 0 10px">
      <a href="${esc(g.url)}" style="display:block;background:${g.color === "red" ? RED : BLUE};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 20px;border-radius:10px;text-align:center">Descargar ${esc(g.label)}</a>
    </td></tr>`).join("");

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#F4F6F9;font-family:Helvetica,Arial,sans-serif;color:${NAVY}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6F9"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;border:1px solid ${LINE}">
  <tr><td style="padding:28px 32px 8px"><img src="${i.origin}/logo-email.png" width="176" height="30" alt="Neurobalance" style="display:block;border:0;height:30px;width:auto"></td></tr>
  <tr><td style="padding:16px 32px 32px">
    <p style="margin:0 0 16px;font-size:16px;line-height:24px;color:#3D4557">Hola ${esc(first)}, gracias por completar el Quiz de Perfil Cerebral Neurobalance. ${who ? `Este es el resultado de <strong>${esc(who)}</strong>.` : "Este es tu resultado."}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:4px solid ${accent};background:#F7F8FA;border-radius:8px">
      <tr><td style="padding:20px 22px">
        <p style="margin:0;font-size:13px;font-weight:700;color:${accent}">${esc(r.profile.tag)}</p>
        <p style="margin:6px 0 10px;font-family:Georgia,serif;font-size:26px;line-height:32px;color:${NAVY}">${esc(r.profile.name)}</p>
        <p style="margin:0;font-size:15px;line-height:23px;color:#3D4557">${esc(r.profile.description)}</p>
      </td></tr>
    </table>
    ${scores}${strengths}${challenges}
    ${h2(r.guides.length > 1 ? "Tus guías" : "Tu guía")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${buttons}</table>
    <p style="margin:28px 0 0;padding-top:18px;border-top:1px solid ${LINE};font-size:12px;line-height:19px;color:${MUTED}">${esc(DISCLAIMER)}</p>
  </td></tr>
</table>
<p style="margin:16px 0 0;font-size:12px;color:${MUTED}">Recibiste este correo porque respondiste el Quiz de Perfil Cerebral Neurobalance.</p>
</td></tr></table></body></html>`;

  const text = [
    `Hola ${first}, gracias por completar el Quiz de Perfil Cerebral Neurobalance.${who ? ` Resultado de ${who}.` : ""}`,
    "", `${r.profile.tag}: ${r.profile.name}`, r.profile.description, "",
    ...(r.showScores ? [`Fortalezas · izquierdo ${r.scores.FL ?? "—"}/100 · derecho ${r.scores.FR ?? "—"}/100`, `Retos · izquierdo ${r.scores.RL ?? "—"}/100 · derecho ${r.scores.RR ?? "—"}/100`, ""] : []),
    ...r.guides.map((g) => `${g.label}: ${g.url}`), "", DISCLAIMER,
  ].join("\n");

  return { subject, html, text };
}

export async function sendResultEmail(i: EmailInput, settings: AppSettings): Promise<IntegrationLog> {
  const at = new Date().toISOString();
  const key = process.env.RESEND_API_KEY;
  if (!key) return { target: "email", ok: false, error: "Falta RESEND_API_KEY", at };
  const { subject, html, text } = renderResultEmail(i, settings);
  const bcc = settings.email.bcc.split(",").map((s) => s.trim()).filter(Boolean);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: settings.email.from,
        to: [i.to],
        subject,
        html,
        text,
        ...(settings.email.reply_to ? { reply_to: settings.email.reply_to } : {}),
        ...(bcc.length ? { bcc } : {}),
      }),
      signal: ctrl.signal,
    });
    const body = await res.text();
    return { target: "email", ok: res.ok, status: res.status, error: res.ok ? undefined : body.slice(0, 300), at };
  } catch (e) {
    return { target: "email", ok: false, error: String((e as Error)?.message || e), at };
  } finally {
    clearTimeout(t);
  }
}
