import type { GameDefinition } from '../games/registry';
import { rememberHomeScroll, routeHref } from '../routing';
import { GameIcon } from './GameIcon';

export function GameCard({ game }: { game: GameDefinition }) {
  return (
    <a className="game-card" href={routeHref(game.path)} onClick={(event) => {
      if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) rememberHomeScroll();
    }}>
      <GameIcon game={game} />
      <h3>{game.title}</h3>
      <p>{game.description}</p>
      <span className="game-card-action">遊んでみる <span aria-hidden="true">↗</span></span>
    </a>
  );
}
