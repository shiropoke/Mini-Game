import { useEffect, useRef, useState } from 'react';
import type { GameDefinition } from '../games/registry';
import { useGameSession } from '../games/shared/useGameSession';
import { GameResult } from '../games/shared/GameResult';
import { discardHomeScroll } from '../routing';

function HomeConfirmDialog({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="home-confirm" aria-labelledby="home-confirm-title" onCancel={(event) => { event.preventDefault(); onCancel(); }}>
      <div className="confirm-symbol" aria-hidden="true">↙</div>
      <h2 id="home-confirm-title">ホームに戻りますか？</h2>
      <p>現在のゲーム内容は失われます。</p>
      <div className="confirm-actions">
        <button type="button" onClick={onCancel}>キャンセル</button>
        <button type="button" className="primary" onClick={onConfirm}>ホームに戻る</button>
      </div>
    </dialog>
  );
}

export function GameLayout({ game }: { game: GameDefinition }) {
  const Game = game.component;
  const session = useGameSession();
  const { phase, pause, resume, stop } = session;
  const [confirmingHome, setConfirmingHome] = useState(false);

  useEffect(() => {
    if (phase !== 'setup') discardHomeScroll();
  }, [phase]);

  useEffect(() => {
    function guardHomeNavigation(event: MouseEvent) {
      const target = event.target;
      if (!['playing', 'ready', 'paused'].includes(phase) || !(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>('a[href="#/"]');
      if (!link) return;
      event.preventDefault();
      pause();
      setConfirmingHome(true);
    }
    document.addEventListener('click', guardHomeNavigation, true);
    return () => document.removeEventListener('click', guardHomeNavigation, true);
  }, [phase, pause]);

  function goHome() {
    setConfirmingHome(false);
    stop();
    discardHomeScroll();
    window.location.hash = '#/';
  }

  return (
    <>
      <a className="button tonal" href="#/">← ホームに戻る</a>
      <header className="game-heading"><p className="eyebrow">LET’S PLAY</p><h1>{game.title}</h1><p>{game.description}</p></header>
      <section className="game-stage" aria-label={`${game.title}のプレイエリア`}>
        {phase === 'completed' ? <GameResult title={game.title} difficulty={session.difficulty} seconds={session.seconds} stats={session.stats} onReplay={session.reset} /> : <Game session={session} game={game} />}
      </section>
      <HomeConfirmDialog open={confirmingHome} onCancel={() => { setConfirmingHome(false); resume(); }} onConfirm={goHome} />
    </>
  );
}
