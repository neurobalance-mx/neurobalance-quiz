// Envío de cada respuesta completada a los destinos configurados en /admin.
import type { AppSettings } from "./settings";
import type { FlatPayload } from "./payload";

export interface IntegrationLog { target: string; ok: boolean; status?: number; error?: string; at: string }

async function post(url: string, body: unknown, headers: Record<string, string> = {}, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: ctrl.signal,
      redirect: "follow", // Google Apps Script responde con redirección
    });
    return { ok: res.ok, status: res.status, text: res.ok ? "" : (await res.text()).slice(0, 300) };
  } finally {
    clearTimeout(t);
  }
}

async function ghlApiUpsert(s: AppSettings["integrations"]["ghl"], p: FlatPayload) {
  const tags = [
    ...s.tags.split(",").map((t) => t.trim()).filter(Boolean),
    p.result ? `neurobalance-${p.result}` : "",
  ].filter(Boolean);
  return post(
    "https://services.leadconnectorhq.com/contacts/upsert",
    {
      locationId: s.location_id,
      firstName: p.first_name,
      lastName: p.last_name,
      name: p.name,
      email: p.email,
      phone: p.phone || undefined,
      source: "Quiz Perfil Cerebral Neurobalance",
      tags,
    },
    { Authorization: `Bearer ${s.api_token}`, Version: "2021-07-28" }
  );
}

export async function dispatchIntegrations(settings: AppSettings, payload: FlatPayload, only?: string): Promise<IntegrationLog[]> {
  const i = settings.integrations;
  const jobs: { target: string; run: () => Promise<{ ok: boolean; status: number; text: string }> }[] = [];
  const want = (t: string) => !only || only === t;

  if (want("ghl") && i.ghl.enabled) {
    if (i.ghl.mode === "api" && i.ghl.api_token && i.ghl.location_id) jobs.push({ target: "ghl_api", run: () => ghlApiUpsert(i.ghl, payload) });
    if (i.ghl.mode === "webhook" && i.ghl.webhook_url) jobs.push({ target: "ghl_webhook", run: () => post(i.ghl.webhook_url, payload) });
  }
  if (want("google_sheets") && i.google_sheets.enabled && i.google_sheets.webhook_url)
    jobs.push({ target: "google_sheets", run: () => post(i.google_sheets.webhook_url, { secret: i.google_sheets.secret, row: payload }) });
  if (want("microsoft") && i.microsoft.enabled && i.microsoft.webhook_url)
    jobs.push({ target: "microsoft", run: () => post(i.microsoft.webhook_url, payload) });
  if (want("custom_webhook") && i.custom_webhook.enabled && i.custom_webhook.url)
    jobs.push({
      target: "custom_webhook",
      run: () => post(i.custom_webhook.url, payload, i.custom_webhook.secret ? { "X-Webhook-Secret": i.custom_webhook.secret } : {}),
    });

  const results = await Promise.allSettled(jobs.map((j) => j.run()));
  const at = new Date().toISOString();
  return results.map((r, idx) =>
    r.status === "fulfilled"
      ? { target: jobs[idx].target, ok: r.value.ok, status: r.value.status, error: r.value.ok ? undefined : r.value.text, at }
      : { target: jobs[idx].target, ok: false, error: String((r.reason as Error)?.message || r.reason), at }
  );
}
