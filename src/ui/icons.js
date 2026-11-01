import {
  createElement, House, BookOpen, PenLine, Target, Puzzle, ChartColumn, Flame, Sun, Moon,
  Monitor, Volume2, Zap, Trophy, ArrowRight, ArrowLeft, Lightbulb, Search, Check, X,
  RotateCcw, Heart,
} from 'lucide';

const ICONS = {
  House, BookOpen, PenLine, Target, Puzzle, ChartColumn, Flame, Sun, Moon, Monitor, Volume2,
  Zap, Trophy, ArrowRight, ArrowLeft, Lightbulb, Search, Check, X, RotateCcw, Heart,
};

const cache = new Map();

// Devuelve el SVG del icono como texto para usarlo dentro de plantillas HTML
export function icon(name, size = 20) {
  const id = `${name}:${size}`;
  if (!cache.has(id)) {
    const svg = createElement(ICONS[name]);
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('aria-hidden', 'true');
    cache.set(id, svg.outerHTML);
  }
  return cache.get(id);
}
