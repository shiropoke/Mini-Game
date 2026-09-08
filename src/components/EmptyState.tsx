export function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-illustration" aria-hidden="true">
        <span className="empty-spark">✦</span>
        <svg viewBox="0 0 100 80" fill="none"><path d="M29 22h42c9 0 13 8 16 21l5 17c3 12-10 17-17 8L64 55H36L25 68C18 77 5 72 8 60l5-17c3-13 7-21 16-21Z" fill="currentColor"/><path d="M31 32v17m-8-8h16" stroke="var(--surface)" strokeWidth="5" strokeLinecap="round"/><circle cx="65" cy="35" r="4" fill="var(--surface)"/><circle cx="76" cy="45" r="4" fill="var(--surface)"/></svg>
      </div>
      <h3>ゲームはまだありません</h3>
      <p>次の「もう1回！」を、準備中。<br />ここに少しずつ、遊びが増えていきます。</p>
      <span className="status-chip"><span aria-hidden="true" />お楽しみに</span>
    </div>
  );
}
