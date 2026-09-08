import { useEffect, useRef } from 'react';
import { AppHeader } from './components/AppHeader';
import { PageContainer } from './components/PageContainer';
import { games } from './games/registry';
import { GameLayout } from './pages/GameLayout';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { usePath } from './routing';

export function App() {
  const path = usePath();
  const game = games.find((entry) => entry.path === path);
  const mainRef = useRef<HTMLElement>(null);
  const previousPath = useRef(path);

  useEffect(() => {
    document.title = path === '/' ? 'Mini-Game — ちょっとひと息、ちょっと夢中。' : `${game?.title ?? 'ページが見つかりません'} | Mini-Game`;
    if (previousPath.current !== path) {
      mainRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
      previousPath.current = path;
    }
  }, [path, game]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); mainRef.current?.focus(); }}>メインコンテンツへ</a>
      <AppHeader />
      <main id="main-content" ref={mainRef} tabIndex={-1}>
        <PageContainer key={path}>{path === '/' ? <HomePage /> : game ? <GameLayout game={game} /> : <NotFoundPage />}</PageContainer>
      </main>
      <footer className="app-footer"><a href="#/">Mini-Game <span aria-hidden="true">✳</span></a><p>小さな遊びから、いい一日を。</p></footer>
    </div>
  );
}
