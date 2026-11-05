// Pruebas del quiz de niños contra la especificación (págs. 7–8 y checklist pág. 12).
import { KIDS_ITEMS, normalizeKidsAnswers, scoreKids, shownItems } from "../lib/kids";

const T = { intensity_moderate: 25, intensity_marked: 50, imbalance_clear: 10, imbalance_marked: 25, both_high: 30 };
let fails = 0;
const eq = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fails++;
  console.log(`${ok ? "✔" : "✘"} ${name}${ok ? "" : ` → obtenido ${JSON.stringify(got)}, esperado ${JSON.stringify(want)}`}`);
};
const R = KIDS_ITEMS.filter((i) => i.side === "R").map((i) => i.id);
const A = KIDS_ITEMS.filter((i) => i.side === "A").map((i) => i.id);
const mark = (ids: number[], age: "2_5" | "6_12" | "13_17" = "6_12") =>
  normalizeKidsAnswers(Object.fromEntries(ids.map((i) => [i, 1])), age);

eq("48 conductas", KIDS_ITEMS.length, 48);
eq("R = 24, A = 24", [R.length, A.length], [24, 24]);
eq("Mostradas 2–5 años", shownItems("2_5").length, 45);
eq("R 2–5 años = 23", shownItems("2_5").filter((i) => i.side === "R").length, 23);
eq("A 2–5 años = 22", shownItems("2_5").filter((i) => i.side === "A").length, 22);
eq("Ocultas 2–5: 44, 45, 46", KIDS_ITEMS.filter((i) => i.minAge6).map((i) => i.id), [44, 45, 46]);
eq("Códigos de muestra (01 R, 02 A, 06 A, 28 A, 41 R, 45 R)", [1, 2, 6, 28, 41, 45].map((i) => KIDS_ITEMS[i - 1].side), ["R", "A", "A", "A", "R", "R"]);

// Ejemplo del documento: niño de 8 años, 11 R y 4 A
const ex = scoreKids(mark([...R.slice(0, 11), ...A.slice(0, 4)]), T);
eq("Ejemplo: perfil rojo", ex.result, "red");
eq("Ejemplo: PR 46, PA 17", [ex.PR, ex.PA], [46, 17]);
eq("Ejemplo: total 31 %, intensidad moderada", [ex.total, ex.intensity], [31, "moderada"]);
eq("Ejemplo: diferencia 29, desequilibrio marcado", [ex.diff, ex.imbalance], [29, "marcado"]);

// 2–5 años: 44–46 se guardan como null y no cuentan aunque vengan marcadas
const young = mark([44, 45, 46, 1], "2_5");
eq("2–5 años: 44–46 = null", [young[44], young[45], young[46]], [null, null, null]);
const ys = scoreKids(young, T);
eq("2–5 años: PR = 1/23", ys.PR, Math.round(100 / 23));

// Azul
eq("PA mayor → azul", scoreKids(mark(A.slice(0, 5)), T).result, "blue");

// Empates
const t1 = scoreKids(mark([1, 3, 10, 12]), T); // R: 2/24 = A: 2/24; Movimiento R 2/4 > A 0/4
eq("Empate → Movimiento decide (rojo)", [t1.result, t1.tieBreak], ["red", "area1"]);
const t2 = scoreKids(mark([2, 9]), T); // Movimiento A 1/4 > R 0
eq("Empate → Movimiento decide (azul)", [t2.result, t2.tieBreak], ["blue", "area1"]);
const t3 = scoreKids(mark([1, 2, 10, 17]), T); // Mov. empate 1/1; Vida diaria A 1 > R 0
eq("Empate → Vida diaria decide (azul)", [t3.result, t3.tieBreak], ["blue", "area2"]);
const t4 = scoreKids(mark([17, 18]), T);
eq("Empate total → rojo", [t4.result, t4.tieBreak], ["red", "default"]);

// Ninguna marcada
eq("Ninguna marcada → none", scoreKids(mark([]), T).result, "none");

// Intensidad y rasgos de ambos perfiles
eq("Total 50 % → marcada", scoreKids(mark([...R.slice(0, 12), ...A.slice(0, 12)]), T).intensity, "marcada");
eq("Total < 25 % → leve", scoreKids(mark(R.slice(0, 5)), T).intensity, "leve");
eq("PR y PA ≥ 30 → ambos perfiles", scoreKids(mark([...R.slice(0, 10), ...A.slice(0, 8)]), T).bothHigh, true);
eq("Diferencia 8 → ligero", scoreKids(mark([...R.slice(0, 6), ...A.slice(0, 4)]), T).imbalance, "ligero");

// Por área
const area = scoreKids(mark([1, 3, 5, 7]), T).areas[0];
eq("Área Movimiento R 100, A 0", [area.R, area.A], [100, 0]);

console.log(fails ? `\n${fails} prueba(s) fallida(s)` : "\nTodas las pruebas de niños pasaron.");
process.exit(fails ? 1 : 0);
