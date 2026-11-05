// Correo de resultados de la versión niños (el resultado solo se entrega por correo).
import type { AppSettings } from "./settings";
import type { IntegrationLog } from "./integrations";
import { sendEmail } from "./email";
import { absoluteUrl } from "./result";
import { KIDS_AREAS, KIDS_ITEMS, KIDS_PROFILE, childRef, type Communication, type KidsScores } from "./kids";

const NAVY = "#001634", MUTED = "#5E6678", LINE = "#E3E6EC", RED = "#C8323F", BLUE = "#2763B8";
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

export interface KidsEmailInput {
  to: string;
  parentName?: string | null;
  childName?: string | null;
  communication: Communication;
  scores: KidsScores;
  origin: string;
}

export function kidsGuide(settings: AppSettings, result: "red" | "blue", origin: string) {
  const url = result === "red" ? settings.kids.red_guide_url || settings.guides.red_url : settings.kids.blue_guide_url || settings.guides.blue_url;
  return {
    url: absoluteUrl(url, origin),
    filename: result === "red" ? "Neurobalance_Guia_Roja_Arquitecto_Verbal.pdf" : "Neurobalance_Guia_Azul_Integrador_Contextual.pdf",
  };
}

export function renderKidsEmail(i: KidsEmailInput, settings: AppSettings) {
  const k = settings.kids;
  const s = i.scores;
  if (s.result === "none") throw new Error("Sin conductas marcadas no se envía correo.");
  const profile = KIDS_PROFILE[s.result];
  const color = s.result === "red" ? RED : BLUE;
  const name = childRef(i.childName);
  const fill = (t: string) => t.replace(/\{nombre\}/g, name).replace(/\{perfil\}/g, profile.name);
  const subject = fill(k.subject);
  const guide = kidsGuide(settings, s.result, i.origin);
  const greeting = i.parentName?.trim() ? `Hola, ${i.parentName.trim().split(/\s+/)[0]}.` : "Hola.";

  // Texto del perfil: la primera oración va en cursiva, como en la especificación.
  const profileText = fill(s.result === "red" ? k.text_red : k.text_blue);
  const cut = profileText.indexOf(". ");
  const lead = cut > 0 ? profileText.slice(0, cut + 1) : profileText;
  const rest = cut > 0 ? profileText.slice(cut + 2) : "";

  const bar = (v: number | null, c: string) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:3px 0"><tr>
      <td style="padding:0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF0F4;border-radius:4px"><tr>
        <td width="${Math.max(1, v ?? 0)}%" style="background:${c};height:10px;border-radius:4px;font-size:0;line-height:0">&nbsp;</td><td style="font-size:0;line-height:0">&nbsp;</td>
      </tr></table></td>
      <td width="46" align="right" style="padding:0 0 0 8px;font-size:13px;font-weight:600;color:${NAVY};white-space:nowrap">${v === null ? "—" : `${v}%`}</td>
    </tr></table>`;

  const areas = s.areas.map((a) => `
    <tr><td style="padding:10px 0 2px;font-size:14px;font-weight:600;color:${NAVY}">${esc(a.title)}</td></tr>
    <tr><td>${bar(a.R, RED)}${bar(a.A, BLUE)}</td></tr>`).join("");

  const markedByArea = KIDS_AREAS.map((a) => ({
    title: a.title,
    items: KIDS_ITEMS.filter((it) => it.area === a.id && s.marked.includes(it.id)).map((it) => it.text),
  })).filter((g) => g.items.length);

  const h2 = (t: string) => `<h2 style="margin:30px 0 10px;font-family:Georgia,serif;font-size:20px;font-weight:600;color:${NAVY}">${t}</h2>`;
  const intensityLine = `Intensidad ${s.intensity} · desequilibrio ${s.imbalance}`;
  const comm = i.communication === "aac" ? fill(k.text_comm) : "";
  const btn = (href: string, label: string, bg: string, fg = "#ffffff", border = bg) =>
    `<a href="${esc(href)}" style="display:block;background:${bg};color:${fg};border:2px solid ${border};text-decoration:none;font-weight:600;font-size:15px;padding:13px 20px;border-radius:10px;text-align:center">${esc(label)}</a>`;

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#F4F6F9;font-family:Helvetica,Arial,sans-serif;color:${NAVY}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6F9"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;border:1px solid ${LINE}">
  <tr><td style="padding:28px 32px 8px"><img src="${i.origin}/logo-email.png" width="176" height="30" alt="Neurobalance" style="display:block;border:0;height:30px;width:auto"></td></tr>
  <tr><td style="padding:16px 32px 32px">
    <p style="margin:0 0 16px;font-size:16px;line-height:24px;color:#3D4557">${esc(greeting)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:4px solid ${color};background:#F7F8FA;border-radius:8px">
      <tr><td style="padding:20px 22px">
        <p style="margin:0;font-size:13px;font-weight:700;color:${color}">${profile.tag}</p>
        <p style="margin:6px 0 12px;font-family:Georgia,serif;font-size:26px;line-height:32px;color:${NAVY}">${profile.name}</p>
        <p style="margin:0;font-size:15px;line-height:23px;color:#3D4557"><em>${esc(lead)}</em>${rest ? ` ${esc(rest)}` : ""}</p>
      </td></tr>
    </table>

    ${h2("Resultados por área")}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 4px"><tr>
      <td style="padding:0 6px 0 0"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${RED}"></span></td>
      <td style="padding:0 16px 0 0;font-size:13px;color:${MUTED}">Perfil rojo · El Arquitecto Verbal</td>
      <td style="padding:0 6px 0 0"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${BLUE}"></span></td>
      <td style="font-size:13px;color:${MUTED}">Perfil azul · El Integrador Contextual</td>
    </tr></table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${areas}</table>

    <p style="margin:22px 0 0;padding:14px 16px;background:#F7F8FA;border-radius:8px;font-size:15px;font-weight:600;color:${NAVY}">${esc(intensityLine)}</p>
    ${s.bothHigh ? `<p style="margin:10px 0 0;font-size:15px;line-height:23px;color:#3D4557">${esc(k.text_both)}</p>` : ""}

    ${h2("Conductas que marcaste")}
    ${markedByArea.map((g) => `
      <p style="margin:14px 0 4px;font-size:14px;font-weight:700;color:${NAVY}">${esc(g.title)}</p>
      <table role="presentation" cellpadding="0" cellspacing="0">${g.items.map((t) => `<tr><td width="16" valign="top" style="padding:3px 0;color:#9AA2B1;font-size:16px;line-height:21px">&#8226;</td><td style="padding:3px 0;font-size:14px;line-height:21px;color:#3D4557">${esc(t)}</td></tr>`).join("")}</table>`).join("")}

    ${comm ? `<p style="margin:24px 0 0;padding:14px 16px;border-left:3px solid ${color};font-size:15px;line-height:23px;color:#3D4557"><em>${esc(comm)}</em></p>` : ""}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px">
      <tr><td style="padding:0 0 10px">${btn(guide.url, `Descarga la guía de ${name}`, color)}</td></tr>
      <tr><td>${btn(k.booking_url, "Agenda una evaluación funcional", "#ffffff", NAVY, NAVY)}</td></tr>
    </table>

    <p style="margin:26px 0 0;font-size:15px;line-height:23px;color:#3D4557">${esc(k.text_closing)}</p>
    <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid ${LINE};font-size:12px;line-height:19px;color:${MUTED}"><em>${esc(k.disclaimer)}</em></p>
  </td></tr>
</table>
<p style="margin:16px 0 0;font-size:12px;color:${MUTED}">Recibiste este correo porque respondiste el Perfil Cerebral Neurobalance.</p>
</td></tr></table></body></html>`;

  const text = [
    greeting, "", `${profile.tag} · ${profile.name}`, profileText, "",
    "Resultados por área (rojo / azul):",
    ...s.areas.map((a) => `${a.title}: ${a.R ?? "—"}% / ${a.A ?? "—"}%`), "",
    intensityLine, ...(s.bothHigh ? [k.text_both] : []), "",
    "Conductas que marcaste:", ...markedByArea.flatMap((g) => [`${g.title}:`, ...g.items.map((t) => `- ${t}`)]), "",
    ...(comm ? [comm, ""] : []),
    `Descarga la guía de ${name}: ${guide.url}`, `Agenda una evaluación funcional: ${k.booking_url}`, "",
    k.text_closing, "", k.disclaimer,
  ].join("\n");

  return { subject, html, text, guide };
}

export async function sendKidsEmail(i: KidsEmailInput, settings: AppSettings): Promise<IntegrationLog> {
  const { subject, html, text, guide } = renderKidsEmail(i, settings);
  if (settings.kids.attach_pdf) {
    const withPdf = await sendEmail({ to: i.to, subject, html, text, attachments: [{ path: guide.url, filename: guide.filename }] }, settings);
    if (withPdf.ok) return withPdf;
    // Si el adjunto falla (URL inaccesible, tamaño), se reenvía sin él: el botón de descarga ya va en el correo.
    if (withPdf.status && withPdf.status >= 400 && withPdf.status < 500 && !/RESEND_API_KEY/.test(withPdf.error || "")) {
      const plain = await sendEmail({ to: i.to, subject, html, text }, settings);
      return plain.ok ? { ...plain, error: "Enviado sin adjunto" } : plain;
    }
    return withPdf;
  }
  return sendEmail({ to: i.to, subject, html, text }, settings);
}
