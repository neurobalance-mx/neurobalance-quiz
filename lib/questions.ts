// Banco de preguntas del Quiz de Perfil Cerebral Neurobalance · V1
// Las etiquetas de lado (L/R) y tipo (fortaleza/reto) son metadatos internos: nunca se muestran en el quiz.

export const QUIZ_VERSION = "v1";

export type Side = "L" | "R";
export type Kind = "strength" | "challenge";
export type TargetType = "self" | "other";
export type AgeBand = "0_2" | "3_5" | "6_12" | "13_17" | "18_plus";

export interface Question {
  id: number;
  category: number; // 1–6
  side: Side;
  kind: Kind;
  other: string; // redacción original (tercera persona)
  self: string; // redacción en primera persona
}

export const CATEGORIES = [
  { id: 1, title: "Lenguaje y comunicación", subtitle: "Cómo comprendemos, organizamos y utilizamos la información verbal y no verbal." },
  { id: 2, title: "Emociones y relaciones sociales", subtitle: "Cómo reconocemos, expresamos y respondemos a las emociones y señales de otras personas." },
  { id: 3, title: "Aprendizaje y memoria", subtitle: "Cómo aprendemos, almacenamos y recordamos información." },
  { id: 4, title: "Movimiento y orientación corporal", subtitle: "Cómo organizamos nuestras acciones y nos desenvolvemos en el espacio." },
  { id: 5, title: "Atención, conducta y organización", subtitle: "Cómo seguimos instrucciones, organizamos acciones y ajustamos nuestras respuestas." },
  { id: 6, title: "Percepción e integración de información", subtitle: "Cómo distinguimos sonidos, símbolos, formas y relaciones espaciales." },
] as const;

