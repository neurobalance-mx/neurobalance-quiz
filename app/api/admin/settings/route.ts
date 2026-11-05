import { NextResponse } from "next/server";
import { getSettings, saveSettings, usingMemory } from "@/lib/store";
import { mergeSettings } from "@/lib/settings";
import { resendConfigured } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ settings: await getSettings(), memory: usingMemory(), resend: resendConfigured() });
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  const s = mergeSettings(body?.settings);
  const t = s.thresholds;
  const bad =
    !(t.profile_diff >= 0 && t.profile_diff <= 100) ||
    !(t.min_strength_valid >= 1 && t.min_strength_valid <= 12) ||
    !(t.min_challenge_valid >= 1 && t.min_challenge_valid <= 6) ||
    !(t.challenge_flag_value >= 1 && t.challenge_flag_value <= 4);
  const k = s.kids;
  const inRange = (v: number) => Number.isFinite(v) && v >= 0 && v <= 100;
  if (![k.intensity_moderate, k.intensity_marked, k.imbalance_clear, k.imbalance_marked, k.both_high].every(inRange) ||
      k.intensity_moderate >= k.intensity_marked || k.imbalance_clear >= k.imbalance_marked)
    return NextResponse.json({ error: "Revisa los umbrales de niños: valores de 0 a 100, y el nivel «marcado» debe ser mayor que el anterior." }, { status: 400 });
  if (bad) return NextResponse.json({ error: "Revisa los umbrales: diferencia 0–100, fortalezas 1–12, retos 1–6, reto señalado 1–4." }, { status: 400 });
  await saveSettings(s);
  return NextResponse.json({ settings: s });
}
