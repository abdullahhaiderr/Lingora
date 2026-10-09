import { useCallback, useEffect, useState } from 'react';

export type SpeechSide = 'source' | 'target';
export function useSpeech() {
  const [speaking, setSpeaking] = useState<SpeechSide | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(null);
  }, [supported]);

  const speak = useCallback((side: SpeechSide, text: string, language: string) => {
    setSpeechError(null);
    if (!supported) {
      setSpeechError('Text-to-speech is not supported in this browser.');
      return;
    }
    if (!text.trim()) return;
    if (speaking === side) { stop(); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'auto' ? navigator.language : language;
    utterance.rate = 0.94;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(null);
    utterance.onerror = (event) => {
      setSpeaking(null);
      if (event.error !== 'canceled' && event.error !== 'interrupted')
        setSpeechError('Could not read the text aloud with the available voice.');
    };
    setSpeaking(side);
    window.speechSynthesis.speak(utterance);
  }, [supported, speaking, stop]);

  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported]);
  return { speak, stop, speaking, speechError, supported };
}
