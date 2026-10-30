import { NextResponse } from "next/server";
import { createResponse, getResponse, getSettings, updateResponse } from "@/lib/store";
import { parseAnswers, parseContext, parseLead, parseSetup, parseUtm } from "@/lib/validate";
import { buildResult, publicOrigin } from "@/lib/result";
import { sendResultEmail } from "@/lib/email";
import { DEFAULT_EMAIL_NOTE } from "@/lib/settings";
import { buildPayload } from "@/lib/payload";
import { dispatchIntegrations } from "@/lib/integrations";
import { QUIZ_VERSION } from "@/lib/questions";

export const maxDuration = 20;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const lead = parseLead(body?.lead);
  const setup = parseSetup(body?.setup);
  const answers = parseAnswers(body?.answers);
  const context = parseContext(body?.context);
  for (const v of [lead, setup, answers, context]) if (typeof v === "string") return NextResponse.json({ error: v }, { status: 400 });
  if (typeof lead === "string" || typeof setup === "string" || typeof answers === "string" || typeof context === "string") return;

  try {
    const settings = await getSettings();

    // Reutiliza el registro creado al inicio (si el correo coincide); si no, crea uno nuevo.
    let row = typeof body?.id === "string" ? await getResponse(body.id).catch(() => null) : null;
    if (!row || row.email !== lead.email || row.status === "completed") {
      row = await createResponse({
        status: "started", quiz_version: QUIZ_VERSION, name: lead.name, email: lead.email, phone: lead.phone ?? null,
        consent_privacy: true, consent_marketing: lead.consent_marketing, utm: parseUtm(body?.utm),
        user_agent: (req.headers.get("user-agent") || "").slice(0, 300),
      } as any);
    }

    const origin = publicOrigin(req);
    const result = buildResult({ id: row.id, answers, context, ageBand: setup.age_band, target: setup.target_type, email: lead.email, settings, origin });

    const saved = await updateResponse(row.id, {
      status: "completed",
      name: lead.name, phone: lead.phone ?? null, consent_marketing: lead.consent_marketing,
      target_type: setup.target_type, age_band: setup.age_band, subject_name: setup.subject_name ?? null,
      answers: Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, v])),
      context: context as any,
      fl: result.scores.FL, fr: result.scores.FR, rl: result.scores.RL, rr: result.scores.RR,
      result: result.result,
      guide_urls: result.guides.map((g) => g.url),
    });

    // Correo con el resultado + envío a GHL / Google Sheets / Microsoft / webhook, en paralelo.
    // Un fallo aquí nunca bloquea el resultado; queda registrado en integrations_log.
    try {
      const [emailLog, log] = await Promise.all([
        settings.email.enabled
          ? sendResultEmail({ to: lead.email, name: lead.name, target: setup.target_type, subjectName: setup.subject_name, result, origin }, settings)
          : Promise.resolve(null),
        dispatchIntegrations(settings, buildPayload(saved)),
      ]);
      const all = emailLog ? [emailLog, ...log] : log;
      if (all.length) await updateResponse(row.id, { integrations_log: all });
      if (emailLog?.ok) result.emailNote = (settings.email_note || DEFAULT_EMAIL_NOTE).replace("{email}", lead.email);
    } catch (e) { console.error("integrations", e); }

    return NextResponse.json(result);
  } catch (e) {
    console.error("submit", e);
    return NextResponse.json({ error: "No pudimos guardar tus respuestas. Inténtalo de nuevo en un momento." }, { status: 500 });
  }
}
