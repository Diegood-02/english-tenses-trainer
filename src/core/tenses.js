import { VERBS } from '../data/verbs.js';

export const SUBJECTS = ['I', 'you', 'he', 'she', 'we', 'they'];
export const FORMS = ['aff', 'neg', 'q'];
export const LEVELS = ['A1', 'A2', 'B1', 'B2'];

const levelIndex = level => LEVELS.indexOf(level);
export const withinLevel = (item, level) => levelIndex(item.level) <= levelIndex(level);

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const isThird = s => s === 'he' || s === 'she';
export const isBe = v => v.base === 'be';

const beForm = (s, time) => time === 'present'
  ? (s === 'I' ? 'am' : isThird(s) ? 'is' : 'are')
  : (s === 'I' || isThird(s) ? 'was' : 'were');
const haveForm = s => (isThird(s) ? 'has' : 'have');
const doForm = (s, time) => (time === 'past' ? 'did' : isThird(s) ? 'does' : 'do');

// build() da la forma afirmativa separada en auxiliares + verbo principal; a partir de ahí
// se derivan la negativa y la pregunta. auxLabel/mainLabel describen la fórmula.
// noBe: tiempos que no se practican con "be" (formas como "have been being" casi no se usan).
const DEFINITIONS = [
  {
    id: 'pres_simple', level: 'A1', es: 'Presente simple', en: 'Present simple',
    simple: { es: 'base (+s con he/she)', en: 'base (+s with he/she)' }, doLabel: 'do/does',
    markers: ['every day', 'usually', 'on weekends'],
    build: (v, s) => ({ aux: [], main: isBe(v) ? beForm(s, 'present') : isThird(s) ? v.third : v.base }),
  },
  {
    id: 'pres_cont', level: 'A1', es: 'Presente continuo', en: 'Present continuous',
    auxLabel: ['am/is/are'], mainLabel: 'ing', noBe: true,
    markers: ['right now', 'at the moment'],
    build: (v, s) => ({ aux: [beForm(s, 'present')], main: v.ing }),
  },
  {
    id: 'pres_perf', level: 'A2', es: 'Presente perfecto', en: 'Present perfect',
    auxLabel: ['have/has'], mainLabel: 'pp',
    markers: ['this week', 'recently', 'today'],
    build: (v, s) => ({ aux: [haveForm(s)], main: v.pp }),
  },
  {
    id: 'pres_perf_cont', level: 'B1', es: 'Presente perfecto continuo', en: 'Present perfect continuous',
    auxLabel: ['have/has', 'been'], mainLabel: 'ing', noBe: true,
    markers: ['for two hours', 'since 2020', 'lately'],
    build: (v, s) => ({ aux: [haveForm(s), 'been'], main: v.ing }),
  },
  {
    id: 'past_simple', level: 'A1', es: 'Pasado simple', en: 'Past simple',
    simple: { es: 'pasado (2.ª forma)', en: 'past (2nd form)' }, doLabel: 'did',
    markers: ['yesterday', 'last week', 'in 2019'],
    build: (v, s) => ({ aux: [], main: isBe(v) ? beForm(s, 'past') : v.past }),
  },
  {
    id: 'past_cont', level: 'A2', es: 'Pasado continuo', en: 'Past continuous',
    auxLabel: ['was/were'], mainLabel: 'ing', noBe: true,
    markers: ['at 8 pm yesterday', 'when the phone rang'],
    build: (v, s) => ({ aux: [beForm(s, 'past')], main: v.ing }),
  },
  {
    id: 'past_perf', level: 'B1', es: 'Pasado perfecto', en: 'Past perfect',
    auxLabel: ['had'], mainLabel: 'pp',
    markers: ['by the time we arrived', 'before the class started'],
    build: () => ({ aux: ['had'], main: null }),
  },
  {
    id: 'past_perf_cont', level: 'B2', es: 'Pasado perfecto continuo', en: 'Past perfect continuous',
    auxLabel: ['had', 'been'], mainLabel: 'ing', noBe: true,
    markers: ['for hours before the meeting', 'all morning before lunch'],
    build: () => ({ aux: ['had', 'been'], main: null }),
  },
  {
    id: 'fut_simple', level: 'A2', es: 'Futuro simple', en: 'Future simple',
    auxLabel: ['will'], mainLabel: 'base',
    markers: ['tomorrow', 'next week', 'soon'],
    build: () => ({ aux: ['will'], main: null }),
  },
  {
    id: 'fut_cont', level: 'B1', es: 'Futuro continuo', en: 'Future continuous',
    auxLabel: ['will', 'be'], mainLabel: 'ing', noBe: true,
    markers: ['this time tomorrow', 'at 9 pm tomorrow'],
    build: () => ({ aux: ['will', 'be'], main: null }),
  },
  {
    id: 'fut_perf', level: 'B2', es: 'Futuro perfecto', en: 'Future perfect',
    auxLabel: ['will', 'have'], mainLabel: 'pp',
    markers: ['by next year', 'by Friday'],
    build: () => ({ aux: ['will', 'have'], main: null }),
  },
  {
    id: 'fut_perf_cont', level: 'B2', es: 'Futuro perfecto continuo', en: 'Future perfect continuous',
    auxLabel: ['will', 'have', 'been'], mainLabel: 'ing', noBe: true,
    markers: ['for ten years by 2030', 'for two hours by noon'],
    build: () => ({ aux: ['will', 'have', 'been'], main: null }),
  },
];

