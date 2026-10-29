// Capa de datos: Supabase si hay credenciales; si no, memoria (solo para desarrollo local / demo).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { mergeSettings, type AppSettings } from "./settings";

export interface ResponseRow {
  id: string;
  created_at: string;
  updated_at: string;
  status: "started" | "completed";
  quiz_version: string;
  name: string;
  email: string;
  phone: string | null;
  consent_privacy: boolean;
  consent_marketing: boolean;
  target_type: string | null;
  age_band: string | null;
  subject_name: string | null;
  answers: Record<string, number | null> | null;
  context: Record<string, unknown> | null;
  fl: number | null;
  fr: number | null;
  rl: number | null;
  rr: number | null;
  result: string | null;
  guide_urls: string[] | null;
  utm: Record<string, string> | null;
  integrations_log: unknown[] | null;
}

let client: SupabaseClient | null = null;
function sb(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export const usingMemory = () => sb() === null;

// Almacén en memoria (se pierde al reiniciar).
const mem = ((globalThis as any).__nb ??= { responses: new Map<string, ResponseRow>(), settings: null as unknown });

export async function getSettings(): Promise<AppSettings> {
  const db = sb();
  if (!db) return mergeSettings(mem.settings);
  const { data, error } = await db.from("app_settings").select("data").eq("id", 1).maybeSingle();
  if (error) throw error;
  return mergeSettings(data?.data);
}

export async function saveSettings(s: AppSettings): Promise<void> {
  const db = sb();
  if (!db) { mem.settings = s; return; }
  const { error } = await db.from("app_settings").upsert({ id: 1, data: s, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function createResponse(row: Partial<ResponseRow>): Promise<ResponseRow> {
  const db = sb();
  if (!db) {
    const now = new Date().toISOString();
    const r = { id: crypto.randomUUID(), created_at: now, updated_at: now, status: "started", ...row } as ResponseRow;
    mem.responses.set(r.id, r);
    return r;
  }
  const { data, error } = await db.from("quiz_responses").insert(row).select().single();
  if (error) throw error;
  return data as ResponseRow;
}

export async function getResponse(id: string): Promise<ResponseRow | null> {
  const db = sb();
  if (!db) return mem.responses.get(id) ?? null;
  const { data, error } = await db.from("quiz_responses").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as ResponseRow) ?? null;
}

export async function updateResponse(id: string, patch: Partial<ResponseRow>): Promise<ResponseRow> {
  const db = sb();
  const updated_at = new Date().toISOString();
  if (!db) {
    const r = { ...(mem.responses.get(id) as ResponseRow), ...patch, updated_at };
    mem.responses.set(id, r);
    return r;
  }
  const { data, error } = await db.from("quiz_responses").update({ ...patch, updated_at }).eq("id", id).select().single();
  if (error) throw error;
  return data as ResponseRow;
}

export async function listResponses(opts: { limit?: number; status?: string; result?: string } = {}): Promise<ResponseRow[]> {
  const limit = opts.limit ?? 500;
  const db = sb();
  if (!db) {
    return [...mem.responses.values()]
      .filter((r: ResponseRow) => (!opts.status || r.status === opts.status) && (!opts.result || r.result === opts.result))
      .sort((a: ResponseRow, b: ResponseRow) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  }
  let q = db.from("quiz_responses").select("*").order("created_at", { ascending: false }).limit(limit);
  if (opts.status) q = q.eq("status", opts.status);
  if (opts.result) q = q.eq("result", opts.result);
  const { data, error } = await q;
  if (error) throw error;
  return (data as ResponseRow[]) ?? [];
}
