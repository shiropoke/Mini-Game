import type { GameDefinition } from '../games/registry';
import './game-icon.css';

export function GameIcon({ game, size = 'card' }: { game: GameDefinition; size?: 'card' | 'large' }) {
  return (
    <span className={`game-icon game-icon--${game.visual} game-icon--${size}`} aria-hidden="true">
      {game.visual === 'sudoku' && <span className="game-icon-text">9×9</span>}
      {game.visual === '2048' && <span className="game-icon-text">2048</span>}
      {game.visual === 'mine' && <svg viewBox="0 0 48 48" focusable="false"><path d="M24 5v7M24 36v7M5 24h7M36 24h7M10.5 10.5l5 5M32.5 32.5l5 5M37.5 10.5l-5 5M15.5 32.5l-5 5"/><circle cx="24" cy="24" r="12"/><circle className="mine-shine" cx="20" cy="20" r="2.5"/></svg>}
      {game.visual === 'memory' && <span className="card-pair"><span>●</span><span>●</span></span>}
    </span>
  );
}
