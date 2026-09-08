import { BrandIcon } from '../components/BrandIcon';

export function NotFoundPage() {
  return (
    <section className="not-found">
      <p className="error-number" aria-hidden="true">404<BrandIcon className="error-brand-icon" /></p>
      <h1>ページが見つかりません</h1>
      <p>この遊び場は、まだないみたい。<br />ホームから、もう一度はじめましょう。</p>
      <a className="button primary" href="#/">ホームに戻る <span aria-hidden="true">↗</span></a>
    </section>
  );
}
