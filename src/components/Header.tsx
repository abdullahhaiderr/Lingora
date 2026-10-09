import { ArrowUpRight, Menu, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';
import type { Theme, View } from '../types';
import { Logo } from './Logo';

const links: { view: View; name: string }[] = [
  { view: 'translate', name: 'Translate' },
  { view: 'history', name: 'History' },
  { view: 'about', name: 'About' },
];

export function Header({ view, onNavigate, theme, onToggleTheme }: {
  view: View; onNavigate: (view: View) => void; theme: Theme; onToggleTheme: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const choose = (next: View) => { setMenuOpen(false); onNavigate(next); };
  return (
    <header className="site-header">
      <div className="page-container header-inner">
        <Logo onClick={() => choose('translate')} />
        <nav className="header-nav" aria-label="Main navigation">
          {links.map(link => (
            <button key={link.view} type="button" onClick={() => choose(link.view)}
              aria-current={view === link.view ? 'page' : undefined}
              className={`nav-item ${view === link.view ? 'nav-item-active' : ''}`}>{link.name}</button>
          ))}
        </nav>
        <div className="header-actions">
          <span className="header-divider" aria-hidden="true" />
          <button type="button" className="icon-control theme-switch" onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? <Moon size={18} strokeWidth={1.8} /> : <Sun size={18} strokeWidth={1.8} />}
          </button>
          <div className="desktop-header-note"><span className="header-dot" /> Made for understanding <ArrowUpRight size={14} /></div>
          <button type="button" className="icon-control menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      {menuOpen && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">
        {links.map(link => <button key={link.view} type="button" onClick={() => choose(link.view)}
          aria-current={view === link.view ? 'page' : undefined}
          className={view === link.view ? 'mobile-nav-active' : ''}>{link.name}<ArrowUpRight size={17} /></button>)}
      </nav>}
    </header>
  );
}
