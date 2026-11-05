"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  KIDS_AREAS, KIDS_ITEMS, KIDS_AGE_BANDS, COMMUNICATION_OPTIONS, isShown, childRef,
  type KidsAgeBand, type Communication,
} from "@/lib/kids";
import { Shell, Progress, Field } from "./Quiz";

type Step = "welcome" | "data" | "area" | "email" | "none" | "done";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function KidsQuiz({ privacyUrl, disclaimer }: { privacyUrl: string; disclaimer: string }) {
  const [step, setStep] = useState<Step>("welcome");
  const [area, setArea] = useState(0); // 0–5
  const [childName, setChildName] = useState("");
  const [age, setAge] = useState<KidsAgeBand | null>(null);
  const [communication, setCommunication] = useState<Communication | null>(null);
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [parentName, setParentName] = useState("");
  const [email, setEmail] = useState("");
  const [consentResults, setConsentResults] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; emailOk: boolean; email: string; childRef: string; bookingUrl: string } | null>(null);
  const [resendMsg, setResendMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [utm, setUtm] = useState<Record<string, string>>({});
  const topRef = useRef<HTMLDivElement>(null);

  const name = childRef(childName);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const u: Record<string, string> = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((k) => { const v = p.get(k); if (v) u[k] = v; });
    setUtm(u);
  }, []);
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setShowErrors(false);
    setError(null);
  }, [step, area]);

  // Solo cuentan las casillas visibles para la edad elegida (si cambian la edad, 44–46 dejan de contar).
  const visibleMarked = useMemo(
    () => (age ? [...marked].filter((id) => isShown(KIDS_ITEMS[id - 1], age)) : []),
    [marked, age]
  );

  const toggle = (id: number) => setMarked((m) => { const n = new Set(m); n.has(id) ? n.delete(id) : n.add(id); return n; });

  function next() {
    if (step === "welcome") return setStep("data");
    if (step === "data") {
      if (!age || !communication) return setShowErrors(true);
      setArea(0);
      return setStep("area");
    }
    if (step === "area") {
      if (area < 5) return setArea((a) => a + 1);
      return setStep(visibleMarked.length === 0 ? "none" : "email");
    }
    if (step === "email") return submit();
  }

  function back() {
    if (step === "data") return setStep("welcome");
    if (step === "area") return area > 0 ? setArea((a) => a - 1) : setStep("data");
    if (step === "email" || step === "none") { setArea(5); return setStep("area"); }
  }

  async function submit() {
    if (!EMAIL_RE.test(email.trim()) || !consentResults) return setShowErrors(true);
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/kids/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_name: childName.trim() || undefined, age_band: age, communication, marked: visibleMarked,
          parent_name: parentName.trim() || undefined, email: email.trim(),
          consent_results: consentResults, consent_marketing: consentMarketing, utm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No pudimos enviar tus resultados.");
      setDone(data);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos enviar tus resultados. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (!done) return;
    setBusy(true);
    setResendMsg(null);
    try {
      const res = await fetch("/api/kids/resend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: done.id }) });
      const d = await res.json();
      setResendMsg(res.ok ? { ok: true, text: `Reenviamos el correo a ${done.email}.` } : { ok: false, text: d.error || "No pudimos reenviar el correo." });
      if (res.ok) setDone({ ...done, emailOk: true });
    } catch {
      setResendMsg({ ok: false, text: "No pudimos reenviar el correo. Revisa tu conexión." });
    } finally {
      setBusy(false);
    }
  }

  // ---------- Confirmación ----------
  if (step === "done" && done) {
    return (
      <Shell topRef={topRef}>
        <section className="pt-10">
          {done.emailOk ? (
            <>
              <h1 className="text-[2rem] leading-tight sm:text-4xl">Revisa tu correo</h1>
              <p className="mt-4 text-lg leading-relaxed text-ink-700">
                Enviamos los resultados de {done.childRef} a <strong className="text-ink-900">{done.email}</strong>. Si no los ves en unos minutos, revisa tu carpeta de spam o de promociones.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-[2rem] leading-tight sm:text-4xl">Tus respuestas están guardadas</h1>
              <p className="mt-4 text-lg leading-relaxed text-ink-700">
                No pudimos enviar el correo a <strong className="text-ink-900">{done.email}</strong> en este momento. Presiona «Reenviar correo» para intentarlo de nuevo.
              </p>
            </>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={done.bookingUrl} target="_blank" rel="noreferrer" className="btn-primary">Agenda una evaluación funcional</a>
            <button type="button" className="btn-ghost ring-1 ring-ink-300" onClick={resend} disabled={busy}>{busy ? "Enviando…" : "Reenviar correo"}</button>
          </div>
          {resendMsg && <p className={`mt-4 text-sm ${resendMsg.ok ? "text-nbblue-700" : "text-nbred-600"}`}>{resendMsg.text}</p>}
          <p className="mt-12 border-t border-ink-100 pt-6 text-sm italic text-ink-500">{disclaimer}</p>
        </section>
      </Shell>
    );
  }

  const areaInfo = KIDS_AREAS[area];
  const areaItems = age ? KIDS_ITEMS.filter((i) => i.area === areaInfo.id && isShown(i, age)) : [];

  return (
    <Shell topRef={topRef}>
      {step === "area" && <Progress value={(area + 1) / 6} label={`${area + 1} de 6`} />}

      {step === "welcome" && (
        <section className="pt-6 sm:pt-10">
          <h1 className="text-[2.1rem] leading-[1.12] sm:text-5xl">¿Cuál es el Perfil Cerebral de tu hijo?</h1>
          <p className="mt-5 text-[17px] leading-relaxed text-ink-700">
            El cerebro tiene dos hemisferios que crecen y trabajan en equipo. Cuando uno madura más rápido que el otro, aparecen señales en el cuerpo, las emociones, la conducta y el aprendizaje. Este ejercicio te ayuda a reconocer esas señales y a descubrir cuál es el perfil hemisférico que predomina en tu hijo.
          </p>
          <div className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-ink-100 sm:p-6">
            <h2 className="font-sans text-[17px] font-semibold">Cómo contestar</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-[16px] leading-relaxed text-ink-700 marker:text-ink-500">
              <li>Lee cada frase y márcala solo si describe a tu hijo hoy.</li>
              <li>Si no aplica, no lo has observado o todavía no corresponde a su edad, déjala sin marcar.</li>
              <li>Compáralo con otros niños de su misma edad.</li>
              <li>Si toma algún medicamento, piensa en cómo es sin él.</li>
              <li>No hay respuestas buenas ni malas. Tu primera impresión suele ser la más acertada.</li>
            </ol>
          </div>
          <p className="mt-6 text-sm text-ink-500">48 frases en 6 áreas · unos 8 minutos</p>
        </section>
      )}

      {step === "data" && (
        <section className="pt-4">
          <h2 className="text-3xl">Antes de empezar</h2>
          <div className="mt-7 space-y-8">
            <Field label="¿Cómo se llama tu hijo?" hint="Opcional">
              <input className="field" value={childName} maxLength={80} onChange={(e) => setChildName(e.target.value)} />
            </Field>
            <div>
              <p className="text-[15px] font-medium">¿Qué edad tiene?</p>
              <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {KIDS_AGE_BANDS.map((a) => (
                  <button key={a.value} type="button" className="opt py-3.5" aria-pressed={age === a.value} onClick={() => setAge(a.value)}>{a.label}</button>
                ))}
              </div>
              {showErrors && !age && <p className="mt-2 text-sm text-nbred-600">Elige un rango de edad.</p>}
            </div>
            <div>
              <p className="text-[15px] font-medium">¿Cómo se comunica principalmente?</p>
              <div className="mt-2.5 grid gap-2.5">
                {COMMUNICATION_OPTIONS.map((c) => (
                  <button key={c.value} type="button" className="opt py-3.5" aria-pressed={communication === c.value} onClick={() => setCommunication(c.value)}>{c.label}</button>
                ))}
              </div>
              {showErrors && !communication && <p className="mt-2 text-sm text-nbred-600">Elige una opción.</p>}
            </div>
          </div>
          <p className="mt-10 text-sm italic text-ink-500">{disclaimer}</p>
        </section>
      )}

      {step === "area" && (
        <section className="pt-6">
          <h2 className="text-3xl">{areaInfo.title}</h2>
          <p className="mt-2 text-ink-500">Marca solo las frases que describen a {name} hoy. Deja sin marcar las demás.</p>
          <ul className="mt-7 space-y-2.5">
            {areaItems.map((it) => {
              const on = marked.has(it.id);
              return (
                <li key={it.id}>
                  <button type="button" role="checkbox" aria-checked={on} onClick={() => toggle(it.id)}
                    className={`flex w-full items-start gap-3.5 rounded-xl border px-4 py-3.5 text-left text-[16px] leading-snug transition-colors ${on ? "border-ink-900 bg-ink-900 text-white" : "border-ink-300 bg-white text-ink-700 hover:border-ink-500"}`}>
                    <span aria-hidden="true" className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-2 ${on ? "border-white bg-white text-ink-900" : "border-ink-300"}`}>
                      {on && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 6.5 4.8 9 10 3" /></svg>}
                    </span>
                    <span>{it.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {step === "none" && (
        <section className="pt-10">
          <h2 className="text-3xl">No marcaste ninguna conducta</h2>
          <p className="mt-3 text-lg text-ink-700">Revisa tus respuestas. Si ninguna frase describe a {name}, puedes agendar una evaluación si tienes dudas.</p>
        </section>
      )}

      {step === "email" && (
        <section className="pt-6">
          <h2 className="text-3xl">¡Listo! El perfil de {name} está calculado.</h2>
          <p className="mt-3 text-[17px] text-ink-700">Escribe tu correo y te enviamos sus resultados y la guía que le corresponde.</p>
          <div className="mt-7 space-y-5">
            <Field label="Tu nombre" hint="Opcional">
              <input className="field" autoComplete="name" value={parentName} maxLength={120} onChange={(e) => setParentName(e.target.value)} />
            </Field>
            <Field label="Tu correo electrónico" error={showErrors && !EMAIL_RE.test(email.trim()) ? "Escribe un correo válido, por ejemplo nombre@correo.com." : undefined}>
              <input className="field" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <label className="flex items-start gap-3 text-[15px] text-ink-700">
              <input type="checkbox" className="mt-1 h-5 w-5 accent-ink-900" checked={consentResults} onChange={(e) => setConsentResults(e.target.checked)} />
              <span>Acepto recibir los resultados por correo. <a href={privacyUrl} target="_blank" rel="noreferrer" className="underline">Aviso de privacidad</a></span>
            </label>
            {showErrors && !consentResults && <p className="-mt-3 pl-8 text-sm text-nbred-600">Marca esta casilla para recibir los resultados.</p>}
            <label className="flex items-start gap-3 text-[15px] text-ink-700">
              <input type="checkbox" className="mt-1 h-5 w-5 accent-ink-900" checked={consentMarketing} onChange={(e) => setConsentMarketing(e.target.checked)} />
              <span>Quiero recibir información y contenidos de Neurobalance.</span>
            </label>
          </div>
        </section>
      )}

      <div className="sticky bottom-0 -mx-4 mt-12 border-t border-ink-100 bg-[var(--paper)]/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0">
        {error && <p className="mb-3 text-sm text-nbred-600">{error}</p>}
        <div className="flex items-center justify-between gap-3">
          {step === "welcome"
            ? <a href="/" className="btn-ghost">Volver</a>
            : <button type="button" className="btn-ghost" onClick={back} disabled={busy}>{step === "none" ? "Revisar respuestas" : "Atrás"}</button>}
          {step !== "none" && (
            <button type="button" className="btn-primary min-w-[150px]" onClick={next} disabled={busy}>
              {busy ? "Enviando…" : step === "welcome" ? "Comenzar" : step === "email" ? "Enviar mis resultados" : "Continuar"}
            </button>
          )}
        </div>
      </div>
    </Shell>
  );
}
