import { NextResponse } from "next/server";
import { getResponse, getSettings, updateResponse } from "@/lib/store";
import { KIDS_ITEMS, itemCode, scoreKids, type KidsAnswers } from "@/lib/kids";
import { sendKidsEmail } from "@/lib/kids-email";
import { publicOrigin } from "@/lib/result";

const MAX_RESENDS = 3;

// "Reenviar correo" desde la pantalla de confirmación. Solo reenvía al correo ya registrado.
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const id = typeof b?.id === "string" ? b.id : "";
  const row = id ? await getResponse(id).catch(() => null) : null;
  if (!row || row.quiz_type !== "kids") return NextResponse.json({ error: "No encontramos esta respuesta." }, { status: 404 });
  const d = row.details || {};
  if ((d.resend_count || 0) >= MAX_RESENDS) return NextResponse.json({ error: "Ya reenviamos el correo varias veces. Si no lo ves, revisa spam o escríbenos." }, { status: 429 });

  const settings = await getSettings();
  const answers: KidsAnswers = {};
  for (const i of KIDS_ITEMS) answers[i.id] = ((row.answers as any)?.[itemCode(i.id)] ?? null) as 0 | 1 | null;
  const scores = scoreKids(answers, settings.kids);
  if (scores.result === "none") return NextResponse.json({ error: "No hay conductas marcadas." }, { status: 400 });

  const log = await sendKidsEmail({ to: row.email, parentName: row.name, childName: row.subject_name, communication: d.communication, scores, origin: publicOrigin(req) }, settings);
  await updateResponse(row.id, {
    integrations_log: [...((row.integrations_log as any[]) || []), { ...log, target: "email_resend" }],
    details: { ...d, resend_count: (d.resend_count || 0) + 1, sent_at: log.ok ? log.at : d.sent_at },
  }).catch(() => {});
  return NextResponse.json({ ok: log.ok, error: log.ok ? undefined : "No pudimos enviar el correo. Inténtalo de nuevo en un momento." }, { status: log.ok ? 200 : 502 });
}
