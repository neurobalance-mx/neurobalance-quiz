// Quiz Perfil Cerebral Neurobalance · Versión niños (parents_v1)
// R = suma al perfil rojo (predominio izquierdo) · A = suma al perfil azul (predominio derecho).
// Los códigos son internos y nunca se muestran al padre.

export const KIDS_QUIZ_VERSION = "parents_v1";

export type KidsAgeBand = "2_5" | "6_12" | "13_17";
export type Communication = "speech_sentences" | "speech_words" | "aac";
export type KidsSide = "R" | "A";
export type KidsResultKind = "red" | "blue" | "none";
export type Intensity = "leve" | "moderada" | "marcada";
export type Imbalance = "ligero" | "claro" | "marcado";

export interface KidsItem { id: number; area: number; side: KidsSide; minAge6: boolean; text: string }

export const KIDS_AREAS = [
  { id: 1, title: "Movimiento" },
  { id: 2, title: "Vida diaria y sentidos" },
  { id: 3, title: "Emociones" },
  { id: 4, title: "Conducta y relaciones" },
  { id: 5, title: "Comunicación" },
  { id: 6, title: "Aprendizaje" },
] as const;

const TEXTS: string[] = [
  // 1 · Movimiento
  "Se desparrama en la silla, se recarga o se sostiene la cabeza con la mano; se cansa rápido estando sentado.",
  "Le cuesta abotonar, atar agujetas, recortar o tomar bien el lápiz.",
  "Tropieza, se cae o choca con las cosas más que otros niños de su edad.",
  "Su letra es grande, lenta o desordenada, o evita dibujar y colorear.",
  "Se ve torpe al correr, saltar, andar en bicicleta o hacer deporte.",
  "Es ágil para correr, trepar o andar en bicicleta, pero torpe con las manos.",
  "Aletea las manos, gira sobre sí mismo, se mece o camina de puntas.",
  "Le cuesta usar los cubiertos, cepillarse los dientes o peinarse con precisión para su edad.",
  // 2 · Vida diaria y sentidos
  "Se tapa los oídos o se altera con ruidos fuertes (licuadora, secador de manos, fiestas).",
  "Parece no escuchar bien o pide que le repitan, aunque su audición está bien.",
  "Come muy pocos alimentos y rechaza comida por su textura, olor o apariencia.",
  "Le cuesta entender lo que le dicen cuando hay ruido alrededor.",
  "Le molestan las etiquetas, las costuras o ciertas telas; se quita la ropa o los zapatos.",
  "Le cuesta seguir los pasos de su rutina (bañarse, vestirse, preparar la mochila) sin que se los recuerdes.",
  "Busca movimiento todo el tiempo: girar, columpiarse, brincar, colgarse.",
  "Le cuesta aprender el orden de las cosas: los días de la semana, los meses o los pasos de una actividad.",
  // 3 · Emociones
  "Pasa de la calma al enojo, el llanto o el miedo de golpe y de forma exagerada para la situación.",
  "Es tímido y retraído, sobre todo con personas nuevas.",
  "Se preocupa mucho, tiene muchos miedos o momentos de ansiedad.",
  "Se le hieren los sentimientos con facilidad y llora pronto.",
  "Su cara muestra poca expresión; cuesta saber cómo se siente.",
  "Se avergüenza fácilmente y le importa mucho lo que piensan de él.",
  "No mide el peligro: se arriesga sin miedo.",
  "Se ve desganado o negativo, o dice “no puedo” o “soy tonto” cuando algo le cuesta.",
  // 4 · Conducta y relaciones
  "Le cuesta poner atención y se distrae con todo.",
  "Es sociable y querido, pero la escuela le cuesta mucho.",
  "Es inquieto o impulsivo: no espera turno, interrumpe o actúa sin pensar.",
  "Lee muy bien a las personas: sabe cómo te sientes con solo verte.",
  "Le cuesta hacer amigos, prefiere jugar solo u otros niños lo ven “diferente”.",
  "Sueña despierto; parece estar “en otro lado”.",
  "Se queda atorado en un tema, una actividad o una rutina y le cuesta mucho cambiar.",
  "Deja todo para después y evita lo que le exige esfuerzo mental.",
  // 5 · Comunicación
  "Mira poco a los ojos, no señala para mostrarte algo o no voltea cuando dices su nombre.",
  "Habla poco para su edad o le cuesta pronunciar bien las palabras.",
  "Repite frases, preguntas o diálogos de películas una y otra vez.",
  "Le cuesta encontrar la palabra que quiere o contar algo en orden.",
  "Habla mucho de su tema favorito “como pequeño profesor”, sin notar si el otro se aburre.",
  "Confunde palabras que suenan parecido al hablar o al escuchar.",
  "Entiende todo de forma literal: no capta bromas, ironías ni dobles sentidos.",
  "Se comunica muy bien con gestos y expresiones, aunque le cueste hablar.",
  // 6 · Aprendizaje
  "Aprendió letras, números o palabras antes que otros niños, a veces sin que nadie le enseñara.",
  "Le cuesta aprender colores, letras, números, rimas o canciones.",
  "Memoriza muchísimos datos de un tema que le apasiona (dinosaurios, mapas, trenes, números).",
  "Lee lento, se salta palabras o confunde letras parecidas como b y d.",
  "Lee bien en voz alta, pero no entiende lo que leyó.",
  "Escribe letras o números al revés o tiene muchas faltas de ortografía.",
  "Se queda en los detalles y le cuesta captar la idea principal de un cuento o un problema.",
  "Lo que aprende un día parece olvidarlo al siguiente; le cuesta memorizar, por ejemplo, las tablas.",
];

