"use client";

import type { QuizResult } from "@/lib/types";
import type { TargetType } from "@/lib/questions";
import { CLOSING_MESSAGE, DISCLAIMER } from "@/lib/texts";
import Hemispheres from "./Hemispheres";

const ACCENT = {
  red: { text: "text-nbred-600", bg: "bg-nbred-50", bar: "bg-nbred-500", ring: "ring-nbred-100" },
  blue: { text: "text-nbblue-600", bg: "bg-nbblue-50", bar: "bg-nbblue-500", ring: "ring-nbblue-100" },
  combined: { text: "text-ink-900", bg: "bg-white", bar: "bg-ink-700", ring: "ring-ink-100" },
  insufficient: { text: "text-ink-700", bg: "bg-white", bar: "bg-ink-500", ring: "ring-ink-100" },
};

export default function ResultView({ result, target, subjectName, onRestart }:
  { result: QuizResult; target: TargetType; subjectName: string; onRestart: () => void }) {
  const a = ACCENT[result.result];
  const { FL, FR, RL, RR } = result.scores;
  const who = target === "other" ? (subjectName || "la persona evaluada") : null;

  return (
    <section className="pt-6">
      <p className="text-[15px] leading-relaxed text-ink-700">{CLOSING_MESSAGE}</p>

      <div className={`mt-8 rounded-2xl p-6 ring-1 sm:p-8 ${a.bg} ${a.ring}`}>
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <Hemispheres size={112} animate
            left={result.showScores && FL !== null ? 0.45 + (FL / 100) * 0.55 : 1}
            right={result.showScores && FR !== null ? 0.45 + (FR / 100) * 0.55 : 1}
            muted={result.result === "insufficient"} />
          <div>
            <p className={`text-sm font-semibold ${a.text}`}>{result.profile.tag}</p>
            <h1 className="mt-1 text-[2rem] leading-tight sm:text-4xl">{result.profile.name}</h1>
            {who && <p className="mt-1 text-sm text-ink-500">Resultado de {who}</p>}
          </div>
        </div>
        <p className="mt-5 text-[16px] leading-relaxed text-ink-700">{result.profile.description}</p>
      </div>

      {result.showScores && (
        <div className="mt-10">
          <h2 className="text-2xl">Tus cuatro indicadores</h2>
          <p className="mt-1 text-sm text-ink-500">Cada indicador va de 0 a 100 y se calcula por separado.</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <ScoreGroup title="Fortalezas" items={[
              { label: "Hemisferio izquierdo", value: FL, color: "bg-nbred-500" },
              { label: "Hemisferio derecho", value: FR, color: "bg-nbblue-500" },
            ]} />
            <ScoreGroup title="Retos reportados" items={[
              { label: "Hemisferio izquierdo", value: RL, color: "bg-nbred-500/45" },
              { label: "Hemisferio derecho", value: RR, color: "bg-nbblue-500/45" },
            ]} />
          </div>
        </div>
      )}

      {(result.topCategories.length > 0 || result.challenges.length > 0) && (
        <div className="mt-10 space-y-8">
          {result.topCategories.length > 0 && (
            <div>
              <h2 className="text-2xl">Dónde destacan las fortalezas</h2>
              <ul className="mt-4 space-y-2">
                {result.topCategories.map((c) => (
                  <li key={c} className="flex gap-3 text-[16px] text-ink-700"><span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${a.bar}`} />{c}</li>
                ))}
              </ul>
            </div>
          )}
          {result.challenges.length > 0 && (
            <div>
              <h2 className="text-2xl">Habilidades que podrían requerir apoyo</h2>
              <p className="mt-1 text-sm text-ink-500">Solo incluimos lo que se marcó como frecuente o casi siempre.</p>
              <ul className="mt-4 space-y-2">
                {result.challenges.map((c) => (
                  <li key={c.id} className="flex gap-3 text-[16px] text-ink-700"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ink-300" />{c.label}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {result.context.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl">{target === "other" ? "Su manera de funcionar" : "Tu manera de funcionar"}</h2>
          <dl className="mt-4 divide-y divide-ink-100 rounded-xl bg-white ring-1 ring-ink-100">
            {result.context.map((c) => (
              <div key={c.title} className="grid gap-1 px-4 py-3.5 sm:grid-cols-[180px_1fr] sm:gap-4">
                <dt className="text-sm font-semibold text-ink-900">{c.title}</dt>
                <dd className="text-[15px] text-ink-700">{c.answers.join(" ")}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-2xl">{result.guides.length > 1 ? "Descarga tus guías" : "Descarga tu guía"}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {result.guides.map((g) => (
            <a key={g.url + g.color} href={g.url} target="_blank" rel="noreferrer" download
              className={`flex items-center justify-between rounded-xl px-5 py-4 font-semibold text-white transition-opacity hover:opacity-90 ${g.color === "red" ? "bg-nbred-600" : "bg-nbblue-600"}`}>
              <span>{g.label}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 4v12m0 0-5-5m5 5 5-5M5 20h14" /></svg>
            </a>
          ))}
        </div>
        {result.emailNote && <p className="mt-3 text-sm text-ink-500">{result.emailNote}</p>}
      </div>

      <p className="mt-10 border-t border-ink-100 pt-6 text-sm leading-relaxed text-ink-500">{DISCLAIMER}</p>
      <button type="button" className="btn-ghost -ml-5 mt-4" onClick={onRestart}>Responder sobre otra persona</button>
    </section>
  );
}

function ScoreGroup({ title, items }: { title: string; items: { label: string; value: number | null; color: string }[] }) {
  return (
    <div className="rounded-xl bg-white p-5 ring-1 ring-ink-100">
      <p className="font-semibold">{title}</p>
      <div className="mt-4 space-y-4">
        {items.map((i) => (
          <div key={i.label}>
            <div className="flex justify-between text-sm"><span className="text-ink-700">{i.label}</span>
              <span className="font-semibold tabular-nums">{i.value === null ? "Sin datos" : `${Math.round(i.value)}/100`}</span></div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-100">
              <div className={`h-full rounded-full ${i.color}`} style={{ width: `${i.value ?? 0}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
