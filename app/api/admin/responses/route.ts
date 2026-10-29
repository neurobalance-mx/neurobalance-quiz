import { NextResponse } from "next/server";
import { listResponses } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const rows = await listResponses({ limit: 500, status: u.searchParams.get("status") || undefined, result: u.searchParams.get("result") || undefined });
  return NextResponse.json({ rows });
}