// [tercera persona, primera persona]
const TEXTS: [string, string][] = [
  // 1 · Lenguaje y comunicación
  ["Recuerda y utiliza con facilidad palabras, nombres o información específica sobre temas conocidos.",
   "Recuerdo y utilizo con facilidad palabras, nombres o información específica sobre temas que conozco."],
  ["Reconoce cómo se siente alguien a través de su tono de voz, aunque esa persona no explique lo que siente.",
   "Reconozco cómo se siente alguien a través de su tono de voz, aunque esa persona no explique lo que siente."],
  ["Puede expresar sus ideas verbalmente siguiendo un orden claro y comprensible.",
   "Puedo expresar mis ideas verbalmente siguiendo un orden claro y comprensible."],
  ["Comprende cuándo una broma, un gesto o una expresión tiene un significado diferente al literal.",
   "Comprendo cuándo una broma, un gesto o una expresión tiene un significado diferente al literal."],
  ["Le cuesta encontrar las palabras o construir frases para expresar lo que piensa, siente o necesita.",
   "Me cuesta encontrar las palabras o construir frases para expresar lo que pienso, siento o necesito."],
  ["Le cuesta reconocer por los gestos, el tono o las expresiones cuándo otra persona quiere participar, cambiar de tema o terminar una conversación.",
   "Me cuesta reconocer por los gestos, el tono o las expresiones cuándo otra persona quiere participar, cambiar de tema o terminar una conversación."],
  // 2 · Emociones y relaciones sociales
  ["Puede identificar y expresar mediante palabras lo que está sintiendo.",
   "Puedo identificar y expresar mediante palabras lo que estoy sintiendo."],
  ["Reconoce cuando alguien está triste, molesto, preocupado o contento por su expresión facial.",
   "Reconozco cuando alguien está triste, molesto, preocupado o contento por su expresión facial."],
  ["Puede explicar verbalmente qué sucedió en una situación emocional o un desacuerdo.",
   "Puedo explicar verbalmente qué sucedió en una situación emocional o un desacuerdo."],
  ["Reconoce señales no verbales que indican que otra persona está interesada, aburrida, confundida o incómoda.",
   "Reconozco señales no verbales que indican que otra persona está interesada, aburrida, confundida o incómoda."],
  ["Cuando experimenta una emoción intensa, le cuesta explicar con palabras qué siente o qué necesita.",
   "Cuando experimento una emoción intensa, me cuesta explicar con palabras qué siento o qué necesito."],
  ["Le cuesta reconocer cómo se sienten otras personas si no se lo expresan directamente con palabras.",
   "Me cuesta reconocer cómo se sienten otras personas si no me lo expresan directamente con palabras."],
  // 3 · Aprendizaje y memoria
  ["Memoriza con facilidad nombres, números, palabras, datos específicos o información relacionada con sus intereses.",
   "Memorizo con facilidad nombres, números, palabras, datos específicos o información relacionada con mis intereses."],
  ["Recuerda con facilidad dónde están ubicados los objetos o cómo estaban acomodados dentro de un espacio.",
   "Recuerdo con facilidad dónde están ubicados los objetos o cómo estaban acomodados dentro de un espacio."],
  ["Aprende con facilidad una actividad nueva cuando se le explica verbalmente paso a paso.",
   "Aprendo con facilidad una actividad nueva cuando me la explican verbalmente paso a paso."],
  ["Reconoce con facilidad imágenes, lugares, rutas o configuraciones visuales que ha observado anteriormente.",
   "Reconozco con facilidad imágenes, lugares, rutas o configuraciones visuales que he observado anteriormente."],
  ["Le cuesta recordar instrucciones verbales, especialmente cuando incluyen varios pasos o elementos.",
   "Me cuesta recordar instrucciones verbales, especialmente cuando incluyen varios pasos o elementos."],
  ["Le cuesta recordar ubicaciones, recorridos o la disposición de los objetos dentro de un espacio.",
   "Me cuesta recordar ubicaciones, recorridos o la disposición de los objetos dentro de un espacio."],
  // 4 · Movimiento y orientación corporal
  ["Aprende con facilidad secuencias de movimientos, gestos o acciones manuales mediante la observación y la práctica.",
   "Aprendo con facilidad secuencias de movimientos, gestos o acciones manuales mediante la observación y la práctica."],
  ["Se desplaza con facilidad entre personas, muebles u obstáculos, calculando adecuadamente las distancias.",
   "Me desplazo con facilidad entre personas, muebles u obstáculos, calculando adecuadamente las distancias."],
  ["Puede realizar acciones aprendidas que requieren movimientos consecutivos, como utilizar utensilios o manipular herramientas apropiadas para su edad.",
   "Puedo realizar acciones aprendidas que requieren movimientos consecutivos, como utilizar utensilios o manipular herramientas apropiadas para mi edad."],
  ["Tiene facilidad para orientar, acomodar y ensamblar objetos o piezas según su forma y posición.",
   "Tengo facilidad para orientar, acomodar y ensamblar objetos o piezas según su forma y posición."],
  ["Le cuesta coordinar movimientos consecutivos para realizar una acción, aunque ya haya observado cómo hacerlo.",
   "Me cuesta coordinar movimientos consecutivos para realizar una acción, aunque ya haya observado cómo hacerlo."],
  ["Frecuentemente tropieza, choca con objetos o calcula mal la distancia entre su cuerpo y los elementos del entorno.",
   "Frecuentemente tropiezo, choco con objetos o calculo mal la distancia entre mi cuerpo y los elementos del entorno."],
  // 5 · Atención, conducta y organización
  ["Puede organizar una actividad siguiendo instrucciones o una secuencia de pasos.",
   "Puedo organizar una actividad siguiendo instrucciones o una secuencia de pasos."],
  ["Reconoce cambios relevantes en el ambiente y puede dirigir su atención hacia ellos.",
   "Reconozco cambios relevantes en el ambiente y puedo dirigir mi atención hacia ellos."],
  ["Puede recordar y aplicar instrucciones o reglas verbales durante juegos, actividades o tareas cotidianas.",
   "Puedo recordar y aplicar instrucciones o reglas verbales durante juegos, actividades o tareas cotidianas."],
  ["Cuando recibe una señal para detenerse o cambiar una acción, generalmente logra responder a tiempo.",
   "Cuando recibo una señal para detenerme o cambiar una acción, generalmente logro responder a tiempo."],
  ["Le cuesta organizar o completar actividades que requieren seguir varios pasos en determinado orden.",
   "Me cuesta organizar o completar actividades que requieren seguir varios pasos en determinado orden."],
  ["Le cuesta detener una respuesta impulsiva o interrumpir una acción que ya comenzó, incluso cuando recibe una señal clara.",
   "Me cuesta detener una respuesta impulsiva o interrumpir una acción que ya comencé, incluso cuando recibo una señal clara."],
  // 6 · Percepción e integración de información
  ["Distingue con facilidad palabras o sonidos del habla que son muy parecidos entre sí.",
   "Distingo con facilidad palabras o sonidos del habla que son muy parecidos entre sí."],
  ["Reconoce formas, figuras u objetos aunque cambien su orientación, tamaño o posición.",
   "Reconozco formas, figuras u objetos aunque cambien su orientación, tamaño o posición."],
  ["Reconoce diferencias entre letras, símbolos, números o información escrita similar, cuando estas habilidades corresponden a su etapa de desarrollo.",
   "Reconozco diferencias entre letras, símbolos, números o información escrita similar, cuando estas habilidades corresponden a mi etapa de desarrollo."],
  ["Puede identificar cómo se relacionan los diferentes elementos dentro de una imagen, construcción o espacio.",
   "Puedo identificar cómo se relacionan los diferentes elementos dentro de una imagen, construcción o espacio."],
  ["Confunde con frecuencia palabras o sonidos del habla que son parecidos, o necesita que se repitan para distinguirlos.",
   "Confundo con frecuencia palabras o sonidos del habla que son parecidos, o necesito que se repitan para distinguirlos."],
  ["Le cuesta comprender cómo se relacionan espacialmente distintos objetos, figuras o partes de una construcción.",
   "Me cuesta comprender cómo se relacionan espacialmente distintos objetos, figuras o partes de una construcción."],
];

