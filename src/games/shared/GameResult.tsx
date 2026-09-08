import { useEffect, useRef } from 'react';
import { formatTime, type ResultStat } from './useGameSession';
import './game-result.css';

export function GameResult({ title, difficulty, seconds, stats, onReplay }: {
  title: string; difficulty: string; seconds: number; stats: ResultStat[]; onReplay: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  return (
    <section className="game-result" aria-labelledby="game-result-title">
      <div className="result-emblem" aria-hidden="true">✦</div>
      <p className="eyebrow">GAME COMPLETE</p>
      <h2 id="game-result-title" ref={heading} tabIndex={-1}>クリア！</h2>
      <p>{title}</p>{difficulty && <p className="result-difficulty">{difficulty}</p>}
      <dl className="result-stats">
        <div><dt>クリアタイム</dt><dd>{formatTime(seconds)}</dd></div>
        {stats.map((stat) => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}
      </dl>
      <div className="result-actions">
        <button type="button" onClick={onReplay}>もう一度遊ぶ</button>
        <a href="#/">ホームへ戻る</a>
      </div>
    </section>
  );
}
