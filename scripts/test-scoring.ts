// Pruebas de cálculo contra la especificación (págs. 12–13 y control de calidad pág. 17).
import { FL_IDS, FR_IDS, RL_IDS, RR_IDS, computeScores, classify, reportedChallenges } from "../lib/scoring";
import { QUESTIONS } from "../lib/questions";
import { DEFAULT_SETTINGS } from "../lib/settings";
import type { Answers } from "../lib/types";

let fails = 0;
const eq = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fails++;
  console.log(`${ok ? "✔" : "✘"} ${name}${ok ? "" : ` → obtenido ${JSON.stringify(got)}, esperado ${JSON.stringify(want)}`}`);
};
const fill = (fl: number | null, fr: number | null, rl: number | null, rr: number | null): Answers => {
  const a: Answers = {};
  FL_IDS.forEach((i) => (a[i] = fl)); FR_IDS.forEach((i) => (a[i] = fr));
  RL_IDS.forEach((i) => (a[i] = rl)); RR_IDS.forEach((i) => (a[i] = rr));
  return a;
};
const S = DEFAULT_SETTINGS;

// Clasificación de preguntas idéntica a la tabla de la pág. 12
eq("FL ids", FL_IDS, [1, 3, 7, 9, 13, 15, 19, 21, 25, 27, 31, 33]);
eq("FR ids", FR_IDS, [2, 4, 8, 10, 14, 16, 20, 22, 26, 28, 32, 34]);
eq("RL ids", RL_IDS, [5, 11, 17, 23, 29, 35]);
eq("RR ids", RR_IDS, [6, 12, 18, 24, 30, 36]);
eq("36 preguntas", QUESTIONS.length, 36);

// Promedio × 25
let r = computeScores(fill(4, 2, 1, 3));
eq("Puntajes 4/2/1/3", r.scores, { FL: 100, FR: 50, RL: 25, RR: 75 });

// null no entra en el promedio ni reduce el puntaje
const a = fill(4, 2, 0, 0); a[1] = null; a[3] = null;
r = computeScores(a);
eq("null excluido del promedio", r.scores.FL, 100);
eq("válidas FL con 2 null", r.valid.FL, 10);

// Todas null → null (no 0)
r = computeScores(fill(null, 3, 1, 1));
eq("bloque todo null → null", r.scores.FL, null);

// Mezcla: FL = (4+3+3+2+...)
const m = fill(3, 2, 1, 1); m[1] = 4; m[3] = 1; // FL: 4,1 + 10×3 = 35/12 = 2.9167 → 72.9
eq("promedio mixto FL", computeScores(m).scores.FL, 72.9);

// Rutas de resultado
eq("Rojo (FL−FR ≥ 15)", classify(...cs(fill(4, 2, 1, 1)), "18_plus", S).result, "red");
eq("Azul (FR−FL ≥ 15)", classify(...cs(fill(1, 3, 1, 1)), "18_plus", S).result, "blue");
eq("Combinado (dif < 15)", classify(...cs(fill(3, 3, 1, 1)), "18_plus", S).result, "combined");
// Límite exacto: FL 75, FR 60 → dif 15 → rojo
const edge = fill(3, 2, 1, 1); FR_IDS.slice(0, 5).forEach((i) => (edge[i] = 3)); FR_IDS.slice(5, 7).forEach((i) => (edge[i] = 2));
// FR: 5×3 + 7×2 = 29/12 = 2.4167 → 60.4; dif 14.6 → combinado
eq("Dif 14.6 → combinado", classify(...cs(edge), "18_plus", S).result, "combined");

// Insuficiente: 4 null en FL (8 válidas < 9)
const ins = fill(4, 1, 1, 1); FL_IDS.slice(0, 4).forEach((i) => (ins[i] = null));
eq("8/12 válidas → insuficiente", classify(...cs(ins), "18_plus", S), { result: "insufficient", reason: "incomplete" });
const ok9 = fill(4, 1, 1, 1); FL_IDS.slice(0, 3).forEach((i) => (ok9[i] = null));
eq("9/12 válidas → perfil", classify(...cs(ok9), "18_plus", S).result, "red");
const insR = fill(4, 1, 1, 1); RL_IDS.slice(0, 3).forEach((i) => (insR[i] = null));
eq("3/6 retos válidos → insuficiente", classify(...cs(insR), "18_plus", S).result, "insufficient");

// Edad temprana sin adaptación
eq("3–5 años → insuficiente", classify(...cs(fill(4, 1, 1, 1)), "3_5", S), { result: "insufficient", reason: "early_age" });

// Retos: solo los reportados (≥ Frecuentemente); un FL alto no genera retos derechos
const ch = fill(4, 0, 0, 0); ch[30] = 3; ch[17] = 4; ch[5] = 2;
eq("Retos reportados", reportedChallenges(ch, 3).map((c) => c.id), [17, 30]);
eq("Sin retos inferidos", reportedChallenges(fill(4, 0, 0, 0), 3).length, 0);

function cs(ans: Answers) { const x = computeScores(ans); return [x.scores, x.valid] as const; }

console.log(fails ? `\n${fails} prueba(s) fallida(s)` : "\nTodas las pruebas pasaron.");
process.exit(fails ? 1 : 0);
