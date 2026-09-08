import { useSyncExternalStore } from 'react';

const homeScrollKey = 'mini-game:home-scroll-y';

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

export function getPath() {
  const hash = window.location.hash.slice(1);
  return hash === '' ? '/' : hash;
}

export function usePath() {
  return useSyncExternalStore(subscribe, getPath, () => '/');
}

export function routeHref(path: string) {
  return `#${path}`;
}

export function rememberHomeScroll() {
  try { sessionStorage.setItem(homeScrollKey, String(Math.max(0, window.scrollY))); } catch { /* Navigation still works without storage. */ }
}

export function discardHomeScroll() {
  try { sessionStorage.removeItem(homeScrollKey); } catch { /* Nothing to discard. */ }
}

export function consumeHomeScroll() {
  try {
    const stored = sessionStorage.getItem(homeScrollKey);
    sessionStorage.removeItem(homeScrollKey);
    if (stored === null) return null;
    const position = Number(stored);
    return Number.isFinite(position) && position >= 0 ? position : null;
  } catch { return null; }
}
