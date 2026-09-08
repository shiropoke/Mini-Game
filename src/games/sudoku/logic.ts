export type SudokuDifficulty = '初級' | '中級' | '上級' | 'エキスパート' | 'マスター' | 'エクストリーム';
export type SudokuBoard = number[];

export const sudokuDifficulties: readonly SudokuDifficulty[] = ['初級', '中級', '上級', 'エキスパート', 'マスター', 'エクストリーム'];

const clueTargets: Record<SudokuDifficulty, number> = {
  初級: 46, 中級: 38, 上級: 33, エキスパート: 29, マスター: 26, エクストリーム: 24,
};

function shuffled<T>(values: readonly T[]): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pattern(row: number, col: number) {
  return (row * 3 + Math.floor(row / 3) + col) % 9;
}

function makeSolution(): SudokuBoard {
  const rows = shuffled([0, 1, 2]).flatMap((band) => shuffled([0, 1, 2]).map((row) => band * 3 + row));
  const cols = shuffled([0, 1, 2]).flatMap((stack) => shuffled([0, 1, 2]).map((col) => stack * 3 + col));
  const nums = shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  return rows.flatMap((row) => cols.map((col) => nums[pattern(row, col)]));
}

export function isAllowed(board: SudokuBoard, index: number, value: number) {
  const row = Math.floor(index / 9);
  const col = index % 9;
  for (let i = 0; i < 9; i += 1) {
    if (i !== col && board[row * 9 + i] === value) return false;
    if (i !== row && board[i * 9 + col] === value) return false;
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = startRow; r < startRow + 3; r += 1) {
    for (let c = startCol; c < startCol + 3; c += 1) {
      const peer = r * 9 + c;
      if (peer !== index && board[peer] === value) return false;
    }
  }
  return true;
}

function countSolutions(board: SudokuBoard, limit = 2): number {
  let bestIndex = -1;
  let bestCandidates: number[] = [];
  for (let index = 0; index < 81; index += 1) {
    if (board[index] !== 0) continue;
    const candidates = [];
    for (let value = 1; value <= 9; value += 1) if (isAllowed(board, index, value)) candidates.push(value);
    if (candidates.length === 0) return 0;
    if (bestIndex === -1 || candidates.length < bestCandidates.length) {
      bestIndex = index; bestCandidates = candidates;
      if (candidates.length === 1) break;
    }
  }
  if (bestIndex === -1) return 1;
  let solutions = 0;
  for (const value of bestCandidates) {
    board[bestIndex] = value;
    solutions += countSolutions(board, limit - solutions);
    board[bestIndex] = 0;
    if (solutions >= limit) break;
  }
  return solutions;
}

export function createSudoku(difficulty: SudokuDifficulty) {
  const solution = makeSolution();
  const puzzle = [...solution];
  const target = clueTargets[difficulty];
  const pairs = shuffled(Array.from({ length: 41 }, (_, index) => index));
  for (const first of pairs) {
    if (puzzle.filter(Boolean).length <= target) break;
    const second = 80 - first;
    const previousA = puzzle[first];
    const previousB = puzzle[second];
    puzzle[first] = 0;
    puzzle[second] = 0;
    if (puzzle.filter(Boolean).length < target || countSolutions([...puzzle]) !== 1) {
      puzzle[first] = previousA;
      puzzle[second] = previousB;
    }
  }
  // A bounded second pass gets closer to the target when symmetric removal stalls.
  for (const index of shuffled(Array.from({ length: 81 }, (_, i) => i))) {
    if (puzzle.filter(Boolean).length <= target) break;
    const previous = puzzle[index];
    if (!previous) continue;
    puzzle[index] = 0;
    if (countSolutions([...puzzle]) !== 1) puzzle[index] = previous;
  }
  return { puzzle, solution };
}

export function hasConflict(board: SudokuBoard, index: number) {
  const value = board[index];
  return value !== 0 && !isAllowed(board, index, value);
}
