import { NextResponse } from "next/server";
import { getSettings } from "@/lib/store";
import { dispatchIntegrations } from "@/lib/integrations";
import { buildPayload } from "@/lib/payload";
import type { ResponseRow } from "@/lib/store";

// Envía una respuesta de ejemplo a la integración indicada (o a todas) para validar la conexión.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const settings = await getSettings();
  const now = new Date().toISOString();
  const sample: ResponseRow = {
    id: "00000000-0000-0000-0000-000000000000", created_at: now, updated_at: now, status: "completed", quiz_version: "v1",
    name: "Prueba Neurobalance", email: "prueba@ejemplo.com", phone: "", consent_privacy: true, consent_marketing: false,
    target_type: "self", age_band: "18_plus", subject_name: null,
    answers: Object.fromEntries(Array.from({ length: 36 }, (_, i) => [String(i + 1), (i % 5) as number])),
    context: { q37: "a", q38: "b", q39: "a", q40: ["a"], q41: "a", q42: ["h"] },
    fl: 75, fr: 50, rl: 25, rr: 40, result: "red", guide_urls: [settings.guides.red_url], utm: { utm_source: "prueba" }, integrations_log: null,
  };
  const log = await dispatchIntegrations(settings, buildPayload(sample), body?.target || undefined);
  if (!log.length) return NextResponse.json({ log, message: "No hay integraciones activas con URL configurada." });
  return NextResponse.json({ log });
}