// Los tiempos sin verbo principal en build() lo toman de mainLabel (base, pp o -ing)
const MAIN_FORM = { base: 'base', pp: 'pp', ing: 'ing' };

// time: pres | past | fut — aspect: simple | cont | perf | perf_cont
export const TENSES = DEFINITIONS.map(t => {
  const [time, ...aspect] = t.id.split('_');
  const build = (v, s) => {
    const parts = t.build(v, s);
    return parts.main === null ? { ...parts, main: v[MAIN_FORM[t.mainLabel]] } : parts;
  };
  return { ...t, time, aspect: aspect.join('_'), build };
});

export const TENSE_BY_ID = Object.fromEntries(TENSES.map(t => [t.id, t]));

export const supports = (v, t) => !(isBe(v) && t.noBe);

export const tensesFor = level => TENSES.filter(t => withinLevel(t, level));
export const verbsFor = level => VERBS.filter(v => withinLevel(v, level));

// ---------- Conjugación ----------

function words(t, v, s, form) {
  let { aux, main } = t.build(v, s);
  if (form !== 'aff' && !aux.length) {
    // Tiempos simples: "be" funciona como auxiliar; los demás verbos usan do/does/did
    if (isBe(v)) {
      aux = [main];
      main = null;
    } else {
      aux = [doForm(s, t.time)];
      main = v.base;
    }
  }
  return { aux, main };
}

// Forma verbal sin sujeto: "has written", "has not written"
export function verbPhrase(t, v, s, form = 'aff') {
  const { aux, main } = words(t, v, s, form);
  const list = form === 'neg' ? [aux[0], 'not', ...aux.slice(1), main] : [...aux, main];
  return list.filter(Boolean).join(' ');
}

// Oración base en partes; verb: true marca lo que se resalta.
// "She | has written" o, en pregunta, "Has | she | written"
export function clauseParts(t, v, s, form = 'aff') {
  if (form !== 'q') return [{ text: cap(s) }, { text: verbPhrase(t, v, s, form), verb: true }];
  const { aux, main } = words(t, v, s, form);
  const rest = [...aux.slice(1), main].filter(Boolean).join(' ');
  return [{ text: cap(aux[0]), verb: true }, { text: s }, ...(rest ? [{ text: rest, verb: true }] : [])];
}

export const clause = (t, v, s, form = 'aff') => clauseParts(t, v, s, form).map(p => p.text).join(' ');

export function sentence(t, v, s, form, marker) {
  return `${[clause(t, v, s, form), v.obj, marker].filter(Boolean).join(' ')}${form === 'q' ? '?' : '.'}`;
}

// ---------- Fórmulas ----------

const LABELS = {
  base: { es: 'base', en: 'base form' },
  ing: { es: '-ing', en: '-ing' },
  pp: { es: 'participio', en: 'past participle' },
  subject: { es: 'sujeto', en: 'subject' },
};
const capSlash = w => w.split('/').map(cap).join('/');

export function formula(t, form, lang) {
  if (t.simple) {
    if (form === 'aff') return t.simple[lang];
    const base = LABELS.base[lang];
    return form === 'neg'
      ? `${t.doLabel} + not + ${base}`
      : `${capSlash(t.doLabel)} + ${LABELS.subject[lang]} + ${base}?`;
  }
  const [first, ...rest] = t.auxLabel;
  const tail = [...rest, LABELS[t.mainLabel][lang]].join(' + ');
  if (form === 'aff') return `${first} + ${tail}`;
  if (form === 'neg') return `${first} + not + ${tail}`;
  return `${capSlash(first)} + ${LABELS.subject[lang]} + ${tail}?`;
}

// Claves de tarjeta para la repetición espaciada: "modo|verbo|tiempo"
export const poolKeys = (prefix, tenses, verbs = VERBS) =>
  tenses.flatMap(t => verbs.filter(v => supports(v, t)).map(v => `${prefix}|${v.base}|${t.id}`));
