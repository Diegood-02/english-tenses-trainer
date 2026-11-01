import { describe, it, expect } from 'vitest';
import { isCorrect, contract, normalizeAnswer } from '../src/core/answers.js';

describe('respuestas escritas', () => {
  it('ignora mayúsculas, espacios y puntuación', () => {
    expect(isCorrect('  Has   Written ', 'has written')).toBe(true);
    expect(isCorrect('Does she write?', 'Does she write')).toBe(true);
    expect(isCorrect('She has written a letter today', 'She has written a letter today.')).toBe(true);
  });

  it('acepta contracciones', () => {
    expect(isCorrect("hasn't written", 'has not written')).toBe(true);
    expect(isCorrect('won’t write', 'will not write')).toBe(true);
    expect(isCorrect("doesn't work", 'does not work')).toBe(true);
  });

  it('rechaza formas incorrectas', () => {
    expect(isCorrect('has wrote', 'has written')).toBe(false);
    expect(isCorrect('', 'has written')).toBe(false);
  });

  it('normaliza apóstrofos tipográficos', () => {
    expect(normalizeAnswer('I’m')).toBe("i'm");
  });

  it('contrae la negativa para mostrar la alternativa', () => {
    expect(contract('has not written')).toBe("hasn't written");
    expect(contract('will not have written')).toBe("won't have written");
    expect(contract('am not writing')).toBe('am not writing');
  });
});
