import { Check, ChevronDown, Languages, Search } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { LANGUAGES, languageByCode } from '../data/languages';

export function LanguageSelect({ value, onChange, allowAuto = false, label, align = 'left', disabled = false }: {
  value: string; onChange: (code: string) => void; allowAuto?: boolean; label: string;
  align?: 'left' | 'right'; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const container = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const id = useId();
  const current = languageByCode(value);
  const items = useMemo(() => LANGUAGES.filter(language =>
    `${language.name} ${language.nativeName} ${language.code}`.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim())), [query]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    search.current?.focus();
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const choose = (code: string) => {
    onChange(code); setOpen(false); setQuery('');
    requestAnimationFrame(() => button.current?.focus());
  };
  const onKeyboard = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); button.current?.focus(); return; }
    if (!open || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return;
    event.preventDefault();
    const options = Array.from(container.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
    if (!options.length) return;
    const currentIndex = options.indexOf(document.activeElement as HTMLButtonElement);
    const nextIndex = currentIndex < 0 ? (event.key === 'ArrowDown' ? 0 : options.length - 1)
      : (currentIndex + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
    options[nextIndex].focus();
  };
  return (
    <div className="language-picker" ref={container} onKeyDown={onKeyboard}>
      <span className="sr-only" id={`${id}-label`}>{label}</span>
      <button ref={button} type="button" className={`language-trigger ${open ? 'language-trigger-open' : ''}`}
        disabled={disabled} aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-options`}
        aria-labelledby={`${id}-label ${id}-value`} onClick={() => { setQuery(''); setOpen(prev => !prev); }}>
        {value === 'auto' ? <Languages size={17} className="selector-icon" /> : <span className="language-monogram" aria-hidden="true">{current?.name.slice(0, 2).toUpperCase() ?? '??'}</span>}
        <span id={`${id}-value`} className="language-value">{value === 'auto' ? 'Detect language' : current?.name ?? value}</span>
        <ChevronDown size={16} className={`language-chevron ${open ? 'turn' : ''}`} />
      </button>
      {open && <div className={`language-popover ${align === 'right' ? 'popover-right' : ''}`}>
        <label htmlFor={`${id}-search`} className="sr-only">Search {label.toLowerCase()}</label>
        <div className="language-search"><Search size={16} aria-hidden="true" />
          <input ref={search} id={`${id}-search`} type="search" autoComplete="off" placeholder="Search languages..."
            value={query} onChange={event => setQuery(event.target.value)} />
          <span className="search-shortcut">ESC</span>
        </div>
        <div role="listbox" aria-label={label} id={`${id}-options`} className="language-options" tabIndex={-1}>
          {allowAuto && !query && <button type="button" role="option" aria-selected={value === 'auto'}
            className={`language-option ${value === 'auto' ? 'option-current' : ''}`} onClick={() => choose('auto')}>
            <span className="option-auto-icon"><Languages size={16}/></span>
            <span className="option-main"><strong>Auto detect</strong><small>Let Lingora identify the language</small></span>
            {value === 'auto' && <Check size={16} />}
          </button>}
          {items.map(language => <button type="button" role="option" aria-selected={value === language.code}
            className={`language-option ${value === language.code ? 'option-current' : ''}`} key={language.code}
            onClick={() => choose(language.code)}>
              <span className="option-language-letters">{language.name.slice(0, 2).toUpperCase()}</span>
              <span className="option-main"><strong>{language.name}</strong><small>{language.nativeName}</small></span>
              {value === language.code && <Check size={16} />}
            </button>)}
          {items.length === 0 && <p className="no-language">No matching language found.</p>}
        </div>
        <div className="language-popover-footer">{LANGUAGES.length} languages available</div>
      </div>}
    </div>
  );
}