const ONLY_6_PLUS = [44, 45, 46];

// En el banco, las impares son R y las pares son A (el documento ya alterna R y A).
export const KIDS_ITEMS: KidsItem[] = TEXTS.map((text, i) => ({
  id: i + 1,
  area: Math.floor(i / 8) + 1,
  side: (i + 1) % 2 === 1 ? "R" : "A",
  minAge6: ONLY_6_PLUS.includes(i + 1),
  text,
}));

export const KIDS_AGE_BANDS: { value: KidsAgeBand; label: string }[] = [
  { value: "2_5", label: "2 a 5 años" },
  { value: "6_12", label: "6 a 12 años" },
  { value: "13_17", label: "13 a 17 años" },
];

export const COMMUNICATION_OPTIONS: { value: Communication; label: string }[] = [
  { value: "speech_sentences", label: "Habla con frases" },
  { value: "speech_words", label: "Habla con palabras sueltas" },
  { value: "aac", label: "Gestos, señas, tablero o dispositivo" },
];

export const itemCode = (id: number) => `c${String(id).padStart(2, "0")}`;
export const isShown = (item: KidsItem, age: KidsAgeBand) => !(item.minAge6 && age === "2_5");
export const shownItems = (age: KidsAgeBand) => KIDS_ITEMS.filter((i) => isShown(i, age));

// ---------- Cálculo ----------

export type KidsAnswers = Record<number, 0 | 1 | null>; // 1 marcado · 0 sin marcar · null no mostrado

export interface KidsThresholds {
  intensity_moderate: number; // % total marcado desde el cual es "moderada" (25)
  intensity_marked: number; // % desde el cual es "marcada" (50)
  imbalance_clear: number; // diferencia desde la cual es "claro" (10)
  imbalance_marked: number; // diferencia desde la cual es "marcado" (25)
  both_high: number; // si PR y PA son ≥ este valor se agrega la frase de rasgos de ambos perfiles (30)
}

export interface KidsScores {
  result: KidsResultKind;
  PR: number; // 0–100, redondeado
  PA: number;
  total: number; // % total marcado
  intensity: Intensity | null;
  imbalance: Imbalance | null;
  diff: number; // |PR − PA| con los valores redondeados que se muestran
  bothHigh: boolean;
  tieBreak: null | "area1" | "area2" | "default";
  areas: { id: number; title: string; R: number | null; A: number | null }[];
  marked: number[];
}

