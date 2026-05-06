# 🤖 Project Instructions for AI Agents: Kids Experience Quest

あなたは、子供たちの視野を広げるための冒険アプリ「Kids Experience Quest」の開発チームの一員です。
このファイルには、本プロジェクトの開発ルール、技術スタック、および設計哲学が記載されています。作業を開始する前に必ず一読してください。

---

## 🌟 プロジェクトの目的 (Vision)
子供たちが「20のグローバル・クエスト」を通じて、自然・社会・自立・精神の4つの知性を育むためのプラットフォーム。AIが「証明写真」を判定し、クリアスタンプを押すことで達成感を最大化させます。

## 🛠 技術スタック (Tech Stack)
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **AI Logic**: Anthropic Claude 3.5 Sonnet (Vision API for photo validation)
- **Data Persistence**: Local JSON files (data/quests.json, data/user_progress.json)

## 📁 ディレクトリ構造 (Directory Structure)
- `data/quests.json`: 全20クエストのマスターデータ。
- `data/user_progress.json`: ユーザーの達成状況を記録。
- `src/app/api/quests/submit/`: AI写真判定のロジックを実装。
- `src/app/components/`: 再利用可能なUIパーツ（QuestCardなど）。

---

## 📜 開発ルール (Rules & Constraints)

### 1. データ整合性の維持
- `quests.json` のスキーマを変更する場合は、必ず事前に確認を求めること。
- ユーザー進捗データは `user_progress.json` に ID を追加する形式を維持すること。

### 2. UI/UX の方針 (Mobile First)
- **冒険手帳スタイル**: Bento Grid デザインを基本とし、手書き感やゲーム的なワクワク感を重視する。
- **アクセシビリティ**: 漢字にはなるべくルビを振るか、平易な表現を使い、子供が一人で読めるように配慮する。
- **フィードバック**: AIの判定メッセージは「優しく、かつ正確に」作成すること。

### 3. AI判定ロジック (The "Magic" Logic)
- 写真判定時は `quests.json` 内の `photo_criteria` を絶対的な基準とすること。
- セキュリティのため、`.env.local` 内の `ANTHROPIC_API_KEY` を直接ハードコードしたりログに出力したりしないこと。

---

## 🚀 主要なワークフロー (Workflows)

### クエストを追加・修正する場合
1. `data/quests.json` を編集。
2. 必要に応じて `photo_criteria` に基づいた判定用プロンプトを調整。

### UIを改善する場合
1. `Framer Motion` を活用して、スタンプが押される際の「気持ちよさ」を追求する。
2. Tailwind CSS のカラーパレット（Emerald, Sky, Amber, Rose）を各カテゴリに正しく適用する。

---

## 📝 開発者（工場長）への連絡事項
このプロジェクトは「爆速開発」をモットーとしています。
冗長なコードを避け、シンプルかつ拡張性の高い実装を心がけてください。