import { VERBS } from '../data/verbs.js';

// Los 12 tiempos en voz activa. phrase() devuelve la forma verbal sin el sujeto.
export const SUBJECTS = ['I', 'you', 'he', 'she', 'we', 'they'];

const isThird = s => s === 'he' || s === 'she';
const beForm = (s, time) => time === 'present'
  ? (s === 'I' ? 'am' : isThird(s) ? 'is' : 'are')
  : (s === 'I' || isThird(s) ? 'was' : 'were');
const haveForm = s => isThird(s) ? 'has' : 'have';

const DEFINITIONS = [
  {
    id: 'pres_simple', es: 'Presente simple', en: 'Present simple',
    formula: { es: 'base (+s con he/she)', en: 'base (+s with he/she)' },
    markers: ['every day', 'usually', 'always'],
    phrase: (v, s) => isThird(s) ? v.third : v.base,
  },
  {
    id: 'pres_cont', es: 'Presente continuo', en: 'Present continuous',
    formula: { es: 'am/is/are + -ing', en: 'am/is/are + -ing' },
    markers: ['right now', 'at the moment'],
    phrase: (v, s) => `${beForm(s, 'present')} ${v.ing}`,
  },
  {
    id: 'pres_perf', es: 'Presente perfecto', en: 'Present perfect',
    formula: { es: 'have/has + participio', en: 'have/has + past participle' },
    markers: ['already', 'just', 'ever', 'yet'],
    phrase: (v, s) => `${haveForm(s)} ${v.pp}`,
  },
  {
    id: 'pres_perf_cont', es: 'Presente perfecto continuo', en: 'Present perfect continuous',
    formula: { es: 'have/has been + -ing', en: 'have/has been + -ing' },
    markers: ['for years', 'since 2020', 'lately'],
    phrase: (v, s) => `${haveForm(s)} been ${v.ing}`,
  },
  {
    id: 'past_simple', es: 'Pasado simple', en: 'Past simple',
    formula: { es: 'pasado (2.ª forma)', en: 'past (2nd form)' },
    markers: ['yesterday', 'last week', 'in 2019'],
    phrase: v => v.past,
  },
  {
    id: 'past_cont', es: 'Pasado continuo', en: 'Past continuous',
    formula: { es: 'was/were + -ing', en: 'was/were + -ing' },
    markers: ['at 8 pm yesterday', 'at that moment'],
    phrase: (v, s) => `${beForm(s, 'past')} ${v.ing}`,
  },
  {
    id: 'past_perf', es: 'Pasado perfecto', en: 'Past perfect',
    formula: { es: 'had + participio', en: 'had + past participle' },
    markers: ['by the time we arrived', 'before the class started'],
    phrase: v => `had ${v.pp}`,
  },
  {
    id: 'past_perf_cont', es: 'Pasado perfecto continuo', en: 'Past perfect continuous',
    formula: { es: 'had been + -ing', en: 'had been + -ing' },
    markers: ['for hours before the meeting', 'all morning before lunch'],
    phrase: v => `had been ${v.ing}`,
  },
  {
    id: 'fut_simple', es: 'Futuro simple', en: 'Future simple',
    formula: { es: 'will + base', en: 'will + base' },
    markers: ['tomorrow', 'next week', 'soon'],
    phrase: v => `will ${v.base}`,
  },
  {
    id: 'fut_cont', es: 'Futuro continuo', en: 'Future continuous',
    formula: { es: 'will be + -ing', en: 'will be + -ing' },
    markers: ['this time tomorrow', 'at 9 pm tomorrow'],
    phrase: v => `will be ${v.ing}`,
  },
  {
    id: 'fut_perf', es: 'Futuro perfecto', en: 'Future perfect',
    formula: { es: 'will have + participio', en: 'will have + past participle' },
    markers: ['by next year', 'by tomorrow'],
    phrase: v => `will have ${v.pp}`,
  },
  {
    id: 'fut_perf_cont', es: 'Futuro perfecto continuo', en: 'Future perfect continuous',
    formula: { es: 'will have been + -ing', en: 'will have been + -ing' },
    markers: ['for ten years by 2030', 'for two hours by noon'],
    phrase: v => `will have been ${v.ing}`,
  },
];

// time: pres | past | fut — aspect: simple | cont | perf | perf_cont
export const TENSES = DEFINITIONS.map(t => {
  const [time, ...aspect] = t.id.split('_');
  return { ...t, time, aspect: aspect.join('_') };
});

export const TENSE_BY_ID = Object.fromEntries(TENSES.map(t => [t.id, t]));

// Claves de tarjeta para la repetición espaciada: "modo|verbo|tiempo"
export const poolKeys = (prefix, tenses, verbs = VERBS) =>
  tenses.flatMap(t => verbs.map(v => `${prefix}|${v.base}|${t.id}`));
