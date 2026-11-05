import { NextResponse } from "next/server";
import { createResponse, getSettings, updateResponse } from "@/lib/store";
import { KIDS_AGE_BANDS, COMMUNICATION_OPTIONS, KIDS_ITEMS, KIDS_QUIZ_VERSION, childRef, itemCode, normalizeKidsAnswers, scoreKids, type Communication, type KidsAgeBand } from "@/lib/kids";
import { kidsGuide, sendKidsEmail } from "@/lib/kids-email";
import { publicOrigin } from "@/lib/result";
import { buildPayload } from "@/lib/payload";
import { dispatchIntegrations } from "@/lib/integrations";
import { parseUtm } from "@/lib/validate";

export const maxDuration = 25;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clip = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const age = b?.age_band as KidsAgeBand;
  const communication = b?.communication as Communication;
  const email = clip(b?.email, 160).toLowerCase();
  if (!KIDS_AGE_BANDS.some((a) => a.value === age)) return bad("Falta la edad.");
  if (!COMMUNICATION_OPTIONS.some((c) => c.value === communication)) return bad("Falta la forma de comunicarse.");
  if (!EMAIL_RE.test(email)) return bad("El correo no es válido.");
  if (b?.consent_results !== true) return bad("Acepta recibir los resultados por correo para continuar.");

  // Solo se aceptan casillas del banco (1–48); lo no mostrado por edad queda null.
  const raw: Record<number, unknown> = {};
  const marked: unknown[] = Array.isArray(b?.marked) ? b.marked : [];
  for (const id of marked) if (Number.isInteger(id) && (id as number) >= 1 && (id as number) <= KIDS_ITEMS.length) raw[id as number] = 1;
  const answers = normalizeKidsAnswers(raw, age);

  try {
    const settings = await getSettings();
    const scores = scoreKids(answers, settings.kids);
    if (scores.result === "none") return bad("No marcaste ninguna conducta. Revisa tus respuestas.");

    const childName = clip(b?.child_name, 80) || null;
    const parentName = clip(b?.parent_name, 120);
    const origin = publicOrigin(req);
    const guide = kidsGuide(settings, scores.result, origin);

    const row = await createResponse({
      status: "completed",
      quiz_type: "kids",
      quiz_version: KIDS_QUIZ_VERSION,
      name: parentName,
      email,
      phone: null,
      consent_privacy: true, // consent_results
      consent_marketing: b?.consent_marketing === true,
      target_type: "other",
      age_band: age,
      subject_name: childName,
      answers: Object.fromEntries(KIDS_ITEMS.map((i) => [itemCode(i.id), answers[i.id]])) as any,
      result: scores.result,
      guide_urls: [guide.url],
      utm: parseUtm(b?.utm),
      details: {
        communication,
        PR: scores.PR, PA: scores.PA, total: scores.total,
        intensity: scores.intensity, imbalance: scores.imbalance, bothHigh: scores.bothHigh, tieBreak: scores.tieBreak,
        areas: scores.areas, marked: scores.marked,
        sent_at: null, guide_sent: scores.result, resend_count: 0,
      },
      user_agent: (req.headers.get("user-agent") || "").slice(0, 300),
    } as any);

    const [emailLog, log] = await Promise.all([
      sendKidsEmail({ to: email, parentName, childName, communication, scores, origin }, settings),
      dispatchIntegrations(settings, buildPayload(row)).catch(() => []),
    ]);
    await updateResponse(row.id, {
      integrations_log: [emailLog, ...log],
      details: { ...row.details, sent_at: emailLog.ok ? emailLog.at : null },
    }).catch((e) => console.error("kids update", e));

    return NextResponse.json({
      id: row.id,
      emailOk: emailLog.ok,
      email,
      childRef: childRef(childName),
      bookingUrl: settings.kids.booking_url,
    });
  } catch (e) {
    console.error("kids submit", e);
    return NextResponse.json({ error: "No pudimos guardar tus respuestas. Inténtalo de nuevo en un momento." }, { status: 500 });
  }
}

function bad(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}
