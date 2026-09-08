import { useRef, useState } from 'react';
import type { GameComponentProps } from '../registry';
import { formatTime } from '../shared/useGameSession';
import { addRandomTile, createBoard2048, hasAvailableMove, moveBoard, type MoveDirection } from './logic';
import './game2048.css';

const arrows: Record<string, MoveDirection> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
};

export function Game2048({ session }: GameComponentProps) {
  const [board, setBoard] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  function startGame() {
    setBoard(createBoard2048());
    setScore(0);
    session.start('');
  }

  function move(direction: MoveDirection) {
    if (session.phase !== 'playing') return;
    const moved = moveBoard(board, direction);
    if (!moved.changed) {
      if (!hasAvailableMove(board)) session.fail();
      return;
    }
    const next = addRandomTile(moved.board);
    const nextScore = score + moved.score;
    setBoard(next);
    setScore(nextScore);
    if (next.some((value) => value >= 2048)) {
      session.complete([{ label: 'スコア', value: nextScore.toLocaleString('ja-JP') }]);
    } else if (!hasAvailableMove(next)) {
      session.fail();
    }
  }

  if (session.phase === 'setup') return (
    <section className="game-setup game2048-setup" aria-labelledby="game2048-setup-title">
      <div className="setup-symbol" aria-hidden="true">2048</div>
      <p className="eyebrow">JOIN THE TILES</p>
      <h2 id="game2048-setup-title">2048をつくろう</h2>
      <p>同じ数字を重ねて、2048のタイルを目指します。</p>
      <button className="game-button primary" type="button" onClick={startGame}>ゲームを始める</button>
    </section>
  );

  if (session.phase === 'failed') return (
    <section className="game-over-panel" aria-labelledby="game2048-over-title">
      <div className="game-over-symbol" aria-hidden="true">×</div>
      <p className="eyebrow">GAME OVER</p>
      <h2 id="game2048-over-title">ゲームオーバー</h2>
      <dl><div><dt>スコア</dt><dd>{score.toLocaleString('ja-JP')}</dd></div></dl>
      <div className="game-over-actions">
        <button type="button" onClick={startGame}>もう一度遊ぶ</button>
        <a href="#/">ホームへ戻る</a>
      </div>
    </section>
  );

  function handleKey(event: React.KeyboardEvent) {
    const direction = arrows[event.key];
    if (!direction) return;
    event.preventDefault();
    move(direction);
  }

  function endSwipe(event: React.PointerEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 28) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  }

  return (
    <section className="game2048" aria-label="2048ゲーム">
      <div className="game-toolbar">
        <div className="game-stats" aria-label="ゲーム状況">
          <span><small>時間</small>{formatTime(session.seconds)}</span>
          <span><small>スコア</small>{score.toLocaleString('ja-JP')}</span>
        </div>
        <button className="game-button tonal" type="button" onClick={startGame}>新しいゲーム</button>
      </div>
      <p id="game2048-help" className="board-help">矢印キー、スワイプ、または方向ボタンで操作できます。</p>
      <div
        className="board2048" role="application" tabIndex={0} aria-label={`2048の盤面、スコア${score}`}
        aria-describedby="game2048-help" onKeyDown={handleKey}
        onPointerDown={(event) => { touchStart.current = { x: event.clientX, y: event.clientY }; }}
        onPointerUp={endSwipe} onPointerCancel={() => { touchStart.current = null; }}
      >
        {board.map((value, index) => <div className={`tile2048 tile-${Math.min(value, 2048)}`} key={index} aria-label={value ? `${value}` : '空きマス'}>{value || ''}</div>)}
      </div>
      <div className="direction-pad" aria-label="移動方向">
        <button type="button" aria-label="上へ移動" onClick={() => move('up')}>↑</button>
        <button type="button" aria-label="左へ移動" onClick={() => move('left')}>←</button>
        <button type="button" aria-label="下へ移動" onClick={() => move('down')}>↓</button>
        <button type="button" aria-label="右へ移動" onClick={() => move('right')}>→</button>
      </div>
    </section>
  );
}