// Patrón por categoría según la especificación: FL, FR, FL, FR, RL, RR
const PATTERN: { side: Side; kind: Kind }[] = [
  { side: "L", kind: "strength" }, { side: "R", kind: "strength" },
  { side: "L", kind: "strength" }, { side: "R", kind: "strength" },
  { side: "L", kind: "challenge" }, { side: "R", kind: "challenge" },
];

export const QUESTIONS: Question[] = TEXTS.map(([other, self], i) => ({
  id: i + 1,
  category: Math.floor(i / 6) + 1,
  ...PATTERN[i % 6],
  other,
  self,
}));

export const ANSWER_OPTIONS = [
  { value: 0, label: "Nunca" },
  { value: 1, label: "Rara vez" },
  { value: 2, label: "A veces" },
  { value: 3, label: "Frecuentemente" },
  { value: 4, label: "Casi siempre" },
] as const;

export function naLabel(target: TargetType) {
  return target === "self" ? "No lo he observado / No corresponde todavía a mi edad" : "No lo he observado / No corresponde todavía a su edad";
}

export const AGE_BANDS: { value: AgeBand; label: string }[] = [
  { value: "0_2", label: "0–2 años" },
  { value: "3_5", label: "3–5 años" },
  { value: "6_12", label: "6–12 años" },
  { value: "13_17", label: "13–17 años" },
  { value: "18_plus", label: "18 años o más" },
];

export const EARLY_AGE_BANDS: AgeBand[] = ["0_2", "3_5"];

// Descripción breve de cada reto, para mostrar solo los efectivamente reportados.
export const CHALLENGE_LABELS: Record<number, string> = {
  5: "Encontrar las palabras o construir frases para expresar ideas, emociones o necesidades.",
  6: "Reconocer por gestos o tono cuándo otra persona quiere participar, cambiar de tema o terminar una conversación.",
  11: "Explicar con palabras qué se siente o se necesita ante una emoción intensa.",
  12: "Reconocer cómo se sienten otras personas cuando no lo expresan con palabras.",
  17: "Recordar instrucciones verbales de varios pasos.",
  18: "Recordar ubicaciones, recorridos o la disposición de los objetos.",
  23: "Coordinar movimientos consecutivos para realizar una acción.",
  24: "Calcular la distancia entre el cuerpo y el entorno (tropiezos o choques).",
  29: "Organizar o completar actividades de varios pasos en orden.",
  30: "Detener una respuesta impulsiva o interrumpir una acción ya iniciada.",
  35: "Distinguir palabras o sonidos del habla parecidos.",
  36: "Comprender cómo se relacionan espacialmente objetos, figuras o partes de una construcción.",
};

// ---------- Preguntas de contexto 37–42 (no puntúan) ----------

export interface ContextOption { key: string; self: string; other: string; exclusive?: boolean }
export interface ContextQuestion {
  id: 37 | 38 | 39 | 40 | 41 | 42;
  short: string; // título corto para resultados y exportación
  self: string;
  other: string;
  multiple: boolean;
  max?: number;
  options: ContextOption[];
}

const same = (key: string, text: string, exclusive?: boolean): ContextOption => ({ key, self: text, other: text, exclusive });

