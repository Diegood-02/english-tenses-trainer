import { describe, it, expect } from 'vitest';
import { TENSES, TENSE_BY_ID, poolKeys } from '../src/core/tenses.js';
import { VERBS, VERB_BY_BASE } from '../src/data/verbs.js';

const write = VERB_BY_BASE.write;
const phrase = (tenseId, verb, subject) => TENSE_BY_ID[tenseId].phrase(verb, subject);

describe('conjugación de los 12 tiempos', () => {
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
      expect(phrase(id, write, 'I')).toBe(i);
      expect(phrase(id, write, 'she')).toBe(she);
      expect(phrase(id, write, 'they')).toBe(they);
    });
  }

  it('usa la 3.ª persona irregular y con cambios ortográficos', () => {
    expect(phrase('pres_simple', VERB_BY_BASE.study, 'he')).toBe('studies');
    expect(phrase('pres_simple', VERB_BY_BASE.go, 'she')).toBe('goes');
    expect(phrase('pres_simple', VERB_BY_BASE.have, 'he')).toBe('has');
    expect(phrase('pres_cont', VERB_BY_BASE.stop, 'you')).toBe('are stopping');
  });

  it('clasifica cada tiempo por tiempo y aspecto', () => {
    expect(TENSE_BY_ID.pres_perf_cont).toMatchObject({ time: 'pres', aspect: 'perf_cont' });
    expect(TENSE_BY_ID.fut_simple).toMatchObject({ time: 'fut', aspect: 'simple' });
  });
});

describe('datos', () => {
  it('cada verbo tiene todas sus formas en minúsculas', () => {
    for (const v of VERBS) {
      for (const f of [v.base, v.past, v.pp, v.ing, v.third]) {
        expect(f).toMatch(/^[a-z]+$/);
      }
      expect(v.es.length).toBeGreaterThan(0);
    }
  });

  it('no hay verbos repetidos', () => {
    expect(new Set(VERBS.map(v => v.base)).size).toBe(VERBS.length);
  });

  it('cada tiempo tiene nombre bilingüe, fórmula y marcadores', () => {
    expect(TENSES).toHaveLength(12);
    for (const t of TENSES) {
      expect(t.es && t.en && t.formula.es && t.formula.en).toBeTruthy();
      expect(t.markers.length).toBeGreaterThan(0);
    }
  });

  it('genera una clave por verbo y tiempo', () => {
    const keys = poolKeys('conj', [TENSE_BY_ID.pres_perf]);
    expect(keys).toHaveLength(VERBS.length);
    expect(keys).toContain('conj|write|pres_perf');
  });
});
