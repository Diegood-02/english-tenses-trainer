import { describe, it, expect } from 'vitest';
import {
  addDays, applyAnswer, applyHangman, applyTimed, currentStreak, dailyCount, dayKey, defaultState,
  levelInfo, touchStreak, weakTenses, XP,
} from '../src/core/progress.js';

describe('fechas', () => {
  it('formatea el día local', () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('suma días cruzando meses y años', () => {
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
  });
});

describe('racha', () => {
  it('no cambia si ya practicaste hoy', () => {
    const s = { count: 3, last: '2026-11-01' };
    expect(touchStreak(s, '2026-11-01')).toBe(s);
  });

  it('suma un día si practicaste ayer', () => {
    expect(touchStreak({ count: 3, last: '2026-10-31' }, '2026-11-01')).toEqual({ count: 4, last: '2026-11-01' });
  });

  it('se reinicia si dejaste pasar un día', () => {
    expect(touchStreak({ count: 9, last: '2026-10-29' }, '2026-11-01')).toEqual({ count: 1, last: '2026-11-01' });
  });

  it('sigue viva hasta el final del día siguiente', () => {
    expect(currentStreak({ count: 5, last: '2026-10-31' }, '2026-11-01')).toBe(5);
    expect(currentStreak({ count: 5, last: '2026-10-30' }, '2026-11-01')).toBe(0);
  });
});

describe('niveles', () => {
  it('calcula el nivel y el avance', () => {
    expect(levelInfo(0)).toEqual({ level: 1, into: 0, span: 100 });
    expect(levelInfo(100)).toEqual({ level: 2, into: 0, span: 200 });
    expect(levelInfo(299).level).toBe(2);
    expect(levelInfo(300).level).toBe(3);
  });
});

describe('applyAnswer', () => {
  const now = new Date(2026, 10, 1, 12).getTime();
  const today = '2026-11-01';

  it('actualiza estadísticas, tarjeta, XP, meta y racha sin mutar el estado', () => {
    const s0 = defaultState();
    const s1 = applyAnswer(s0, { tenseId: 'pres_perf', key: 'conj|write|pres_perf', ok: true, now });

    expect(s0).toEqual(defaultState());
    expect(s1.tenses.pres_perf).toEqual({ ok: 1, total: 1 });
    expect(s1.cards['conj|write|pres_perf'].box).toBe(1);
    expect(s1.xp).toBe(XP.correct);
    expect(dailyCount(s1, today)).toBe(1);
    expect(s1.streak).toEqual({ count: 1, last: today });
  });

  it('un fallo cuenta para la racha pero no para la meta ni el XP', () => {
    const s1 = applyAnswer(defaultState(), { tenseId: 'past_simple', key: 'k', ok: false, now });
    expect(s1.tenses.past_simple).toEqual({ ok: 0, total: 1 });
    expect(s1.xp).toBe(0);
    expect(dailyCount(s1, today)).toBe(0);
    expect(s1.streak.count).toBe(1);
  });

  it('la meta diaria se reinicia en un día nuevo', () => {
    const s = { ...defaultState(), daily: { date: '2026-10-31', count: 15 } };
    const s1 = applyAnswer(s, { tenseId: 'fut_simple', key: 'k', ok: true, now });
    expect(s1.daily).toEqual({ date: today, count: 1 });
  });

  it('acepta el progreso guardado de la versión 1', () => {
    const v1 = { tenses: { pres_simple: { ok: 2, total: 3 } }, hangman: { won: 1, lost: 0 } };
    const s = { ...defaultState(), ...v1 };
    const s1 = applyAnswer(s, { tenseId: 'pres_simple', key: 'k', ok: true, now });
    expect(s1.tenses.pres_simple).toEqual({ ok: 3, total: 4 });
  });
});

describe('otros tipos de respuesta', () => {
  const now = new Date(2026, 10, 1, 12).getTime();

  it('las tarjetas no cambian las estadísticas por tiempo y usan su propio XP', () => {
    const s1 = applyAnswer(defaultState(), { key: 'card|write', ok: true, now, xp: XP.flashcard });
    expect(s1.tenses).toEqual({});
    expect(s1.xp).toBe(XP.flashcard);
    expect(s1.cards['card|write'].box).toBe(1);
  });

  it('el récord del contrarreloj solo sube', () => {
    const s1 = applyTimed(defaultState(), 12);
    expect(s1.timedBest).toBe(12);
    expect(applyTimed(s1, 8)).toBe(s1);
  });
});

describe('applyHangman', () => {
  const now = new Date(2026, 10, 1, 12).getTime();

  it('una victoria suma XP y cuenta para la meta', () => {
    const s1 = applyHangman(defaultState(), true, now);
    expect(s1.hangman).toEqual({ won: 1, lost: 0 });
    expect(s1.xp).toBe(XP.hangmanWin);
    expect(dailyCount(s1, '2026-11-01')).toBe(1);
  });

  it('una derrota solo se registra', () => {
    const s1 = applyHangman(defaultState(), false, now);
    expect(s1.hangman).toEqual({ won: 0, lost: 1 });
    expect(s1.xp).toBe(0);
  });
});

describe('weakTenses', () => {
  it('ordena por menor precisión e ignora los que tienen pocas respuestas', () => {
    const stats = {
      a: { ok: 1, total: 4 },
      b: { ok: 3, total: 4 },
      c: { ok: 0, total: 2 },
      d: { ok: 5, total: 5 },
    };
    expect(weakTenses(stats, 3)).toEqual([{ id: 'a', pct: 25 }, { id: 'b', pct: 75 }]);
  });
});
