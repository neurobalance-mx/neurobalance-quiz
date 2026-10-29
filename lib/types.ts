import type { AgeBand, TargetType } from "./questions";

export type ResultKind = "red" | "blue" | "combined" | "insufficient";

export interface Scores { FL: number | null; FR: number | null; RL: number | null; RR: number | null }
export interface ValidCounts { FL: number; FR: number; RL: number; RR: number }

export type Answers = Record<number, number | null>; // 1–36 → 0–4 o null ("no observado")
export interface ContextAnswers { q37?: string; q38?: string; q39?: string; q40: string[]; q41?: string; q42: string[] }

export interface Lead {
  name: string;
  email: string;
  phone?: string;
  consent_privacy: boolean;
  consent_marketing: boolean;
}

export interface Setup { target_type: TargetType; age_band: AgeBand; subject_name?: string }

export interface QuizResult {
  id: string;
  result: ResultKind;
  reason?: "early_age" | "incomplete";
  scores: Scores;
  valid: ValidCounts;
  profile: { name: string; tag: string; description: string };
  guides: { label: string; url: string; color: "red" | "blue" }[];
  topCategories: string[];
  challenges: { id: number; label: string }[];
  context: { title: string; answers: string[] }[];
  emailNote: string | null;
  showScores: boolean;
}
