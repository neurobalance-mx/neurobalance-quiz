import { NextResponse } from "next/server";
import { getSettings } from "@/lib/store";
import { buildResult, publicOrigin } from "@/lib/result";
import { sendResultEmail } from "@/lib/email";
import { FL_IDS, FR_IDS, RL_IDS, RR_IDS } from "@/lib/scoring";
import type { Answers } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Envía un correo de ejemplo (perfil rojo) a la dirección indicada, con la configuración guardada.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const to = String(body?.to || "").trim();
  if (!EMAIL_RE.test(to)) return NextResponse.json({ ok: false, error: "Escribe un correo válido para la prueba." }, { status: 400 });
  const settings = await getSettings();
  const answers: Answers = {};
  FL_IDS.forEach((i) => (answers[i] = 4)); FR_IDS.forEach((i) => (answers[i] = 2));
  RL_IDS.forEach((i) => (answers[i] = 1)); RR_IDS.forEach((i) => (answers[i] = 2)); answers[30] = 3;
  const origin = publicOrigin(req);
  const result = buildResult({
    id: "prueba", answers, context: { q40: ["a"], q42: ["h"], q37: "a", q38: "a", q39: "a", q41: "a" },
    ageBand: "18_plus", target: "self", email: to, settings, origin,
  });
  const log = await sendResultEmail({ to, name: "Prueba Neurobalance", target: "self", result, origin }, settings);
  return NextResponse.json(log, { status: log.ok ? 200 : 502 });
}
