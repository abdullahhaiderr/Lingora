import { ArrowLeft, ArrowRight, Clock3, RotateCcw, Trash2 } from 'lucide-react';
import type { TranslationEntry } from '../types';
import { languageName } from '../data/languages';

function formatTime(time: number) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(time);
}
export function HistoryView({ history, onReuse, onClear, onRemove, onNavigate }: {
  history: TranslationEntry[]; onReuse: (entry: TranslationEntry) => void;
  onClear: () => void; onRemove: (id: string) => void; onNavigate: () => void;
}) {
  return (
    <section className="page-container inner-page" aria-labelledby="history-heading">
      <div className="inner-page-intro">
        <div className="eyebrow"><span className="eyebrow-line" /> YOUR PERSONAL LIBRARY <span className="eyebrow-suffix">/ 01</span></div>
        <h1 id="history-heading" className="inner-heading">Your words, <em>remembered.</em></h1>
        <div className="inner-subhead"><p>Pick up where you left off. Your translations stay right here, on this device.</p>
          {history.length > 0 && <button type="button" className="text-danger-button" onClick={onClear}><Trash2 size={15}/> Clear history</button>}</div>
      </div>
      {history.length === 0 ? <div className="history-blank">
        <div className="history-empty-symbol"><Clock3 size={30} strokeWidth={1.4}/></div>
        <h2>A clean slate.</h2>
        <p>Your recent translations will appear here. Nothing is shared or synced to an account.</p>
        <button type="button" className="primary-button" onClick={onNavigate}>Start translating <ArrowRight size={17} /></button>
      </div> : <div className="history-list">
        <div className="history-list-heading"><span>RECENT TRANSLATIONS</span><span>{history.length} {history.length === 1 ? 'ENTRY' : 'ENTRIES'}</span></div>
        {history.map((entry, index) => <article className="history-entry" key={entry.id}>
          <div className="entry-head"><span className="entry-number">{String(index + 1).padStart(2, '0')}</span>
            <span className="entry-language">{languageName(entry.detectedLanguage ?? entry.sourceLanguage)} <ArrowRight size={14}/> {languageName(entry.targetLanguage)}</span>
            <span className="entry-date">{formatTime(entry.createdAt)}</span></div>
          <div className="entry-text-grid"><p lang={entry.detectedLanguage ?? entry.sourceLanguage}>{entry.sourceText}</p>
            <p lang={entry.targetLanguage}>{entry.translatedText}</p></div>
          <div className="entry-actions"><button type="button" onClick={() => onReuse(entry)}><RotateCcw size={15} /> Reuse translation</button>
            <button type="button" className="entry-delete" aria-label="Remove this translation" onClick={() => onRemove(entry.id)}><Trash2 size={15}/></button></div>
        </article>)}
      </div>}
      <button className="back-link" type="button" onClick={onNavigate}><ArrowLeft size={16}/> Back to translate</button>
    </section>
  );
}
