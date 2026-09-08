import type { GameDefinition } from '../games/registry';
import { routeHref } from '../routing';

export function GameCard({ game }: { game: GameDefinition }) {
  return (
    <a className="game-card" href={routeHref(game.path)}>
      <span className="game-card-icon" aria-hidden="true">✦</span>
      <h3>{game.title}</h3>
      <p>{game.description}</p>
      <span className="game-card-action">遊んでみる <span aria-hidden="true">↗</span></span>
    </a>
  );
}