export const CONTEXT_QUESTIONS: ContextQuestion[] = [
  {
    id: 37, short: "Tiempo libre", multiple: false,
    self: "¿Cómo prefieres pasar tu tiempo libre?",
    other: "¿Cómo prefiere pasar su tiempo libre?",
    options: [
      same("a", "Realizando actividades individuales."),
      same("b", "En compañía de una o dos personas conocidas."),
      same("c", "Participando en actividades grupales."),
      same("d", "Alternando actividades individuales y sociales."),
      same("e", "Depende de la situación."),
    ],
  },
  {
    id: 38, short: "Reuniones o grupos grandes", multiple: false,
    self: "¿Cómo reaccionas habitualmente en reuniones o grupos grandes?",
    other: "¿Cómo reacciona habitualmente en reuniones o grupos grandes?",
    options: [
      { key: "a", self: "Me integro y participo fácilmente.", other: "Se integra y participa fácilmente." },
      { key: "b", self: "Prefiero observar antes de participar.", other: "Prefiere observar antes de participar." },
      { key: "c", self: "Prefiero permanecer cerca de alguien conocido.", other: "Prefiere permanecer cerca de alguien conocido." },
      { key: "d", self: "Suelo sentirme incómodo o sobreestimulado.", other: "Suele sentirse incómodo o sobreestimulado." },
      { key: "e", self: "Prefiero evitar ese tipo de situaciones.", other: "Prefiere evitar ese tipo de situaciones." },
    ],
  },
  {
    id: 39, short: "Manera de conversar", multiple: false,
    self: "¿Cómo describirías tu manera habitual de conversar?",
    other: "¿Cómo describirías su manera habitual de conversar?",
    options: [
      { key: "a", self: "Inicio y mantengo conversaciones con facilidad.", other: "Inicia y mantiene conversaciones con facilidad." },
      { key: "b", self: "Respondo cuando me hablan, pero rara vez inicio conversaciones.", other: "Responde cuando le hablan, pero rara vez inicia conversaciones." },
      { key: "c", self: "Disfruto hablar extensamente sobre temas que me interesan.", other: "Disfruta hablar extensamente sobre temas que le interesan." },
      { key: "d", self: "Me cuesta mantener conversaciones de ida y vuelta.", other: "Le cuesta mantener conversaciones de ida y vuelta." },
      { key: "e", self: "Utilizo principalmente gestos, señas o comunicación alternativa.", other: "Utiliza principalmente gestos, señas o comunicación alternativa." },
      { key: "f", self: "Todavía no cuento con lenguaje conversacional.", other: "Todavía no cuenta con lenguaje conversacional." },
    ],
  },
  {
    id: 40, short: "Experiencias sensoriales", multiple: true,
    self: "¿Cómo respondes habitualmente a las experiencias sensoriales?",
    other: "¿Cómo responde habitualmente a las experiencias sensoriales?",
    options: [
      { key: "a", self: "Generalmente tolero bien sonidos, luces y texturas.", other: "Generalmente tolera bien sonidos, luces y texturas." },
      { key: "b", self: "Me molestan los ruidos fuertes o los ambientes concurridos.", other: "Le molestan los ruidos fuertes o los ambientes concurridos." },
      { key: "c", self: "Me incomodan determinadas texturas de ropa o alimentos.", other: "Le incomodan determinadas texturas de ropa o alimentos." },
      { key: "d", self: "Busco frecuentemente movimiento, presión o contacto físico.", other: "Busca frecuentemente movimiento, presión o contacto físico." },
      { key: "e", self: "Algunas sensaciones parecen no afectarme tanto como a otras personas.", other: "Algunas sensaciones parecen no afectarle tanto como a otras personas." },
      { key: "f", self: "Mi respuesta varía según el ambiente.", other: "Su respuesta varía según el ambiente." },
    ],
  },
  {
    id: 41, short: "Cambios inesperados", multiple: false,
    self: "¿Cómo reaccionas ante cambios inesperados en tus actividades o rutinas?",
    other: "¿Cómo reacciona ante cambios inesperados en sus actividades o rutinas?",
    options: [
      { key: "a", self: "Me adapto fácilmente.", other: "Se adapta fácilmente." },
      { key: "b", self: "Necesito una explicación o algo de tiempo.", other: "Necesita una explicación o algo de tiempo." },
      { key: "c", self: "Me siento incómodo, pero puedo adaptarme.", other: "Se siente incómodo, pero puede adaptarse." },
      { key: "d", self: "Me frustro o altero emocionalmente.", other: "Se frustra o altera emocionalmente." },
      { key: "e", self: "Puedo presentar reacciones intensas.", other: "Puede presentar reacciones intensas." },
      same("f", "Depende del cambio."),
    ],
  },
  {
    id: 42, short: "Factores que más afectan", multiple: true, max: 3,
    self: "¿Qué factores suelen afectar más tu funcionamiento cotidiano?",
    other: "¿Qué factores suelen afectar más su funcionamiento cotidiano?",
    options: [
      same("a", "Dormir poco o tener horarios irregulares."),
      same("b", "Ambientes con muchos estímulos."),
      same("c", "Actividades que requieren concentración prolongada."),
      same("d", "Cambios inesperados en la rutina."),
      same("e", "Situaciones sociales exigentes."),
      same("f", "Cansancio físico."),
      same("g", "Hambre o malestar corporal."),
      same("h", "No identifico factores específicos.", true),
    ],
  },
];

export function contextLabel(qid: number, key: string, target: TargetType = "self"): string {
  const q = CONTEXT_QUESTIONS.find((c) => c.id === qid);
  const o = q?.options.find((x) => x.key === key);
  return o ? o[target] : key;
}
