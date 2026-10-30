"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORIES, QUESTIONS, CONTEXT_QUESTIONS, ANSWER_OPTIONS, AGE_BANDS, naLabel,
  type AgeBand, type TargetType,
} from "@/lib/questions";
import type { Answers, ContextAnswers, Lead, QuizResult } from "@/lib/types";
import Hemispheres from "./Hemispheres";
import ResultView from "./ResultView";

type Step =
  | { kind: "welcome" }
  | { kind: "lead" }
  | { kind: "setup" }
  | { kind: "category"; index: number }
  | { kind: "context"; page: 0 | 1 };

const STEPS: Step[] = [
  { kind: "welcome" },
  { kind: "lead" },
  { kind: "setup" },
  ...CATEGORIES.map((_, index) => ({ kind: "category", index }) as Step),
  { kind: "context", page: 0 },
  { kind: "context", page: 1 },
];
const CONTEXT_PAGES: number[][] = [[37, 38, 39], [40, 41, 42]];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Quiz({ privacyUrl }: { privacyUrl: string }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [lead, setLead] = useState<Lead>({ name: "", email: "", phone: "", consent_privacy: false, consent_marketing: false });
  const [target, setTarget] = useState<TargetType | null>(null);
  const [age, setAge] = useState<AgeBand | null>(null);
  const [subjectName, setSubjectName] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [context, setContext] = useState<ContextAnswers>({ q40: [], q42: [] });
  const [responseId, setResponseId] = useState<string | null>(null);
  const [utm, setUtm] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const step = STEPS[stepIdx];
  const t: TargetType = target ?? "self";

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
  }, [stepIdx, result]);

  // Avance de preguntas respondidas (1–42)
  const progress = useMemo(() => {
    const main = Object.keys(answers).length;
    const ctx = CONTEXT_QUESTIONS.filter((q) => {
      const v = (context as any)[`q${q.id}`];
      return Array.isArray(v) ? v.length > 0 : !!v;
    }).length;
    return (main + ctx) / 42;
  }, [answers, context]);

  // ---------- Validación por paso ----------
  const stepValid = (): boolean => {
    switch (step.kind) {
      case "welcome": return true;
      case "lead": return lead.name.trim().length >= 2 && EMAIL_RE.test(lead.email.trim()) && lead.consent_privacy;
      case "setup": return !!target && !!age;
      case "category": return QUESTIONS.filter((q) => q.category === step.index + 1).every((q) => q.id in answers);
      case "context": return CONTEXT_PAGES[step.page].every((id) => {
        const v = (context as any)[`q${id}`];
        return Array.isArray(v) ? v.length > 0 : !!v;
      });
    }
  };

  async function next() {
    if (!stepValid()) { setShowErrors(true); return; }
    if (step.kind === "lead" && !responseId) {
      // Registra el lead al inicio para conservar contactos aunque no terminen el quiz.
      setBusy(true);
      try {
        const res = await fetch("/api/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lead, utm }) });
        if (res.ok) setResponseId((await res.json()).id);
      } catch { /* no bloquea: /api/submit crea el registro si falta */ }
      setBusy(false);
    }
    if (stepIdx === STEPS.length - 1) return submit();
    setStepIdx((i) => i + 1);
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: responseId, lead, utm, setup: { target_type: target, age_band: age, subject_name: subjectName.trim() || undefined }, answers, context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No pudimos calcular el resultado.");
      setResult(data as QuizResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos calcular el resultado. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  function restart() {
    setAnswers({}); setContext({ q40: [], q42: [] }); setResult(null); setResponseId(null);
    setTarget(null); setAge(null); setSubjectName(""); setStepIdx(2);
  }

  const toggleMulti = (qid: 40 | 42, key: string, max?: number, exclusive?: boolean) => {
    setContext((c) => {
      const field = `q${qid}` as "q40" | "q42";
      const cur = c[field];
      const q = CONTEXT_QUESTIONS.find((x) => x.id === qid)!;
      const exclusiveKeys = q.options.filter((o) => o.exclusive).map((o) => o.key);
      let nextVals: string[];
      if (cur.includes(key)) nextVals = cur.filter((k) => k !== key);
      else if (exclusive) nextVals = [key];
      else {
        nextVals = [...cur.filter((k) => !exclusiveKeys.includes(k)), key];
        if (max && nextVals.length > max) return c;
      }
      return { ...c, [field]: nextVals };
    });
  };

  // ---------- Render ----------
  if (result) {
    return (
      <Shell topRef={topRef}>
        <ResultView result={result} target={t} subjectName={subjectName.trim()} onRestart={restart} />
      </Shell>
    );
  }

  const inQuestions = step.kind === "category" || step.kind === "context";

  return (
    <Shell topRef={topRef}>
      {inQuestions && <Progress value={progress} label={step.kind === "category" ? `Bloque ${step.index + 1} de 6` : "Preguntas de contexto"} />}

      {step.kind === "welcome" && (
        <section className="pt-6 sm:pt-12">
          <div className="flex justify-center sm:justify-start"><Hemispheres size={132} animate /></div>
          <h1 className="mt-8 text-[2.1rem] leading-[1.12] sm:text-5xl">¿Cuál es tu Perfil Cerebral Neurobalance?</h1>
          <p className="mt-4 text-lg text-ink-700">Descubre tus fortalezas, características y retos funcionales a través del cerebro asimétrico.</p>
          <div className="mt-8 space-y-4 text-[16px] leading-relaxed text-ink-700">
            <p>Nuestro cerebro está formado por dos hemisferios que tienen distintas especializaciones y trabajan de manera integrada.</p>
            <p>Todos tenemos una combinación particular de habilidades. Algunas se desarrollan con mayor facilidad, mientras que otras requieren más esfuerzo.</p>
            <p>A través de este cuestionario podrás reconocer patrones en tu manera de comunicarte, aprender, procesar información, moverte, relacionarte y responder a diferentes situaciones.</p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border-l-4 border-nbred-500 bg-white p-4">
              <p className="font-semibold text-nbred-600">Hemisferio izquierdo</p>
              <p className="mt-1 text-ink-500">Lenguaje, secuencias, detalles, memoria verbal y praxis.</p>
            </div>
            <div className="rounded-xl border-l-4 border-nbblue-500 bg-white p-4">
              <p className="font-semibold text-nbblue-600">Hemisferio derecho</p>
              <p className="mt-1 text-ink-500">Percepción global, espacio, prosodia y comunicación no verbal.</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-ink-500">42 preguntas · alrededor de 10 minutos</p>
        </section>
      )}

      {step.kind === "lead" && (
        <section className="pt-4">
          <h2 className="text-3xl">Antes de empezar</h2>
          <p className="mt-2 text-ink-700">Te mostraremos tu resultado al terminar y te compartiremos las guías correspondientes.</p>
          <div className="mt-7 space-y-5">
            <Field label="Nombre completo" error={showErrors && lead.name.trim().length < 2 ? "Escribe tu nombre." : undefined}>
              <input className="field" autoComplete="name" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} />
            </Field>
            <Field label="Correo electrónico" error={showErrors && !EMAIL_RE.test(lead.email.trim()) ? "Escribe un correo válido, por ejemplo nombre@correo.com." : undefined}>
              <input className="field" type="email" inputMode="email" autoComplete="email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} />
            </Field>
            <Field label="Teléfono" hint="Opcional">
              <input className="field" type="tel" inputMode="tel" autoComplete="tel" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} />
            </Field>
            <label className="flex items-start gap-3 text-[15px] text-ink-700">
              <input type="checkbox" className="mt-1 h-5 w-5 accent-ink-900" checked={lead.consent_privacy} onChange={(e) => setLead({ ...lead, consent_privacy: e.target.checked })} />
              <span>Acepto el <a href={privacyUrl} target="_blank" rel="noreferrer" className="underline">aviso de privacidad</a> y el uso de mis datos para recibir mi resultado.</span>
            </label>
            {showErrors && !lead.consent_privacy && <p className="-mt-3 pl-8 text-sm text-nbred-600">Necesitamos tu aceptación para continuar.</p>}
            <label className="flex items-start gap-3 text-[15px] text-ink-700">
              <input type="checkbox" className="mt-1 h-5 w-5 accent-ink-900" checked={lead.consent_marketing} onChange={(e) => setLead({ ...lead, consent_marketing: e.target.checked })} />
              <span>Quiero recibir información sobre el Método Neurobalance. <span className="text-ink-500">Opcional.</span></span>
            </label>
          </div>
        </section>
      )}

      {step.kind === "setup" && (
        <section className="pt-4">
          <h2 className="text-3xl">¿Sobre quién estás respondiendo?</h2>
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {([["self", "Sobre mí"], ["other", "Sobre otra persona"]] as const).map(([v, l]) => (
              <button key={v} type="button" className="opt py-4 text-base" aria-pressed={target === v} onClick={() => setTarget(v)}>{l}</button>
            ))}
          </div>
          {showErrors && !target && <p className="mt-2 text-sm text-nbred-600">Elige una opción.</p>}

          {target === "other" && (
            <div className="mt-6">
              <Field label="Nombre de la persona" hint="Opcional">
                <input className="field" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} />
              </Field>
            </div>
          )}

          <h3 className="mt-9 text-xl">{target === "other" ? "¿Cuál es su edad?" : "¿Cuál es tu edad?"}</h3>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {AGE_BANDS.map((a) => (
              <button key={a.value} type="button" className="opt" aria-pressed={age === a.value} onClick={() => setAge(a.value)}>{a.label}</button>
            ))}
          </div>
          {showErrors && !age && <p className="mt-2 text-sm text-nbred-600">Elige un rango de edad.</p>}
          {(age === "0_2" || age === "3_5") && (
            <p className="mt-4 rounded-lg bg-ink-100 p-3 text-sm text-ink-700">
              Para menores de 6 años estamos preparando una versión adaptada por etapa. Puedes contestar y recibirás las guías como material general, sin puntajes.
            </p>
          )}

          <div className="mt-9 rounded-xl bg-white p-4 text-[15px] leading-relaxed text-ink-700 ring-1 ring-ink-100">
            <p className="font-semibold text-ink-900">Instrucciones</p>
            <p className="mt-1">
              {target === "other"
                ? "Responde pensando en las características que se presentan habitualmente en la persona sobre la que estás contestando. Si no lo has observado o todavía no corresponde a su edad, elige esa opción."
                : "Responde pensando en las características que se presentan habitualmente en ti. Si algo no lo has observado, elige esa opción."}{" "}
              No existen respuestas buenas o malas. Selecciona lo que mejor describa su funcionamiento cotidiano.
            </p>
          </div>
        </section>
      )}

      {step.kind === "category" && (() => {
        const cat = CATEGORIES[step.index];
        const qs = QUESTIONS.filter((q) => q.category === cat.id);
        return (
          <section className="pt-6">
            <h2 className="text-3xl">{cat.title}</h2>
            <p className="mt-2 text-ink-500">{cat.subtitle}</p>
            <ol className="mt-8 space-y-9">
              {qs.map((q) => {
                const has = q.id in answers;
                return (
                  <li key={q.id} className={showErrors && !has ? "rounded-xl ring-2 ring-nbred-500 ring-offset-8 ring-offset-[var(--paper)]" : ""}>
                    <p id={`q${q.id}`} className="text-[17px] font-medium leading-snug">
                      <span className="mr-2 text-ink-500">{q.id}.</span>{q[t]}
                    </p>
                    <div role="radiogroup" aria-labelledby={`q${q.id}`} className="mt-3.5 grid grid-cols-1 gap-2 sm:grid-cols-5">
                      {ANSWER_OPTIONS.map((o) => (
                        <button key={o.value} type="button" role="radio" aria-checked={answers[q.id] === o.value} className="opt sm:px-2 sm:text-center sm:text-sm"
                          onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.value }))}>{o.label}</button>
                      ))}
                    </div>
                    <button type="button" role="radio" aria-checked={has && answers[q.id] === null}
                      className={`mt-2 rounded-md px-2 py-1.5 text-left text-sm ${has && answers[q.id] === null ? "bg-ink-900 text-white" : "text-ink-500 underline-offset-2 hover:underline"}`}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: null }))}>{naLabel(t)}</button>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })()}

      {step.kind === "context" && (
        <section className="pt-6">
          <h2 className="text-3xl">{step.page === 0 ? "Conociendo mejor tu manera de funcionar" : "Sensibilidad, adaptación y regulación"}</h2>
          <p className="mt-2 text-ink-500">Estas respuestas no cambian el puntaje. Nos ayudan a enriquecer tu resultado.</p>
          <ol className="mt-8 space-y-10">
            {CONTEXT_PAGES[step.page].map((id) => {
              const q = CONTEXT_QUESTIONS.find((x) => x.id === id)!;
              const field = `q${id}` as keyof ContextAnswers;
              const val = context[field];
              const missing = Array.isArray(val) ? val.length === 0 : !val;
              const atMax = q.max && Array.isArray(val) && val.length >= q.max;
              return (
                <li key={id} className={showErrors && missing ? "rounded-xl ring-2 ring-nbred-500 ring-offset-8 ring-offset-[var(--paper)]" : ""}>
                  <p className="text-[17px] font-medium leading-snug"><span className="mr-2 text-ink-500">{id}.</span>{q[t]}</p>
                  {q.multiple && <p className="mt-1 text-sm text-ink-500">{q.max ? `Elige hasta ${q.max}.` : "Puedes elegir varias."}</p>}
                  <div className="mt-3.5 grid gap-2">
                    {q.options.map((o) => {
                      const selected = Array.isArray(val) ? val.includes(o.key) : val === o.key;
                      return (
                        <button key={o.key} type="button" aria-pressed={selected}
                          disabled={!!(q.multiple && !selected && atMax && !o.exclusive)}
                          className="opt"
                          onClick={() => q.multiple ? toggleMulti(id as 40 | 42, o.key, q.max, o.exclusive) : setContext((c) => ({ ...c, [field]: o.key }))}>
                          {o[t]}
                        </button>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* Navegación */}
      <div className="sticky bottom-0 -mx-4 mt-12 border-t border-ink-100 bg-[var(--paper)]/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0">
        {error && <p className="mb-3 text-sm text-nbred-600">{error}</p>}
        {showErrors && step.kind !== "lead" && step.kind !== "setup" && !stepValid() && (
          <p className="mb-3 text-sm text-nbred-600">Responde las preguntas marcadas para continuar.</p>
        )}
        <div className="flex items-center justify-between gap-3">
          {stepIdx > 0 ? <button type="button" className="btn-ghost" onClick={() => setStepIdx((i) => i - 1)} disabled={busy}>Atrás</button> : <span />}
          <button type="button" className="btn-primary min-w-[150px]" onClick={next} disabled={busy}>
            {busy ? "Un momento…" : step.kind === "welcome" ? "Comenzar" : stepIdx === STEPS.length - 1 ? "Ver mi resultado" : "Continuar"}
          </button>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children, topRef }: { children: React.ReactNode; topRef: React.RefObject<HTMLDivElement> }) {
  return (
    <main className="mx-auto max-w-[680px] px-4 pb-10 pt-4 sm:px-6 sm:pt-8">
      <div ref={topRef} className="scroll-mt-4" />
      <header className="flex items-center gap-2.5 py-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Neurobalance" width={165} height={28} className="h-7 w-auto" />
      </header>
      {children}
    </main>
  );
}

function Progress({ value, label }: { value: number; label: string }) {
  return (
    <div className="mt-3">
      <div className="flex justify-between text-sm text-ink-500"><span>{label}</span><span>{Math.round(value * 100)}%</span></div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-100" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-gradient-to-r from-nbred-500 to-nbblue-500 transition-[width] duration-500" style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-[15px] font-medium">
        {label}{hint && <span className="text-sm font-normal text-ink-500">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-sm text-nbred-600">{error}</span>}
    </label>
  );
}
