# Vercel デプロイ完全ガイド

このガイドでは、脳卒中リスクチェックアプリを Vercel で無料公開する手順を説明します。

## 所要時間

- **初回**: 約15分
- **更新**: 約1分（git push するだけで自動デプロイ）

## 前提条件

- GitHubアカウント（無料）
- Vercelアカウント（無料）
- Git がインストール済み

---

## ステップ1: Git リポジトリのセットアップ

### 1-1. setup_git.bat を実行

```bash
# プロジェクトフォルダで実行
setup_git.bat
```

これにより:
- Git リポジトリが初期化されます
- すべてのファイルが最初のコミットに含まれます

### 1-2. エラーが出た場合

手動で実行:

```bash
cd C:\Users\kawag\work\stroke-risk-check
git init
git config core.autocrlf true
git add .
git commit -m "Initial commit: 脳卒中リスクチェックアプリ"
```

---

## ステップ2: GitHub リポジトリ作成

### 2-1. GitHub にログイン

https://github.com にアクセスしてログイン

### 2-2. 新規リポジトリ作成

1. 右上の「+」→「New repository」をクリック
2. 設定:
   - **Repository name**: `stroke-risk-check`
   - **Description**: 「脳卒中リスクチェックアプリ（JPHC研究ベース）」
   - **Public / Private**: どちらでも OK（Vercel は両方対応）
   - **Initialize this repository with**: 何も選択しない（空のまま）
3. 「Create repository」をクリック

### 2-3. リモートリポジトリに接続

GitHub の画面に表示されるコマンドをコピーして実行:

```bash
cd C:\Users\kawag\work\stroke-risk-check
git remote add origin https://github.com/YOUR_USERNAME/stroke-risk-check.git
git branch -M main
git push -u origin main
```

**YOUR_USERNAME** は自分の GitHub ユーザー名に置き換えてください。

### 2-4. プッシュ完了確認

GitHub のリポジトリページを更新すると、ファイルが表示されます。

---

## ステップ3: Vercel デプロイ

### 3-1. Vercel にサインアップ

1. https://vercel.com にアクセス
2. 「Start Deploying」をクリック
3. 「Continue with GitHub」を選択
4. GitHub アカウントで認証

### 3-2. プロジェクトをインポート

1. Vercel ダッシュボードで「Add New...」→「Project」
2. 「Import Git Repository」から `stroke-risk-check` を選択
3. 「Import」をクリック

### 3-3. ビルド設定

自動的に検出されますが、確認:

- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3-4. 環境変数の設定（オプション）

Google Sheets 連携を使う場合のみ:

1. 「Environment Variables」セクションを展開
2. 変数を追加:
   - **Name**: `VITE_GOOGLE_APPS_SCRIPT_URL`
   - **Value**: Google Apps Script のデプロイ URL
   - **Environment**: `Production`, `Preview`, `Development` すべてチェック
3. 「Add」をクリック

### 3-5. デプロイ実行

「Deploy」ボタンをクリック

ビルドが開始されます（約2-3分）:
- ✓ Building
- ✓ Deploying
- ✓ Ready

### 3-6. 公開URL取得

デプロイ完了後:

```
https://stroke-risk-check-xxxxx.vercel.app
```

のような URL が表示されます → これが公開 URL です！

---

## ステップ4: カスタムドメイン設定（オプション）

### 4-1. 独自ドメインを追加

1. Vercel プロジェクトの「Settings」→「Domains」
2. ドメインを入力（例: `stroke-check.example.com`）
3. DNS レコードを追加（Vercel が指示を表示）

### 4-2. Vercel 提供のサブドメインを変更

デフォルトの `stroke-risk-check-xxxxx.vercel.app` を変更可能:

1. 「Settings」→「Domains」
2. 「Edit」で好きな名前に変更

---

## ステップ5: 動作確認

### 5-1. アプリにアクセス

公開 URL を開く → 同意画面が表示される

### 5-2. リスクチェック実行

1. 同意画面で「同意する」
2. 基本情報入力
3. リスク因子入力
4. 確認画面で「この内容で評価する」
5. 結果が表示される

### 5-3. Google Sheets 確認（設定した場合）

Google スプレッドシートにデータが追加されているか確認

---

## ステップ6: アプリの更新方法

コードを修正した後:

```bash
cd C:\Users\kawag\work\stroke-risk-check
git add .
git commit -m "更新内容の説明"
git push
```

→ **自動的に Vercel が再デプロイ**します（約2分）

---

## トラブルシューティング

### ビルドエラーが出る場合

1. Vercel のビルドログを確認
2. ローカルでビルドテスト:
   ```bash
   npm run build
   ```
3. エラーを修正して再プッシュ

### 環境変数が反映されない場合

1. Vercel の「Settings」→「Environment Variables」を確認
2. 変数を追加/修正後、「Deployments」→「Redeploy」

### Google Sheets にデータが保存されない

1. ブラウザの開発者ツール（F12）でエラー確認
2. Google Apps Script の URL が正しいか確認
3. Apps Script のデプロイ設定確認（「全員」アクセス可）

### デプロイは成功したが画面が真っ白

1. Vercel のビルドログで警告を確認
2. ブラウザのコンソール（F12）でエラー確認
3. ローカルで `npm run build && npm run preview` でテスト

---

## Vercel の制限（無料プラン）

- **帯域幅**: 月100GB（通常は十分）
- **ビルド時間**: 月6000分（通常は十分）
- **デプロイ数**: 無制限
- **カスタムドメイン**: 利用可能

個人・小規模利用なら無料プランで問題ありません。

---

## セキュリティ推奨事項

### 1. 環境変数を適切に管理

- `.env` ファイルは Git にコミットしない（`.gitignore` 設定済み）
- 機密情報は Vercel の Environment Variables に設定

### 2. Google Sheets のアクセス制限

- スプレッドシートの共有設定を「限定公開」に
- 閲覧権限のみを付与

### 3. 定期的な更新

- 依存パッケージの更新:
  ```bash
  npm update
  git add package.json package-lock.json
  git commit -m "Update dependencies"
  git push
  ```

---

## 完了！

おめでとうございます！脳卒中リスクチェックアプリが公開されました。

**公開URL**: https://stroke-risk-check-xxxxx.vercel.app

このURLを共有すれば、誰でもアクセスできます。

### 次のステップ

- [ ] Google Sheets 連携の設定（未設定の場合）
- [ ] カスタムドメインの設定（任意）
- [ ] アプリの改善・機能追加
- [ ] データ分析（Google Sheets で集計）

---

## サポート

- **Vercel ドキュメント**: https://vercel.com/docs
- **GitHub ドキュメント**: https://docs.github.com
- **問題が発生した場合**: プロジェクトの README.md を参照
