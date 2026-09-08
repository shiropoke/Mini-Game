export type Board2048 = number[];
export type MoveDirection = 'up' | 'down' | 'left' | 'right';

function shuffled<T>(values: T[]) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function addRandomTile(board: Board2048): Board2048 {
  const empty = board.map((value, index) => value === 0 ? index : -1).filter((index) => index >= 0);
  if (!empty.length) return board;
  const next = [...board];
  next[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

export function createBoard2048(): Board2048 {
  const positions = shuffled(Array.from({ length: 16 }, (_, index) => index));
  const board = Array<number>(16).fill(0);
  board[positions[0]] = Math.random() < 0.9 ? 2 : 4;
  board[positions[1]] = Math.random() < 0.9 ? 2 : 4;
  return board;
}

export function mergeLine(line: number[]) {
  const values = line.filter(Boolean);
  const merged: number[] = [];
  let score = 0;
  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === values[index + 1]) {
      const value = values[index] * 2;
      merged.push(value);
      score += value;
      index += 1;
    } else {
      merged.push(values[index]);
    }
  }
  return { line: [...merged, ...Array(4 - merged.length).fill(0)], score };
}

function lineIndexes(direction: MoveDirection, line: number) {
  const indexes = Array.from({ length: 4 }, (_, position) =>
    direction === 'left' || direction === 'right' ? line * 4 + position : position * 4 + line);
  return direction === 'right' || direction === 'down' ? indexes.reverse() : indexes;
}

export function moveBoard(board: Board2048, direction: MoveDirection) {
  const next = Array<number>(16).fill(0);
  let score = 0;
  for (let line = 0; line < 4; line += 1) {
    const indexes = lineIndexes(direction, line);
    const merged = mergeLine(indexes.map((index) => board[index]));
    score += merged.score;
    indexes.forEach((index, position) => { next[index] = merged.line[position]; });
  }
  return { board: next, score, changed: next.some((value, index) => value !== board[index]) };
}

export function hasAvailableMove(board: Board2048) {
  if (board.includes(0)) return true;
  for (let row = 0; row < 4; row += 1) for (let col = 0; col < 4; col += 1) {
    const index = row * 4 + col;
    if (col < 3 && board[index] === board[index + 1]) return true;
    if (row < 3 && board[index] === board[index + 4]) return true;
  }
  return false;
}
