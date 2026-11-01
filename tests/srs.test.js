import { describe, it, expect } from 'vitest';
import {
  review, pickKey, dueCount, masteredCount, errorKeys, INTERVALS,
} from '../src/core/srs.js';

const NOW = 1_000_000_000_000;

describe('review', () => {
  it('una tarjeta nueva acertada pasa a la caja 1', () => {
    expect(review(undefined, true, NOW)).toEqual({ box: 1, due: NOW + INTERVALS[1] });
  });

  it('un fallo regresa a la caja 0', () => {
    expect(review({ box: 4, due: NOW }, false, NOW)).toEqual({ box: 0, due: NOW + INTERVALS[0] });
  });

  it('no pasa de la última caja', () => {
    const last = INTERVALS.length - 1;
    expect(review({ box: last, due: NOW }, true, NOW).box).toBe(last);
  });
});

describe('pickKey', () => {
  const keys = ['a', 'b', 'c'];
  const first = () => 0;
  const last = () => 0.99;

  it('prioriza una tarjeta vencida', () => {
    const cards = { a: { box: 1, due: NOW - 1 }, b: { box: 2, due: NOW + 9999 } };
    expect(pickKey(keys, cards, NOW, first)).toBe('a');
  });

  it('a veces elige una nueva aunque haya vencidas', () => {
    const cards = { a: { box: 1, due: NOW - 1 }, b: { box: 2, due: NOW + 9999 } };
    expect(pickKey(keys, cards, NOW, last)).toBe('c');
  });

  it('elige una nueva si no hay vencidas', () => {
    const cards = { a: { box: 1, due: NOW + 10 } };
    expect(['b', 'c']).toContain(pickKey(keys, cards, NOW, Math.random));
  });

  it('si todo está visto y nada vencido, elige la más próxima', () => {
    const cards = {
      a: { box: 3, due: NOW + 300 },
      b: { box: 1, due: NOW + 100 },
      c: { box: 2, due: NOW + 200 },
    };
    expect(pickKey(keys, cards, NOW, first)).toBe('b');
  });

  it('evita repetir la tarjeta anterior', () => {
    const cards = { a: { box: 0, due: NOW - 1 } };
    for (let i = 0; i < 20; i++) {
      expect(pickKey(keys, cards, NOW, Math.random, 'a')).not.toBe('a');
    }
  });

  it('con una sola tarjeta la repite', () => {
    expect(pickKey(['a'], {}, NOW, Math.random, 'a')).toBe('a');
  });
});

describe('contadores', () => {
  const cards = {
    a: { box: 0, due: NOW - 1 },
    b: { box: 4, due: NOW + 1 },
    c: { box: 5, due: NOW },
  };

  it('cuenta las vencidas', () => expect(dueCount(cards, NOW)).toBe(2));
  it('cuenta las dominadas (caja 4 o más)', () => expect(masteredCount(cards)).toBe(2));
});

describe('errorKeys', () => {
  it('lista solo las preguntas falladas por última vez de los modos repasables', () => {
    const cards = {
      'conj|write|pres_perf': { box: 0, due: NOW },
      'id|go|past_simple': { box: 0, due: NOW },
      'lis|eat|fut_simple': { box: 0, due: NOW },
      'conj|read|pres_simple': { box: 2, due: NOW },
      'card|write': { box: 0, due: NOW },
    };
    expect(errorKeys(cards).sort()).toEqual(['conj|write|pres_perf', 'id|go|past_simple', 'lis|eat|fut_simple']);
  });

  it('un acierto saca la pregunta de la lista', () => {
    const key = 'conj|write|pres_perf';
    const cards = { [key]: review(review(undefined, false, NOW), true, NOW) };
    expect(errorKeys(cards)).toEqual([]);
  });
});
