import { loadString, saveString } from '../core/storage.js';

const ORDER = ['system', 'light', 'dark'];
const ICON = { system: 'Monitor', light: 'Sun', dark: 'Moon' };

const saved = loadString('ett-theme', 'system');
export let theme = ORDER.includes(saved) ? saved : 'system';

export function applyTheme() {
  if (theme === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
}

export function cycleTheme() {
  theme = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
  saveString('ett-theme', theme);
  applyTheme();
}

export const themeIcon = () => ICON[theme];
