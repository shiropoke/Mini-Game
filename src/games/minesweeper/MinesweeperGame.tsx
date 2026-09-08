import { useEffect, useRef, useState } from 'react';
import type { GameComponentProps } from '../registry';
import { GameIcon } from '../../components/GameIcon';
import { formatTime } from '../shared/useGameSession';
import { emptyMineBoard, isMinefieldCleared, mineConfigs, minesDifficulties, placeMines, revealCells, type MinesDifficulty } from './logic';
import './minesweeper.css';

type Mode = 'open' | 'flag';

export function MinesweeperGame({ session, game }: GameComponentProps) {
  const { phase, seconds } = session;
  const [difficulty, setDifficulty] = useState<MinesDifficulty>('初級');
  const [board, setBoard] = useState(() => emptyMineBoard(mineConfigs.初級));
  const [mode, setMode] = useState<Mode>('open');
  const longPress = useRef<number | undefined>(undefined);
  const longPressed = useRef(false);
  const config = mineConfigs[difficulty];

  useEffect(() => {
    // Cancel a pending touch when a modal pauses play or the game unmounts.
    return () => window.clearTimeout(longPress.current);
  }, [phase]);

  function newBoard(nextDifficulty = difficulty) {
    setDifficulty(nextDifficulty); setBoard(emptyMineBoard(mineConfigs[nextDifficulty]));
    setMode('open');
    session.start(nextDifficulty, true);
  }

  function toggleFlag(index: number) {
    if ((phase !== 'playing' && phase !== 'ready') || board[index].revealed) return;
    setBoard((current) => current.map((cell, i) => i === index ? { ...cell, flagged: !cell.flagged } : cell));
  }

  function open(index: number) {
    if ((phase !== 'playing' && phase !== 'ready') || board[index].flagged) return;
    let working = board;
    if (phase === 'ready') { working = placeMines(board, index, config); session.begin(); }
    if (working[index].mine) {
      setBoard(working.map((cell) => cell.mine ? { ...cell, revealed: true } : cell)); session.fail(); return;
    }
    const next = revealCells(working, index, config);
    const won = isMinefieldCleared(next);
    setBoard(won ? next.map((cell) => cell.mine ? { ...cell, flagged: true } : cell) : next);
    if (won) session.complete();
  }

  function activate(index: number) { if (mode === 'flag') toggleFlag(index); else open(index); }

  function handleKey(event: React.KeyboardEvent, index: number) {
    if (event.key === 'f' || event.key === 'F') { event.preventDefault(); toggleFlag(index); }
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(index); }
    const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -config.cols, ArrowDown: config.cols };
    if (event.key in moves) {
      event.preventDefault(); const target = Math.max(0, Math.min(board.length - 1, index + moves[event.key]));
      (event.currentTarget.parentElement?.children[target] as HTMLElement | undefined)?.focus();
    }
  }

  const flags = board.filter((cell) => cell.flagged).length;
  if (phase === 'setup') return (
    <div className="game-setup">
      <GameIcon game={game} size="large" />
      <div><p className="eyebrow">NEW FIELD</p><h2>難易度を選ぶ</h2><p>地雷を避けて、すべての安全なマスを開きましょう。最初のマスと周囲は安全です。</p></div>
      <label>難易度<select className="difficulty-control" value={difficulty} onChange={(e) => setDifficulty(e.target.value as MinesDifficulty)}>{minesDifficulties.map((value) => <option key={value} value={value}>{value}（{mineConfigs[value].rows}×{mineConfigs[value].cols}・地雷{mineConfigs[value].mines}）</option>)}</select></label>
      <button className="game-button primary" onClick={() => newBoard()}>この設定で始める <span aria-hidden="true">→</span></button>
    </div>
  );

  return (
    <div className="mines-game">
      <div className="game-toolbar mines-toolbar">
        <div className="game-stats"><span><small>難易度</small>{difficulty}</span><span><small>時間</small>{formatTime(seconds)}</span><span><small>地雷</small>{config.mines}</span><span><small>旗</small>{flags}</span><span><small>残り目安</small>{config.mines - flags}</span></div>
        <div className="game-actions"><button onClick={() => newBoard()}>リスタート</button><button onClick={session.reset}>新しいゲーム</button></div>
      </div>
      <div className="mode-switch" aria-label="操作モード"><button className={mode === 'open' ? 'active' : ''} aria-pressed={mode === 'open'} onClick={() => setMode('open')}>◻ 開く</button><button className={mode === 'flag' ? 'active' : ''} aria-pressed={mode === 'flag'} onClick={() => setMode('flag')}>⚑ 旗</button></div>
      {phase === 'failed' && <div className="result-banner lost" role="status"><span aria-hidden="true">!</span><div><strong>ゲームオーバー</strong><p>{difficulty}・{formatTime(seconds)}</p></div></div>}
      <p className="mine-help">タップは選択中の操作・長押しまたは右クリックで旗</p>
      <div className="mine-scroll" tabIndex={0} aria-label="盤面。大きな盤面は横にスクロールできます">
        <div className="mine-board" role="grid" aria-label={`${difficulty}のマインスイーパー盤面`} style={{ gridTemplateColumns: `repeat(${config.cols}, var(--mine-cell))` }}>
          {board.map((cell, index) => {
            const row = Math.floor(index / config.cols) + 1, col = index % config.cols + 1;
            const wrongFlag = phase === 'failed' && cell.flagged && !cell.mine;
            const display = wrongFlag ? '×' : cell.flagged ? '⚑' : cell.revealed && cell.mine ? '●' : cell.revealed && cell.adjacent ? cell.adjacent : '';
            const state = wrongFlag ? '誤った旗' : cell.flagged ? '旗' : cell.revealed && cell.mine ? '地雷' : cell.revealed ? cell.adjacent ? `周囲の地雷${cell.adjacent}` : '空白、開封済み' : '未開封';
            return <button key={index} role="gridcell" className={`mine-cell ${cell.revealed ? 'revealed' : ''} ${cell.flagged ? 'flagged' : ''} ${cell.mine && cell.revealed ? 'mine' : ''} ${wrongFlag ? 'wrong' : ''} n${cell.adjacent}`} aria-label={`${row}行${col}列、${state}`} onClick={() => { if (longPressed.current) { longPressed.current = false; return; } activate(index); }} onContextMenu={(e) => { e.preventDefault(); toggleFlag(index); }} onPointerDown={(e) => { if (e.pointerType === 'mouse') return; longPressed.current = false; longPress.current = window.setTimeout(() => { longPressed.current = true; toggleFlag(index); }, 500); }} onPointerUp={() => window.clearTimeout(longPress.current)} onPointerCancel={() => window.clearTimeout(longPress.current)} onPointerLeave={() => window.clearTimeout(longPress.current)} onKeyDown={(e) => handleKey(e, index)} disabled={phase === 'failed' || phase === 'paused'}>{display}</button>;
          })}
        </div>
      </div>
    </div>
  );
}
