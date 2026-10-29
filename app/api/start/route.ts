import { NextResponse } from "next/server";
import { createResponse } from "@/lib/store";
import { parseLead, parseUtm } from "@/lib/validate";
import { QUIZ_VERSION } from "@/lib/questions";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const lead = parseLead(body?.lead);
  if (typeof lead === "string") return NextResponse.json({ error: lead }, { status: 400 });
  try {
    const row = await createResponse({
      status: "started", quiz_version: QUIZ_VERSION,
      name: lead.name, email: lead.email, phone: lead.phone ?? null,
      consent_privacy: lead.consent_privacy, consent_marketing: lead.consent_marketing,
      utm: parseUtm(body?.utm),
      user_agent: (req.headers.get("user-agent") || "").slice(0, 300),
    } as any);
    return NextResponse.json({ id: row.id });
  } catch (e) {
    console.error("start", e);
    return NextResponse.json({ error: "No pudimos registrar tus datos." }, { status: 500 });
  }
}
