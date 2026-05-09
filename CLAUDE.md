# プロジェクトルール

## ページ・コンポーネント作成時の必須手順

**新しいページやコンポーネントを作成する前に、必ず `src/theme.ts` を読むこと。**

テーマで定義されている色・フォント・コンポーネントスタイルを把握し、それに合わせた実装を行う。

### テーマの概要（`src/theme.ts`）

| 項目 | 値 |
|---|---|
| primary.main | `#CA7842` |
| primary.dark | `#4B352A` |
| secondary.main | `#B2CD9C` |
| background.default | `#F0F2BD` |
| background.paper | `#FAFAF3` |
| text.primary | `#4B352A` |
| text.secondary | `#7A5C47` |
| UIフォント | Noto Sans JP |
| コンテンツフォント | Playfair Display / Noto Serif JP |

ハードコードした色指定は避け、`theme.palette.*` を参照する形で実装すること。

---

## コメントの扱い

既存のコメントは勝手に削除しないこと。リファクタリングや変数名変更を行う際も、コメントを維持したまま内容を更新する。
