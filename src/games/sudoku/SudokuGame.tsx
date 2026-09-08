import { useMemo, useState } from 'react';
import type { GameComponentProps } from '../registry';
import { createSudoku, hasConflict, sudokuDifficulties, type SudokuDifficulty } from './logic';
import { formatTime } from '../shared/useGameSession';
import { GameIcon } from '../../components/GameIcon';
import './sudoku.css';

export function SudokuGame({ session, game }: GameComponentProps) {
  const { phase, seconds } = session;
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>('中級');
  const [hintLimit, setHintLimit] = useState(3);
  const [puzzle, setPuzzle] = useState<number[]>([]);
  const [solution, setSolution] = useState<number[]>([]);
  const [board, setBoard] = useState<number[]>([]);
  const [notes, setNotes] = useState<number[][]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [noteMode, setNoteMode] = useState(false);
  const [hints, setHints] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const given = useMemo(() => puzzle.map(Boolean), [puzzle]);
  const completedNumbers = useMemo(() => {
    const counts = Array<number>(10).fill(0);
    board.forEach((value, index) => { if (value && value === solution[index]) counts[value] += 1; });
    return counts.map((count) => count === 9);
  }, [board, solution]);

  function startGame() {
    const generated = createSudoku(difficulty);
    setPuzzle(generated.puzzle);
    setSolution(generated.solution);
    setBoard([...generated.puzzle]);
    setNotes(Array.from({ length: 81 }, () => []));
    setHints(hintLimit);
    setMistakes(0);
    setSelected(null);
    setNoteMode(false);
    session.start(difficulty);
  }

  function restart() {
    setBoard([...puzzle]);
    setNotes(Array.from({ length: 81 }, () => []));
    setHints(hintLimit);
    setMistakes(0);
    setSelected(null);
    setNoteMode(false);
    session.start(difficulty);
  }

  function removePeerNotes(current: number[][], index: number, value: number) {
    const row = Math.floor(index / 9), col = index % 9;
    return current.map((cellNotes, peer) => {
      const peerRow = Math.floor(peer / 9), peerCol = peer % 9;
      const related = peerRow === row || peerCol === col || (Math.floor(peerRow / 3) === Math.floor(row / 3) && Math.floor(peerCol / 3) === Math.floor(col / 3));
      return related ? cellNotes.filter((note) => note !== value) : cellNotes;
    });
  }

  function enter(value: number, target = selected) {
    if (target === null || given[target] || phase !== 'playing') return;
    if (value !== 0 && completedNumbers[value]) return;
    if (noteMode && value !== 0) {
      if (board[target] !== 0) return;
      setNotes((current) => current.map((cellNotes, index) => index === target
        ? cellNotes.includes(value) ? cellNotes.filter((note) => note !== value) : [...cellNotes, value].sort()
        : cellNotes));
      return;
    }
    const next = [...board];
    next[target] = value;
    if (value !== 0 && value !== solution[target]) setMistakes((count) => count + 1);
    setBoard(next);
    setNotes((current) => value ? removePeerNotes(current.map((cellNotes, index) => index === target ? [] : cellNotes), target, value) : current);
    if (next.every((cell, index) => cell === solution[index])) {
      session.complete([{ label: 'ミス', value: `${mistakes}回` }]);
    }
  }

  function useHint() {
    if (hints <= 0 || phase !== 'playing') return;
    const available = board.map((value, index) => value !== solution[index] ? index : -1).filter((index) => index >= 0);
    if (!available.length) return;
    const index = available[Math.floor(Math.random() * available.length)];
    const next = [...board]; next[index] = solution[index];
    setBoard(next); setSelected(index); setHints((value) => value - 1);
    setNotes((current) => removePeerNotes(current.map((cellNotes, i) => i === index ? [] : cellNotes), index, solution[index]));
    if (next.every((cell, i) => cell === solution[i])) {
      session.complete([{ label: 'ミス', value: `${mistakes}回` }]);
    }
  }

  function handleKey(event: React.KeyboardEvent, index: number) {
    if (/^[1-9]$/.test(event.key)) { event.preventDefault(); setSelected(index); enter(Number(event.key), index); }
    if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') { event.preventDefault(); setSelected(index); enter(0, index); }
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -9, ArrowDown: 9 };
    if (event.key in moves) {
      event.preventDefault();
      const target = Math.max(0, Math.min(80, index + moves[event.key]));
      (event.currentTarget.parentElement?.children[target] as HTMLElement | undefined)?.focus();
      setSelected(target);
    }
  }

  if (phase === 'setup') return (
    <div className="game-setup">
      <GameIcon game={game} size="large" />
      <div><p className="eyebrow">NEW PUZZLE</p><h2>遊び方を選ぶ</h2><p>すべての行・列・3×3ブロックに、1〜9をひとつずつ入れましょう。</p></div>
      <label>難易度<select className="difficulty-control" value={difficulty} onChange={(e) => setDifficulty(e.target.value as SudokuDifficulty)}>{sudokuDifficulties.map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>ヒント数<select value={hintLimit} onChange={(e) => setHintLimit(Number(e.target.value))}>{[0, 1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}回</option>)}</select></label>
      <button className="game-button primary" onClick={startGame}>この設定で始める <span aria-hidden="true">→</span></button>
    </div>
  );

  return (
    <div className="sudoku-game">
      <div className="game-toolbar">
        <div className="game-stats"><span><small>難易度</small>{difficulty}</span><span><small>時間</small>{formatTime(seconds)}</span><span><small>ヒント</small>{hints}</span><span><small>ミス</small>{mistakes}</span></div>
        <div className="game-actions"><button onClick={restart}>リスタート</button><button onClick={() => { setMistakes(0); session.reset(); }}>新しいゲーム</button></div>
      </div>
      <div className="sudoku-board" role="grid" aria-label="ナンプレ盤面">
        {board.map((value, index) => {
          const row = Math.floor(index / 9), col = index % 9;
          const selectedRow = selected === null ? -1 : Math.floor(selected / 9), selectedCol = selected === null ? -1 : selected % 9;
          const related = selected !== null && (row === selectedRow || col === selectedCol || (Math.floor(row / 3) === Math.floor(selectedRow / 3) && Math.floor(col / 3) === Math.floor(selectedCol / 3)));
          const same = selected !== null && board[selected] !== 0 && value === board[selected];
          const classes = ['sudoku-cell', given[index] ? 'given' : 'editable', selected === index ? 'selected' : '', related ? 'related' : '', same ? 'same' : '', hasConflict(board, index) ? 'conflict' : ''].filter(Boolean).join(' ');
          const label = `${row + 1}行${col + 1}列、${value ? `${value}${given[index] ? '、問題の数字' : hasConflict(board, index) ? '、重複があります' : ''}` : notes[index].length ? `メモ ${notes[index].join('、')}` : '空欄'}`;
          return <button key={index} role="gridcell" className={classes} aria-label={label} aria-selected={selected === index} onClick={() => setSelected(index)} onKeyDown={(e) => handleKey(e, index)}>
            {value || <span className="sudoku-notes">{Array.from({ length: 9 }, (_, note) => <i key={note}>{notes[index].includes(note + 1) ? note + 1 : ''}</i>)}</span>}
            {hasConflict(board, index) && <span className="cell-alert" aria-hidden="true">!</span>}
          </button>;
        })}
      </div>
      <div className="number-pad" aria-label="数字入力">
        {[1,2,3,4,5,6,7,8,9].map((number) => <button key={number} className={completedNumbers[number] ? 'number-complete' : ''} aria-label={completedNumbers[number] ? `${number} 完成済み` : String(number)} onClick={() => enter(number)} disabled={selected === null || completedNumbers[number]}>{number}{completedNumbers[number] && <small aria-hidden="true">✓</small>}</button>)}
      </div>
      <div className="input-actions">
        <button className={noteMode ? 'active' : ''} aria-pressed={noteMode} onClick={() => setNoteMode((value) => !value)}>✎ メモ {noteMode ? 'ON' : 'OFF'}</button>
        <button onClick={() => enter(0)} disabled={selected === null}>⌫ 消去</button>
        <button onClick={useHint} disabled={hints === 0}>✦ ヒント {hints}</button>
      </div>
    </div>
  );
}
