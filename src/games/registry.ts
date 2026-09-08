import type { ComponentType } from 'react';
import { MinesweeperGame } from './minesweeper/MinesweeperGame';
import { SudokuGame } from './sudoku/SudokuGame';
import { Game2048 } from './game2048/Game2048';
import { MemoryGame } from './memory/MemoryGame';

import type { GameSession } from './shared/useGameSession';

export interface GameComponentProps {
  session: GameSession;
  game: GameDefinition;
}

export type GameVisual = 'sudoku' | 'mine' | '2048' | 'memory';

export interface GameDefinition {
  id: string;
  title: string;
  description: string;
  /** Unique, lower-case URL path, e.g. /games/my-game (no trailing slash). */
  path: `/games/${string}`;
  component: ComponentType<GameComponentProps>;
  visual: GameVisual;
}

// Add a component import and one entry here to publish it in the list and router.
export const games: readonly GameDefinition[] = [
  {
    id: 'sudoku',
    title: 'ナンプレ',
    description: '数字をたよりに、9×9の盤面を完成させよう。',
    path: '/games/sudoku',
    component: SudokuGame,
    visual: 'sudoku',
  },
  {
    id: 'minesweeper',
    title: 'マインスイーパー',
    description: '数字を読み、地雷を避けて安全なマスを開こう。',
    path: '/games/minesweeper',
    component: MinesweeperGame,
    visual: 'mine',
  },
  {
    id: '2048',
    title: '2048',
    description: 'タイルを重ねて、目標の2048をつくろう。',
    path: '/games/2048',
    component: Game2048,
    visual: '2048',
  },
  {
    id: 'memory',
    title: '神経衰弱',
    description: 'カードの場所を覚えて、すべてのペアを見つけよう。',
    path: '/games/memory',
    component: MemoryGame,
    visual: 'memory',
  },
];
