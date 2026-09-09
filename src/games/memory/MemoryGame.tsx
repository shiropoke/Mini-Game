import { useEffect, useRef, useState } from 'react';
import type { GameComponentProps } from '../registry';
import { formatTime } from '../shared/useGameSession';
import { createDeck, memoryConfigs, memoryDifficulties, type MemoryCard, type MemoryDifficulty } from './logic';
import './memory.css';
import { GameIcon } from '../../components/GameIcon';

export function MemoryGame({ session, game }: GameComponentProps) {
  const [difficulty, setDifficulty] = useState<MemoryDifficulty>('中級');
  const [deck, setDeck] = useState<MemoryCard[]>([]);
  const [openCards, setOpenCards] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const timeout = useRef<number | null>(null);

  useEffect(() => () => { if (timeout.current !== null) window.clearTimeout(timeout.current); }, []);

  function startGame(level = difficulty) {
    if (timeout.current !== null) window.clearTimeout(timeout.current);
    setDeck(createDeck(memoryConfigs[level].pairs));
    setOpenCards([]); setMatched(new Set()); setMoves(0); setLocked(false);
    session.start(level);
  }

  function choose(card: MemoryCard) {
    if (session.phase !== 'playing' || locked || matched.has(card.pair) || openCards.includes(card.id)) return;
    if (openCards.length === 0) { setOpenCards([card.id]); return; }
    const first = deck.find((item) => item.id === openCards[0]);
    if (!first) return;
    const nextMoves = moves + 1;
    setMoves(nextMoves);
    setOpenCards([first.id, card.id]);
    if (first.pair === card.pair) {
      const nextMatched = new Set(matched).add(card.pair);
      setMatched(nextMatched); setOpenCards([]);
      if (nextMatched.size === memoryConfigs[difficulty].pairs) session.complete([{ label: '手数', value: `${nextMoves}手` }]);
      return;
    }
    setLocked(true);
    timeout.current = window.setTimeout(() => { setOpenCards([]); setLocked(false); timeout.current = null; }, 750);
  }

  if (session.phase === 'setup') return (
    <section className="game-setup memory-setup" aria-labelledby="memory-setup-title">
      <GameIcon game={game} size="large" />
      <div><p className="eyebrow">FIND THE PAIRS</p><h2 id="memory-setup-title">難易度を選ぶ</h2><p>カードの場所を覚えて、すべてのペアを見つけましょう。</p></div>
      <fieldset className="difficulty-options"><legend>難易度</legend>
        {memoryDifficulties.map((level) => <label key={level}><input type="radio" name="memory-difficulty" checked={difficulty === level} onChange={() => setDifficulty(level)} /><span className="difficulty-control">{level}<small>{memoryConfigs[level].rows}×{memoryConfigs[level].cols}・{memoryConfigs[level].pairs}ペア</small></span></label>)}
      </fieldset>
      <button className="game-button primary" type="button" onClick={() => startGame()}>ゲームを始める</button>
    </section>
  );

  const config = memoryConfigs[difficulty];
  return (
    <section className="memory-game" aria-label="神経衰弱ゲーム">
      <div className="game-toolbar">
        <div className="game-stats" aria-label="ゲーム状況">
          <span><small>難易度</small>{difficulty}</span><span><small>時間</small>{formatTime(session.seconds)}</span>
          <span><small>手数</small>{moves}</span><span><small>ペア</small>{matched.size} / {config.pairs}</span>
        </div>
        <div className="game-actions"><button className="game-button tonal" type="button" onClick={() => startGame()}>リスタート</button><button className="game-button tonal" type="button" onClick={session.reset}>難易度変更</button></div>
      </div>
      <div className="memory-board" style={{ '--memory-cols': config.cols, '--memory-rows': config.rows } as React.CSSProperties} aria-label={`${config.pairs}ペアのカード盤面`} aria-busy={locked}>
        {deck.map((card) => {
          const isMatched = matched.has(card.pair), isOpen = isMatched || openCards.includes(card.id);
          const state = isMatched ? '一致済み' : isOpen ? `表、${card.symbol}` : '裏';
          return <button key={card.id} type="button" className={`memory-card${isOpen ? ' is-open' : ''}${isMatched ? ' is-matched' : ''}`} disabled={isMatched || locked} aria-label={`カード、${state}`} onClick={() => choose(card)}>
            <span className="memory-card-inner"><span className="memory-card-back" aria-hidden="true">✦</span><span className="memory-card-face" aria-hidden="true">{card.symbol}</span></span>
          </button>;
        })}
      </div>
    </section>
  );
}
