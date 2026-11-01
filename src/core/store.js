import { load, save } from './storage.js';
import { defaultState } from './progress.js';

// Misma clave que la v1: el progreso anterior (tenses, hangman) se conserva y se completa.
const KEY = 'ett-progress';
const listeners = new Set();

const saved = load(KEY, {});
export let state = { ...defaultState(), ...(saved && typeof saved === 'object' ? saved : {}) };

export function commit(next) {
  state = next;
  save(KEY, state);
  listeners.forEach(fn => fn(state));
}

export const resetState = () => commit(defaultState());

export const onChange = fn => listeners.add(fn);
