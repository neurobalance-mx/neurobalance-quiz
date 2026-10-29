import { QUESTIONS, CATEGORIES, EARLY_AGE_BANDS, CHALLENGE_LABELS, type AgeBand } from "./questions";
import type { Answers, ResultKind, Scores, ValidCounts } from "./types";
import type { AppSettings } from "./settings";

const ids = (kind: "strength" | "challenge", side: "L" | "R") =>
  QUESTIONS.filter((q) => q.kind === kind && q.side === side).map((q) => q.id);

export const FL_IDS = ids("strength", "L");
export const FR_IDS = ids("strength", "R");
export const RL_IDS = ids("challenge", "L");
export const RR_IDS = ids("challenge", "R");

/** Puntuación 0–100 = promedio de respuestas válidas × 25. null si ninguna respuesta es válida. */
export function indicator(answers: Answers, list: number[]): { score: number | null; valid: number } {
  const vals = list.map((i) => answers[i]).filter((v): v is number => typeof v === "number");
  if (vals.length === 0) return { score: null, valid: 0 };
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return { score: Math.round(avg * 25 * 10) / 10, valid: vals.length };
}

export function computeScores(answers: Answers): { scores: Scores; valid: ValidCounts } {
  const fl = indicator(answers, FL_IDS), fr = indicator(answers, FR_IDS);
  const rl = indicator(answers, RL_IDS), rr = indicator(answers, RR_IDS);
  return {
    scores: { FL: fl.score, FR: fr.score, RL: rl.score, RR: rr.score },
    valid: { FL: fl.valid, FR: fr.valid, RL: rl.valid, RR: rr.valid },
  };
}

export function classify(
  scores: Scores,
  valid: ValidCounts,
  ageBand: AgeBand,
  settings: Pick<AppSettings, "thresholds" | "early_age_mode">
): { result: ResultKind; reason?: "early_age" | "incomplete" } {
  const t = settings.thresholds;
  if (EARLY_AGE_BANDS.includes(ageBand) && settings.early_age_mode === "insufficient") return { result: "insufficient", reason: "early_age" };
  const enough =
    valid.FL >= t.min_strength_valid && valid.FR >= t.min_strength_valid &&
    valid.RL >= t.min_challenge_valid && valid.RR >= t.min_challenge_valid &&
    scores.FL !== null && scores.FR !== null;
  if (!enough) return { result: "insufficient", reason: "incomplete" };
  const diff = (scores.FL as number) - (scores.FR as number);
  if (diff >= t.profile_diff) return { result: "red" };
  if (-diff >= t.profile_diff) return { result: "blue" };
  return { result: "combined" };
}

/** Categorías con mayores fortalezas reportadas (lado del perfil, o ambos si es combinado). */
export function topCategories(answers: Answers, result: ResultKind, max = 3): string[] {
  if (result === "insufficient") return [];
  const sides = result === "red" ? ["L"] : result === "blue" ? ["R"] : ["L", "R"];
  const rows = CATEGORIES.flatMap((c) =>
    sides.map((side) => {
      const qs = QUESTIONS.filter((q) => q.category === c.id && q.kind === "strength" && q.side === side).map((q) => q.id);
      return { title: c.title as string, score: indicator(answers, qs).score };
    })
  ).filter((r): r is { title: string; score: number } => r.score !== null && r.score >= 50);
  rows.sort((a, b) => b.score - a.score);
  return Array.from(new Set(rows.map((r) => r.title))).slice(0, max);
}

/** Solo los retos efectivamente señalados (valor ≥ umbral). Nunca se infieren del lado opuesto. */
export function reportedChallenges(answers: Answers, flag: number) {
  return [...RL_IDS, ...RR_IDS]
    .sort((a, b) => a - b)
    .filter((id) => typeof answers[id] === "number" && (answers[id] as number) >= flag)
    .map((id) => ({ id, label: CHALLENGE_LABELS[id] }));
}
