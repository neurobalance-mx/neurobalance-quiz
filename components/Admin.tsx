"use client";

import { useEffect, useMemo, useState } from "react";
import type { AppSettings } from "@/lib/settings";
import type { ResponseRow } from "@/lib/store";
import { AGE_BANDS } from "@/lib/questions";
import Hemispheres from "./Hemispheres";

type Tab = "responses" | "rules" | "integrations";
const RESULT_LABEL: Record<string, string> = { red: "Rojo", blue: "Azul", combined: "Combinado", insufficient: "Insuficiente" };
const RESULT_DOT: Record<string, string> = { red: "bg-nbred-500", blue: "bg-nbblue-500", combined: "bg-gradient-to-r from-nbred-500 to-nbblue-500", insufficient: "bg-ink-300" };

export default function Admin() {
  const [tab, setTab] = useState<Tab>("responses");
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [memory, setMemory] = useState(false);
  const [rows, setRows] = useState<ResponseRow[]>([]);
  const [filter, setFilter] = useState<{ status: string; result: string }>({ status: "", result: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<ResponseRow | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((d) => { setSettings(d.settings); setMemory(d.memory); });
  }, []);
  useEffect(() => {
    const q = new URLSearchParams(Object.entries(filter).filter(([, v]) => v));
    fetch(`/api/admin/responses?${q}`).then((r) => r.json()).then((d) => setRows(d.rows || []));
  }, [filter]);

  const stats = useMemo(() => {
    const done = rows.filter((r) => r.status === "completed");
    const by = (k: string) => done.filter((r) => r.result === k).length;
    return { total: rows.length, done: done.length, red: by("red"), blue: by("blue"), combined: by("combined"), insufficient: by("insufficient") };
  }, [rows]);

  async function save() {
    if (!settings) return;
    setSaving(true); setMsg(null);
    const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings }) });
    const d = await res.json();
    setSaving(false);
    if (res.ok) { setSettings(d.settings); setMsg({ ok: true, text: "Cambios guardados." }); }
    else setMsg({ ok: false, text: d.error || "No se pudieron guardar los cambios." });
  }

  async function test(target: string) {
    setMsg({ ok: true, text: "Enviando prueba…" });
    await save();
    const res = await fetch("/api/admin/test-integrations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ target }) });
    const d = await res.json();
    if (!d.log?.length) return setMsg({ ok: false, text: d.message || "Activa la integración y agrega su URL antes de probar." });
    const failed = d.log.filter((l: any) => !l.ok);
    setMsg(failed.length
      ? { ok: false, text: `Falló el envío (${failed.map((f: any) => `${f.target}: ${f.status ?? ""} ${f.error ?? ""}`).join("; ")})` }
      : { ok: true, text: "Prueba enviada correctamente. Revisa que la fila o el contacto haya llegado." });
  }

  const set = (fn: (s: AppSettings) => void) => setSettings((s) => { if (!s) return s; const c = structuredClone(s); fn(c); return c; });

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5"><Hemispheres size={24} /><span className="text-lg font-semibold">Panel Neurobalance</span></div>
        <form action="/api/admin/logout" method="post"><button className="btn-ghost text-sm">Cerrar sesión</button></form>
      </header>

      {memory && (
        <p className="mt-4 rounded-lg bg-nbred-50 p-3 text-sm text-nbred-700">
          Modo demostración: no hay conexión a Supabase, así que los datos viven en memoria y se borran al reiniciar. Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
        </p>
      )}

      <nav className="mt-6 flex gap-1 border-b border-ink-100">
        {([["responses", "Respuestas"], ["rules", "Reglas y guías"], ["integrations", "Integraciones"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => { setTab(k); setMsg(null); }}
            className={`-mb-px border-b-2 px-4 py-2.5 text-[15px] font-medium ${tab === k ? "border-ink-900 text-ink-900" : "border-transparent text-ink-500 hover:text-ink-900"}`}>{l}</button>
        ))}
      </nav>

      {msg && <p className={`mt-4 rounded-lg p-3 text-sm ${msg.ok ? "bg-nbblue-50 text-nbblue-700" : "bg-nbred-50 text-nbred-700"}`}>{msg.text}</p>}

      {tab === "responses" && (
        <section className="mt-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
            {[["Registros", stats.total], ["Completados", stats.done], ["Rojo", stats.red], ["Azul", stats.blue], ["Combinado", stats.combined], ["Insuficiente", stats.insufficient]].map(([l, v]) => (
              <div key={l as string} className="rounded-xl bg-white p-4 ring-1 ring-ink-100">
                <p className="text-2xl font-semibold tabular-nums">{v}</p><p className="text-sm text-ink-500">{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <select className="field w-auto py-2 text-sm" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
              <option value="">Todos los estados</option><option value="completed">Completados</option><option value="started">Sin terminar</option>
            </select>
            <select className="field w-auto py-2 text-sm" value={filter.result} onChange={(e) => setFilter({ ...filter, result: e.target.value })}>
              <option value="">Todos los perfiles</option>
              {Object.entries(RESULT_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
            <a href={`/api/admin/export${filter.status ? `?status=${filter.status}` : ""}`} className="btn-primary ml-auto py-2 text-sm">Exportar CSV</a>
          </div>
          <div className="mt-4 overflow-x-auto rounded-xl bg-white ring-1 ring-ink-100">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-ink-100 text-ink-500">
                <tr>{["Fecha", "Nombre", "Correo", "Sobre", "Edad", "Perfil", "FL", "FR", "RL", "RR", "Envíos"].map((h) => <th key={h} className="px-3 py-2.5 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {rows.length === 0 && <tr><td colSpan={11} className="px-3 py-8 text-center text-ink-500">Aún no hay respuestas. Comparte el quiz para empezar a recibirlas.</td></tr>}
                {rows.map((r) => {
                  const log = (r.integrations_log as any[]) || [];
                  return (
                    <tr key={r.id} className="cursor-pointer hover:bg-ink-50" onClick={() => setSelected(r)}>
                      <td className="whitespace-nowrap px-3 py-2.5 text-ink-500">{new Date(r.created_at).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}</td>
                      <td className="px-3 py-2.5 font-medium">{r.name}</td>
                      <td className="px-3 py-2.5">{r.email}</td>
                      <td className="px-3 py-2.5">{r.target_type === "other" ? "Otra persona" : r.target_type === "self" ? "Sí mismo" : "—"}</td>
                      <td className="px-3 py-2.5">{AGE_BANDS.find((a) => a.value === r.age_band)?.label ?? "—"}</td>
                      <td className="px-3 py-2.5">{r.result ? <span className="inline-flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full ${RESULT_DOT[r.result]}`} />{RESULT_LABEL[r.result]}</span> : <span className="text-ink-500">Sin terminar</span>}</td>
                      {[r.fl, r.fr, r.rl, r.rr].map((v, i) => <td key={i} className="px-3 py-2.5 tabular-nums">{v === null || v === undefined ? "—" : Math.round(Number(v))}</td>)}
                      <td className="px-3 py-2.5">{log.length ? (log.every((l) => l.ok) ? <span className="text-nbblue-600">OK</span> : <span className="text-nbred-600">Error</span>) : <span className="text-ink-300">—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {selected && (
            <div className="fixed inset-0 z-50 flex justify-end bg-ink-900/30" onClick={() => setSelected(null)}>
              <aside className="h-full w-full max-w-md overflow-y-auto bg-white p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between">
                  <div><p className="text-lg font-semibold">{selected.name}</p><p className="text-sm text-ink-500">{selected.email}{selected.phone ? ` · ${selected.phone}` : ""}</p></div>
                  <button className="btn-ghost -mr-3 -mt-2" onClick={() => setSelected(null)}>Cerrar</button>
                </div>
                <dl className="mt-5 space-y-2 text-sm">
                  <Row k="Persona evaluada" v={selected.subject_name || (selected.target_type === "self" ? "La misma persona" : "—")} />
                  <Row k="Acepta información comercial" v={selected.consent_marketing ? "Sí" : "No"} />
                  <Row k="Versión del quiz" v={selected.quiz_version} />
                  <Row k="Origen" v={Object.values(selected.utm || {}).join(" / ") || "—"} />
                </dl>
                <p className="mt-6 font-semibold">Respuestas P01–P36</p>
                <div className="mt-2 grid grid-cols-6 gap-1.5 text-center text-xs">
                  {Array.from({ length: 36 }, (_, i) => {
                    const v = selected.answers?.[String(i + 1)];
                    return <div key={i} className="rounded bg-ink-50 py-1.5"><span className="block text-ink-500">{i + 1}</span><span className="font-semibold">{v === null ? "N/O" : v ?? "—"}</span></div>;
                  })}
                </div>
                <p className="mt-6 font-semibold">Envíos a integraciones</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {((selected.integrations_log as any[]) || []).map((l, i) => (
                    <li key={i} className={l.ok ? "text-nbblue-700" : "text-nbred-700"}>{l.target}: {l.ok ? "enviado" : `error ${l.status ?? ""} ${l.error ?? ""}`}</li>
                  ))}
                  {!(selected.integrations_log as any[])?.length && <li className="text-ink-500">Sin envíos registrados.</li>}
                </ul>
              </aside>
            </div>
          )}
        </section>
      )}

      {tab === "rules" && settings && (
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card title="Reglas de resultado" note="Valores provisionales del piloto. No son puntos de corte clínicos.">
            <Num label="Diferencia mínima FL − FR para asignar rojo o azul" value={settings.thresholds.profile_diff} min={0} max={100} onChange={(v) => set((s) => { s.thresholds.profile_diff = v; })} />
            <Num label="Respuestas válidas mínimas por bloque de fortalezas (de 12)" value={settings.thresholds.min_strength_valid} min={1} max={12} onChange={(v) => set((s) => { s.thresholds.min_strength_valid = v; })} />
            <Num label="Respuestas válidas mínimas por bloque de retos (de 6)" value={settings.thresholds.min_challenge_valid} min={1} max={6} onChange={(v) => set((s) => { s.thresholds.min_challenge_valid = v; })} />
            <label className="block">
              <span className="mb-1.5 block text-[15px] font-medium">Un reto se muestra como señalado desde</span>
              <select className="field" value={settings.thresholds.challenge_flag_value} onChange={(e) => set((s) => { s.thresholds.challenge_flag_value = Number(e.target.value); })}>
                <option value={2}>A veces</option><option value={3}>Frecuentemente</option><option value={4}>Casi siempre</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[15px] font-medium">Menores de 6 años</span>
              <select className="field" value={settings.early_age_mode} onChange={(e) => set((s) => { s.early_age_mode = e.target.value as any; })}>
                <option value="insufficient">No asignar perfil ni mostrar puntajes (recomendado hasta tener la versión adaptada)</option>
                <option value="score">Calcular igual que los demás rangos</option>
              </select>
            </label>
          </Card>
          <Card title="Guías y textos">
            <Text label="URL de la guía roja (PDF)" value={settings.guides.red_url} onChange={(v) => set((s) => { s.guides.red_url = v; })} />
            <Text label="URL de la guía azul (PDF)" value={settings.guides.blue_url} onChange={(v) => set((s) => { s.guides.blue_url = v; })} />
            <Text label="URL del aviso de privacidad" value={settings.privacy_url} onChange={(v) => set((s) => { s.privacy_url = v; })} />
            <Text label="Nota bajo los botones de descarga" hint="Usa {email} para insertar el correo. Vacío = no mostrar." value={settings.email_note}
              placeholder="También te enviamos el material a {email}." onChange={(v) => set((s) => { s.email_note = v; })} />
          </Card>
          <div className="lg:col-span-2"><button className="btn-primary" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</button></div>
        </section>
      )}

      {tab === "integrations" && settings && (
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card title="GoHighLevel" toggle={settings.integrations.ghl.enabled} onToggle={(v) => set((s) => { s.integrations.ghl.enabled = v; })}
            note="Webhook: dispara un workflow con todos los campos (recomendado para mapear campos personalizados y enviar la guía por correo). API: crea o actualiza el contacto con etiquetas.">
            <label className="block">
              <span className="mb-1.5 block text-[15px] font-medium">Modo</span>
              <select className="field" value={settings.integrations.ghl.mode} onChange={(e) => set((s) => { s.integrations.ghl.mode = e.target.value as any; })}>
                <option value="webhook">Inbound webhook (workflow)</option><option value="api">API v2 (contacto + etiquetas)</option>
              </select>
            </label>
            {settings.integrations.ghl.mode === "webhook" ? (
              <Text label="URL del inbound webhook" value={settings.integrations.ghl.webhook_url} onChange={(v) => set((s) => { s.integrations.ghl.webhook_url = v; })} />
            ) : (
              <>
                <Text label="Private integration token" secret value={settings.integrations.ghl.api_token} onChange={(v) => set((s) => { s.integrations.ghl.api_token = v; })} />
                <Text label="Location ID (subcuenta)" value={settings.integrations.ghl.location_id} onChange={(v) => set((s) => { s.integrations.ghl.location_id = v; })} />
                <Text label="Etiquetas (separadas por coma)" hint="Se agrega automáticamente neurobalance-red, -blue, -combined o -insufficient." value={settings.integrations.ghl.tags} onChange={(v) => set((s) => { s.integrations.ghl.tags = v; })} />
              </>
            )}
            <button className="btn-ghost -ml-5 text-sm" onClick={() => test("ghl")}>Enviar prueba</button>
          </Card>

          <Card title="Google Sheets" toggle={settings.integrations.google_sheets.enabled} onToggle={(v) => set((s) => { s.integrations.google_sheets.enabled = v; })}
            note="Pega la URL de la Web App de Apps Script (el código está en el README). Cada respuesta agrega una fila.">
            <Text label="URL de la Web App" value={settings.integrations.google_sheets.webhook_url} onChange={(v) => set((s) => { s.integrations.google_sheets.webhook_url = v; })} />
            <Text label="Clave secreta" hint="La misma que pongas en el script." secret value={settings.integrations.google_sheets.secret} onChange={(v) => set((s) => { s.integrations.google_sheets.secret = v; })} />
            <button className="btn-ghost -ml-5 text-sm" onClick={() => test("google_sheets")}>Enviar prueba</button>
          </Card>

          <Card title="Microsoft (Excel, SharePoint, Dataverse)" toggle={settings.integrations.microsoft.enabled} onToggle={(v) => set((s) => { s.integrations.microsoft.enabled = v; })}
            note="Crea un flujo en Power Automate con el disparador «Cuando se recibe una solicitud HTTP» y pega aquí su URL.">
            <Text label="URL del flujo de Power Automate" value={settings.integrations.microsoft.webhook_url} onChange={(v) => set((s) => { s.integrations.microsoft.webhook_url = v; })} />
            <button className="btn-ghost -ml-5 text-sm" onClick={() => test("microsoft")}>Enviar prueba</button>
          </Card>

          <Card title="Webhook genérico" toggle={settings.integrations.custom_webhook.enabled} onToggle={(v) => set((s) => { s.integrations.custom_webhook.enabled = v; })}
            note="Para Zapier, Make, n8n u otro CRM. Envía el mismo JSON con todos los campos.">
            <Text label="URL" value={settings.integrations.custom_webhook.url} onChange={(v) => set((s) => { s.integrations.custom_webhook.url = v; })} />
            <Text label="Encabezado X-Webhook-Secret" hint="Opcional" secret value={settings.integrations.custom_webhook.secret} onChange={(v) => set((s) => { s.integrations.custom_webhook.secret = v; })} />
            <button className="btn-ghost -ml-5 text-sm" onClick={() => test("custom_webhook")}>Enviar prueba</button>
          </Card>
          <div className="lg:col-span-2"><button className="btn-primary" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</button></div>
        </section>
      )}
    </main>
  );
}

function Card({ title, note, toggle, onToggle, children }: { title: string; note?: string; toggle?: boolean; onToggle?: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-5 ring-1 ring-ink-100">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl">{title}</h2>
        {onToggle && (
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" className="h-5 w-5 accent-ink-900" checked={!!toggle} onChange={(e) => onToggle(e.target.checked)} />Activa
          </label>
        )}
      </div>
      {note && <p className="mt-1.5 text-sm text-ink-500">{note}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}
function Text({ label, hint, value, onChange, secret, placeholder }: { label: string; hint?: string; value: string; onChange: (v: string) => void; secret?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[15px] font-medium">{label}</span>
      <input className="field text-sm" type={secret ? "password" : "text"} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} autoComplete="off" />
      {hint && <span className="mt-1 block text-xs text-ink-500">{hint}</span>}
    </label>
  );
}
function Num({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[15px] font-medium">{label}</span>
      <input className="field w-32" type="number" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-4"><dt className="text-ink-500">{k}</dt><dd className="text-right">{v}</dd></div>;
}
