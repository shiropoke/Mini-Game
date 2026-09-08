import type { GameDefinition } from '../games/registry';

export function GameLayout({ game }: { game: GameDefinition }) {
  const Game = game.component;
  return (
    <>
      <a className="button tonal" href="#/">← ホームに戻る</a>
      <header className="game-heading"><p className="eyebrow">LET’S PLAY</p><h1>{game.title}</h1><p>{game.description}</p></header>
      <section className="game-stage" aria-label={`${game.title}のプレイエリア`}><Game /></section>
    </>
  );
}
