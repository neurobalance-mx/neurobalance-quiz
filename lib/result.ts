import { CONTEXT_QUESTIONS, contextLabel, type AgeBand, type TargetType } from "./questions";
import { classify, computeScores, reportedChallenges, topCategories } from "./scoring";
import { PROFILE_TEXTS, EARLY_AGE_TEXT } from "./texts";
import type { AppSettings } from "./settings";
import type { Answers, ContextAnswers, QuizResult } from "./types";

export function buildResult(args: {
  id: string;
  answers: Answers;
  context: ContextAnswers;
  ageBand: AgeBand;
  target: TargetType;
  email: string;
  settings: AppSettings;
  origin: string; // dominio público, para que los enlaces funcionen también dentro del correo
}): QuizResult {
  const { answers, context, ageBand, target, settings } = args;
  const { scores, valid } = computeScores(answers);
  const { result, reason } = classify(scores, valid, ageBand, settings);
  const profile = { ...PROFILE_TEXTS[result] };
  if (reason === "early_age") profile.description = EARLY_AGE_TEXT;

  const red = { label: "Guía roja · El Arquitecto Verbal", url: absoluteUrl(settings.guides.red_url, args.origin), color: "red" as const };
  const blue = { label: "Guía azul · El Integrador Contextual", url: absoluteUrl(settings.guides.blue_url, args.origin), color: "blue" as const };
  const guides = result === "red" ? [red] : result === "blue" ? [blue] : [red, blue];

  const ctx = CONTEXT_QUESTIONS.map((q) => {
    const raw = (context as any)[`q${q.id}`];
    const keys: string[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return { title: q.short, answers: keys.map((k) => contextLabel(q.id, k, target)) };
  }).filter((c) => c.answers.length > 0);

  const showScores = reason !== "early_age";

  return {
    id: args.id,
    result,
    reason,
    scores,
    valid,
    profile,
    guides,
    topCategories: topCategories(answers, result),
    challenges: showScores ? reportedChallenges(answers, settings.thresholds.challenge_flag_value) : [],
    context: ctx,
    emailNote: null, // se llena en /api/submit solo si el correo se envió

    showScores,
  };
}

export function absoluteUrl(url: string, origin: string): string {
  try { return new URL(url, origin).toString(); } catch { return url; }
}

export function publicOrigin(req: Request): string {
  const env = process.env.PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (env) return env;
  const h = req.headers;
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "https";
  return host ? `${proto}://${host}` : new URL(req.url).origin;
}
