export interface TranslationResult {
  translatedText: string;
  detectedLanguage: string | null;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationEntry extends TranslationResult {
  id: string;
  sourceText: string;
  createdAt: number;
}

export interface ApiError {
  error: { code: string; message: string };
}
export type View = 'translate' | 'history' | 'about';
export type Theme = 'light' | 'dark';
