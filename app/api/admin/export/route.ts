import { listResponses } from "@/lib/store";
import { buildPayload, toCSV } from "@/lib/payload";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const rows = await listResponses({ limit: 10000, status: u.searchParams.get("status") || undefined });
  const csv = toCSV(rows.map(buildPayload));
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="neurobalance-respuestas-${date}.csv"` } });
}
