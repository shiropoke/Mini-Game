export type MinesDifficulty = '初級' | '中級' | '上級' | 'エキスパート' | 'マスター' | 'エクストリーム';
export type MineCell = { mine: boolean; adjacent: number; revealed: boolean; flagged: boolean };
export type MineConfig = { rows: number; cols: number; mines: number };

export const mineConfigs: Record<MinesDifficulty, MineConfig> = {
  初級: { rows: 9, cols: 9, mines: 10 },
  中級: { rows: 12, cols: 12, mines: 22 },
  上級: { rows: 16, cols: 16, mines: 40 },
  エキスパート: { rows: 16, cols: 24, mines: 70 },
  マスター: { rows: 20, cols: 24, mines: 100 },
  エクストリーム: { rows: 24, cols: 30, mines: 160 },
};
export const minesDifficulties = Object.keys(mineConfigs) as MinesDifficulty[];

export function emptyMineBoard(config: MineConfig): MineCell[] {
  return Array.from({ length: config.rows * config.cols }, () => ({ mine: false, adjacent: 0, revealed: false, flagged: false }));
}

function neighbors(index: number, config: MineConfig) {
  const row = Math.floor(index / config.cols);
  const col = index % config.cols;
  const result: number[] = [];
  for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) {
    const r = row + dr, c = col + dc;
    if ((dr || dc) && r >= 0 && r < config.rows && c >= 0 && c < config.cols) result.push(r * config.cols + c);
  }
  return result;
}

export function placeMines(board: MineCell[], first: number, config: MineConfig) {
  const next = board.map((cell) => ({ ...cell }));
  const safe = new Set([first, ...neighbors(first, config)]);
  const candidates = Array.from({ length: next.length }, (_, i) => i).filter((i) => !safe.has(i));
  for (let i = candidates.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  candidates.slice(0, config.mines).forEach((index) => { next[index].mine = true; });
  next.forEach((cell, index) => { cell.adjacent = neighbors(index, config).filter((i) => next[i].mine).length; });
  return next;
}

export function revealCells(board: MineCell[], start: number, config: MineConfig) {
  const next = board.map((cell) => ({ ...cell }));
  if (next[start].flagged || next[start].revealed) return next;
  const queue = [start];
  const queued = new Set(queue);
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const index = queue[cursor];
    const cell = next[index];
    if (cell.flagged || cell.revealed) continue;
    cell.revealed = true;
    if (!cell.mine && cell.adjacent === 0) {
      neighbors(index, config).forEach((neighbor) => {
        if (!queued.has(neighbor) && !next[neighbor].flagged) { queued.add(neighbor); queue.push(neighbor); }
      });
    }
  }
  return next;
}

export function isMinefieldCleared(board: MineCell[]) {
  return board.every((cell) => cell.mine || cell.revealed);
}
