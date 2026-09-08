# Mini-Game

React + TypeScript + Vite のミニゲームサイト。ゲーム0件で利用できます。

```sh
npm ci
npm run dev
npm run lint
npm run build
npm run preview
```

開発・プレビュー URL は `/Mini-Game/` 配下です。

## ゲームの追加

1. `src/games/my-game/MyGame.tsx` に引数なしの React コンポーネントを作る。
2. `src/games/registry.ts` で import し、`games` に1件追加する。

```tsx
import { MyGame } from './my-game/MyGame';

export const games: readonly GameDefinition[] = [
  {
    id: 'my-game',
    title: 'ゲーム名',
    description: '短い説明',
    path: '/games/my-game',
    component: MyGame,
  },
];
```

`id` と `path` は重複させず、path は小文字・末尾スラッシュなしにします。
ホームのカードと `#/games/my-game` の画面が自動で追加されます。
タイトルと戻る操作は `src/pages/GameLayout.tsx` が提供します。
ゲーム固有の CSS はゲームのフォルダに置き、クラス名をゲーム名で区別してください。

## デザインとテーマ

`src/styles.css` の tokens レイヤーに配色・shape・余白・文字・elevation・motion を集約。
テーマは OS 追従が初期値です。明示的な選択だけ `mini-game:theme` に保存します。
低減モーション、キーボード操作、モバイル幅に対応しています。

## GitHub Pages

GitHub の **Settings → Pages → Source → GitHub Actions** を選択してください。
`main` / `master` への push または手動実行で lint・build 後に公開します。
Vite の base は `/Mini-Game/`。ハッシュルーティングでゲーム URL の再読み込みも可能です。
未知のハッシュはアプリの404画面になります。ハッシュなしの任意のサブパスは GitHub 側の404になります。

画像は `src` 内から import するか、`public` の場合は
`import.meta.env.BASE_URL + 'image.svg'` で参照し、`/image.svg` のようなルート絶対パスを避けてください。

参考: [Material 3 Expressive](https://design.google/library/expressive-material-design-google-research)、[Vite の GitHub Pages 設定](https://ja.vite.dev/guide/static-deploy#github-pages)
