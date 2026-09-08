import { useSyncExternalStore } from 'react';

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
