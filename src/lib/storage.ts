import type { Theme, TranslationEntry } from '../types.ts';
import { LANGUAGE_CODES } from '../data/languages.ts';

const HISTORY_KEY = 'lingora:history:v1';
const THEME_KEY = 'lingora:theme:v1';
const MAX_HISTORY = 30;

const storage = (): Storage | null => {
  try { return typeof window !== 'undefined' ? window.localStorage : null; }
  catch { return null; }
};

function isEntry(value: unknown): value is TranslationEntry {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<TranslationEntry>;
  return typeof item.id === 'string'
    && typeof item.sourceText === 'string'
    && typeof item.translatedText === 'string'
    && typeof item.createdAt === 'number' && Number.isFinite(item.createdAt)
    && typeof item.sourceLanguage === 'string'
    && (item.sourceLanguage === 'auto' || LANGUAGE_CODES.has(item.sourceLanguage))
    && typeof item.targetLanguage === 'string' && LANGUAGE_CODES.has(item.targetLanguage)
    && (item.detectedLanguage === null || typeof item.detectedLanguage === 'string');
}

export function loadHistory(): TranslationEntry[] {
  try {
    const raw = storage()?.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isEntry).slice(0, MAX_HISTORY) : [];
  } catch { return []; }
}

export function saveHistory(entries: TranslationEntry[]): boolean {
  try { storage()?.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY))); return Boolean(storage()); }
  catch { return false; }
}
export function loadTheme(): Theme {
  try { return storage()?.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'; }
  catch { return 'light'; }
}
export function saveTheme(theme: Theme): void {
  try { storage()?.setItem(THEME_KEY, theme); }
  catch { /* Private browsing may prevent persistence. Theme still works in memory. */ }
}
export function insertHistory(entries: TranslationEntry[], entry: TranslationEntry): TranslationEntry[] {
  const duplicatesRemoved = entries.filter(existing =>
    !(existing.sourceText === entry.sourceText
      && existing.sourceLanguage === entry.sourceLanguage
      && existing.targetLanguage === entry.targetLanguage));
  return [entry, ...duplicatesRemoved].slice(0, MAX_HISTORY);
}
