import { EmptyState } from '../components/EmptyState';
import { GameCard } from '../components/GameCard';
import { games } from '../games/registry';

export function HomePage() {
  return (
    <>
      <section className="hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="eyebrow"><span aria-hidden="true">✦</span> LITTLE GAMES, BIG SMILES.</p>
          <h1 id="home-title">ちょっとひと息、<br /><span>ちょっと夢中。</span></h1>
          <p className="hero-description">日常のすきまに、小さな遊びを。<br />ブラウザから気軽に楽しむ、ミニゲームのひろば。</p>
          <a className="button primary" href="#/" onClick={(event) => {
            event.preventDefault();
            document.getElementById('games-heading')?.focus({ preventScroll: true });
            document.getElementById('games')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
          }}>ゲーム一覧へ <span aria-hidden="true">↓</span></a>
        </div>
        <div className="play-art" aria-hidden="true">
          <div className="art-orbit" />
          <div className="art-flower">✳</div>
          <div className="art-tile"><span className="tile-eye" /><span className="tile-eye" /><span className="tile-smile" /></div>
          <div className="art-disc">↗</div>
          <span className="art-spark">✦</span>
          <span className="art-caption">a little more play.</span>
        </div>
      </section>
      <section className="games-section" id="games" aria-labelledby="games-heading">
        <div className="section-heading">
          <div><p className="eyebrow">THE PLAYGROUND</p><h2 id="games-heading" tabIndex={-1}>ゲーム一覧 <span className="count" aria-label={`${games.length}件`}>{games.length}</span></h2></div>
          <p>気になる遊びを、ひとつ。</p>
        </div>
        {games.length === 0 ? <EmptyState /> : <div className="game-grid">{games.map((game) => <GameCard key={game.id} game={game} />)}</div>}
      </section>
      <aside className="little-note"><span aria-hidden="true">✳</span><p>ひと休みも、いい時間に。<br /><span>あなたのペースで、気軽にどうぞ。</span></p></aside>
    </>
  );
}
