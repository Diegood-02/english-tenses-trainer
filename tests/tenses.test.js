import { describe, it, expect } from 'vitest';
import {
  TENSES, TENSE_BY_ID, poolKeys, verbPhrase, clause, sentence, formula, supports,
  tensesFor, verbsFor, LEVELS,
} from '../src/core/tenses.js';
import { VERBS, VERB_BY_BASE } from '../src/data/verbs.js';
import { THEORY } from '../src/data/theory.js';

const V = VERB_BY_BASE;
const T = TENSE_BY_ID;

describe('afirmativa de los 12 tiempos', () => {
  const expected = {
    pres_simple: ['write', 'writes', 'write'],
    pres_cont: ['am writing', 'is writing', 'are writing'],
    pres_perf: ['have written', 'has written', 'have written'],
    pres_perf_cont: ['have been writing', 'has been writing', 'have been writing'],
    past_simple: ['wrote', 'wrote', 'wrote'],
    past_cont: ['was writing', 'was writing', 'were writing'],
    past_perf: ['had written', 'had written', 'had written'],
    past_perf_cont: ['had been writing', 'had been writing', 'had been writing'],
    fut_simple: ['will write', 'will write', 'will write'],
    fut_cont: ['will be writing', 'will be writing', 'will be writing'],
    fut_perf: ['will have written', 'will have written', 'will have written'],
    fut_perf_cont: ['will have been writing', 'will have been writing', 'will have been writing'],
  };

  for (const [id, [i, she, they]] of Object.entries(expected)) {
    it(`${id}: I / she / they`, () => {
      expect(verbPhrase(T[id], V.write, 'I')).toBe(i);
      expect(verbPhrase(T[id], V.write, 'she')).toBe(she);
      expect(verbPhrase(T[id], V.write, 'they')).toBe(they);
    });
  }

  it('usa la 3.ª persona con cambios ortográficos', () => {
    expect(verbPhrase(T.pres_simple, V.study, 'he')).toBe('studies');
    expect(verbPhrase(T.pres_simple, V.go, 'she')).toBe('goes');
    expect(verbPhrase(T.pres_simple, V.have, 'he')).toBe('has');
    expect(verbPhrase(T.pres_cont, V.stop, 'you')).toBe('are stopping');
  });
});

describe('negativas y preguntas', () => {
  it('tiempos simples usan do/does/did con el verbo en base', () => {
    expect(verbPhrase(T.pres_simple, V.write, 'she', 'neg')).toBe('does not write');
    expect(verbPhrase(T.pres_simple, V.write, 'they', 'neg')).toBe('do not write');
    expect(verbPhrase(T.past_simple, V.go, 'I', 'neg')).toBe('did not go');
    expect(clause(T.pres_simple, V.study, 'he', 'q')).toBe('Does he study');
    expect(clause(T.past_simple, V.eat, 'you', 'q')).toBe('Did you eat');
  });

  it('el not va después del primer auxiliar', () => {
    expect(verbPhrase(T.pres_perf_cont, V.write, 'she', 'neg')).toBe('has not been writing');
    expect(verbPhrase(T.fut_perf, V.write, 'I', 'neg')).toBe('will not have written');
    expect(verbPhrase(T.past_cont, V.write, 'we', 'neg')).toBe('were not writing');
  });

  it('en preguntas el primer auxiliar va antes del sujeto', () => {
    expect(clause(T.pres_perf, V.write, 'she', 'q')).toBe('Has she written');
    expect(clause(T.fut_perf_cont, V.work, 'they', 'q')).toBe('Will they have been working');
    expect(clause(T.pres_cont, V.read, 'I', 'q')).toBe('Am I reading');
  });

  it('arma la oración completa con complemento y marcador', () => {
    expect(sentence(T.pres_perf, V.write, 'she', 'aff', 'today')).toBe('She has written a letter today.');
    expect(sentence(T.past_simple, V.go, 'they', 'q', 'yesterday')).toBe('Did they go to school yesterday?');
  });
});

describe('verbo be', () => {
  const be = V.be;

  it('conjuga am/is/are y was/were sin do', () => {
    expect(verbPhrase(T.pres_simple, be, 'I')).toBe('am');
    expect(verbPhrase(T.pres_simple, be, 'she')).toBe('is');
    expect(verbPhrase(T.pres_simple, be, 'we', 'neg')).toBe('are not');
    expect(verbPhrase(T.past_simple, be, 'he')).toBe('was');
    expect(clause(T.past_simple, be, 'you', 'q')).toBe('Were you');
    expect(verbPhrase(T.pres_perf, be, 'she')).toBe('has been');
    expect(verbPhrase(T.fut_simple, be, 'I', 'neg')).toBe('will not be');
  });

  it('no se practica en los tiempos continuos', () => {
    expect(supports(be, T.pres_cont)).toBe(false);
    expect(supports(be, T.pres_perf_cont)).toBe(false);
    expect(supports(be, T.pres_perf)).toBe(true);
    expect(poolKeys('conj', [T.pres_cont])).not.toContain('conj|be|pres_cont');
  });
});

describe('fórmulas', () => {
  it('genera afirmativa, negativa y pregunta', () => {
    expect(formula(T.pres_perf, 'aff', 'es')).toBe('have/has + participio');
    expect(formula(T.pres_perf, 'neg', 'en')).toBe('have/has + not + past participle');
    expect(formula(T.pres_perf_cont, 'q', 'es')).toBe('Have/Has + sujeto + been + -ing?');
    expect(formula(T.pres_simple, 'neg', 'es')).toBe('do/does + not + base');
    expect(formula(T.past_simple, 'q', 'en')).toBe('Did + subject + base form?');
  });
});

describe('niveles', () => {
  it('son acumulativos', () => {
    const counts = LEVELS.map(l => tensesFor(l).length);
    expect(counts).toEqual([3, 6, 9, 12]);
    expect(verbsFor('A1').length).toBeLessThan(verbsFor('A2').length);
    expect(verbsFor('B2')).toHaveLength(VERBS.length);
  });

  it('A1 incluye los básicos y no los avanzados', () => {
    const a1 = verbsFor('A1').map(v => v.base);
    expect(a1).toContain('be');
    expect(a1).toContain('write');
    expect(a1).not.toContain('withdraw');
  });
});

describe('datos', () => {
  it('hay más de 200 verbos', () => {
    expect(VERBS.length).toBeGreaterThan(200);
  });

  it('cada verbo tiene todas sus formas, traducción, complemento y nivel', () => {
    for (const v of VERBS) {
      for (const f of [v.base, v.past, v.pp, v.ing, v.third]) expect(f).toMatch(/^[a-z]+$/);
      expect(v.es.length).toBeGreaterThan(0);
      expect(v.obj.length).toBeGreaterThan(0);
      expect(LEVELS).toContain(v.level);
    }
  });

  it('no hay verbos repetidos', () => {
    expect(new Set(VERBS.map(v => v.base)).size).toBe(VERBS.length);
  });

  it('cada tiempo tiene nombre, nivel, marcadores y teoría', () => {
    expect(TENSES).toHaveLength(12);
    for (const t of TENSES) {
      expect(t.es && t.en).toBeTruthy();
      expect(LEVELS).toContain(t.level);
      expect(t.markers.length).toBeGreaterThan(0);
      expect(THEORY[t.id].length).toBeGreaterThan(1);
    }
  });

  it('genera una clave por verbo y tiempo', () => {
    const keys = poolKeys('conj', [T.pres_perf]);
    expect(keys).toHaveLength(VERBS.length);
    expect(keys).toContain('conj|write|pres_perf');
  });
});
