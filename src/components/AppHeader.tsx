import { useState } from 'react';
import { BrandIcon } from './BrandIcon';

type Theme = 'system' | 'light' | 'dark';
const storageKey = 'mini-game:theme';

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch { return 'system'; }
}

export function AppHeader() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  function changeTheme(next: Theme) {
    setTheme(next);
    if (next === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = next;
    try { localStorage.setItem(storageKey, next); } catch { /* In-memory choice still works. */ }
  }

  return (
    <header className="app-header">
      <a className="brand" href="#/" aria-label="Mini-Game ホーム">
        <BrandIcon className="brand-symbol" />
        <span>Mini-Game<span className="brand-caption">小さな遊びの、ひろば。</span></span>
      </a>
      <label className="theme-control">
        <span aria-hidden="true">◐</span><span className="visually-hidden">表示テーマ</span>
        <select value={theme} onChange={(event) => changeTheme(event.target.value as Theme)}>
          <option value="system">システム</option>
          <option value="light">ライト</option>
          <option value="dark">ダーク</option>
        </select>
      </label>
    </header>
  );
}
