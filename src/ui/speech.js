import { icon } from './icons.js';
import { esc } from '../core/util.js';
import { tr } from '../i18n.js';

// Pronunciación con la voz del navegador (Web Speech API); se oculta si no hay soporte.
export const canSpeak = 'speechSynthesis' in window;

export function speak(text) {
  if (!canSpeak) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  const voice = speechSynthesis.getVoices().find(v => v.lang === 'en-US')
    || speechSynthesis.getVoices().find(v => v.lang.startsWith('en'));
  if (voice) utterance.voice = voice;
  speechSynthesis.speak(utterance);
}

export const speakButton = text => (canSpeak
  ? `<button type="button" class="icon-btn speak" data-speak="${esc(text)}" title="${tr('listen')}" aria-label="${tr('listen')}: ${esc(text)}">${icon('Volume2', 18)}</button>`
  : '');