/** Normaliza las respuestas según la edad: lo no mostrado queda null, lo demás 0 o 1. */
export function normalizeKidsAnswers(raw: Record<number, unknown>, age: KidsAgeBand): KidsAnswers {
  const out: KidsAnswers = {};
  for (const item of KIDS_ITEMS) out[item.id] = isShown(item, age) ? (raw[item.id] === 1 || raw[item.id] === true ? 1 : 0) : null;
  return out;
}

const pct = (marked: number, shown: number) => (shown === 0 ? null : (marked / shown) * 100);

function sidePct(answers: KidsAnswers, side: KidsSide, area?: number) {
  const items = KIDS_ITEMS.filter((i) => i.side === side && (area === undefined || i.area === area) && answers[i.id] !== null);
  return pct(items.filter((i) => answers[i.id] === 1).length, items.length);
}

export function scoreKids(answers: KidsAnswers, t: KidsThresholds): KidsScores {
  const shown = KIDS_ITEMS.filter((i) => answers[i.id] !== null);
  const marked = shown.filter((i) => answers[i.id] === 1).map((i) => i.id);
  const prRaw = sidePct(answers, "R") ?? 0;
  const paRaw = sidePct(answers, "A") ?? 0;
  const PR = Math.round(prRaw), PA = Math.round(paRaw);
  const total = shown.length ? (marked.length / shown.length) * 100 : 0;
  const areas = KIDS_AREAS.map((a) => {
    const r = sidePct(answers, "R", a.id), b = sidePct(answers, "A", a.id);
    return { id: a.id, title: a.title, R: r === null ? null : Math.round(r), A: b === null ? null : Math.round(b) };
  });

  if (marked.length === 0) {
    return { result: "none", PR: 0, PA: 0, total: 0, intensity: null, imbalance: null, diff: 0, bothHigh: false, tieBreak: null, areas, marked };
  }

  let result: KidsResultKind;
  let tieBreak: KidsScores["tieBreak"] = null;
  if (prRaw > paRaw) result = "red";
  else if (paRaw > prRaw) result = "blue";
  else {
    // Desempate 1: Movimiento · Desempate 2: Vida diaria y sentidos · si sigue empatado: rojo
    const r1 = sidePct(answers, "R", 1) ?? 0, a1 = sidePct(answers, "A", 1) ?? 0;
    const r2 = sidePct(answers, "R", 2) ?? 0, a2 = sidePct(answers, "A", 2) ?? 0;
    if (r1 !== a1) { result = r1 > a1 ? "red" : "blue"; tieBreak = "area1"; }
    else if (r2 !== a2) { result = r2 > a2 ? "red" : "blue"; tieBreak = "area2"; }
    else { result = "red"; tieBreak = "default"; }
  }

  const intensity: Intensity = total >= t.intensity_marked ? "marcada" : total >= t.intensity_moderate ? "moderada" : "leve";
  const diff = Math.abs(PR - PA);
  const imbalance: Imbalance = diff >= t.imbalance_marked ? "marcado" : diff >= t.imbalance_clear ? "claro" : "ligero";
  const bothHigh = prRaw >= t.both_high && paRaw >= t.both_high;

  return { result, PR, PA, total: Math.round(total), intensity, imbalance, diff, bothHigh, tieBreak, areas, marked };
}

export const KIDS_PROFILE = {
  red: { name: "El Arquitecto Verbal", tag: "Perfil rojo", color: "red" as const },
  blue: { name: "El Integrador Contextual", tag: "Perfil azul", color: "blue" as const },
};

/** "Mateo" o "tu hijo" cuando no se capturó el nombre. */
export const childRef = (name?: string | null) => (name && name.trim() ? name.trim() : "tu hijo");
