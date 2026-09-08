import { useEffect, useRef } from 'react';
import { AppHeader } from './components/AppHeader';
import { BrandIcon } from './components/BrandIcon';
import { PageContainer } from './components/PageContainer';
import { games } from './games/registry';
import { GameLayout } from './pages/GameLayout';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { consumeHomeScroll, usePath } from './routing';

export function App() {
  const path = usePath();
  const game = games.find((entry) => entry.path === path);
  const mainRef = useRef<HTMLElement>(null);
  const previousPath = useRef(path);

  useEffect(() => {
    document.title = path === '/' ? 'Mini-Game — ちょっとひと息、ちょっと夢中。' : `${game?.title ?? 'ページが見つかりません'} | Mini-Game`;
    if (previousPath.current !== path) {
      mainRef.current?.focus({ preventScroll: true });
      const destination = path === '/' ? consumeHomeScroll() ?? 0 : 0;
      let restoreFrame = 0;
      const layoutFrame = window.requestAnimationFrame(() => {
        restoreFrame = window.requestAnimationFrame(() => window.scrollTo({ top: destination, behavior: 'instant' }));
      });
      previousPath.current = path;
      return () => { window.cancelAnimationFrame(layoutFrame); window.cancelAnimationFrame(restoreFrame); };
    }
  }, [path, game]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); mainRef.current?.focus(); }}>メインコンテンツへ</a>
      <AppHeader />
      <main id="main-content" ref={mainRef} tabIndex={-1}>
        <PageContainer key={path}>{path === '/' ? <HomePage /> : game ? <GameLayout game={game} /> : <NotFoundPage />}</PageContainer>
      </main>
      <footer className="app-footer"><a href="#/">Mini-Game <BrandIcon className="footer-brand-icon" /></a><p>小さな遊びから、いい一日を。</p></footer>
    </div>
  );
}
