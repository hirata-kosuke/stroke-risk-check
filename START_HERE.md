# 🚀 クイックスタートガイド

脳卒中リスクチェックアプリを無料で公開する手順です。

---

## ステップ0: 環境確認（初回のみ）

```bash
test_setup.bat
```

- Git がインストールされているか確認
- Git のユーザー情報が設定されているか確認
- 必要に応じて自動設定

---

## ステップ1: Git セットアップ

```bash
setup_git.bat
```

これで以下が自動的に実行されます:
- Git リポジトリの初期化
- すべてのファイルをコミット

**実行時の注意**:
- ウィンドウが閉じずに pause で停止します
- エラーメッセージが表示された場合は内容を確認してください

---

## ステップ2: GitHub リポジトリ作成

### 2-1. GitHub でリポジトリ作成

1. https://github.com/new にアクセス
2. リポジトリ名: `stroke-risk-check`
3. Public または Private を選択
4. **「Initialize this repository with」は何も選択しない**
5. 「Create repository」をクリック

### 2-2. リモートリポジトリに接続

GitHub の画面に表示されるコマンドをコピーして実行:

```bash
git remote add origin https://github.com/YOUR_USERNAME/stroke-risk-check.git
git branch -M main
git push -u origin main
```

**YOUR_USERNAME** を自分のユーザー名に置き換えてください。

---

## ステップ3: Vercel でデプロイ

### 3-1. Vercel にサインアップ

1. https://vercel.com にアクセス
2. 「Start Deploying」をクリック
3. 「Continue with GitHub」を選択

### 3-2. プロジェクトをインポート

1. 「Add New...」→「Project」
2. `stroke-risk-check` を選択して「Import」
3. Framework Preset: **Vite** が自動選択される
4. 「Deploy」をクリック

### 3-3. デプロイ完了

約2-3分で完了 → 公開URLが発行されます

例: `https://stroke-risk-check-xxxxx.vercel.app`

---

## ステップ4: Google Sheets 連携（オプション）

データを Google スプレッドシートで管理したい場合:

詳しくは [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md) を参照

---

## アプリの更新方法

コードを修正した後:

```bash
push_to_github.bat
```

1. コミットメッセージを入力
2. Enter → 自動的に GitHub にプッシュ
3. Vercel が自動的に再デプロイ（約2分）

---

## トラブルシューティング

### setup_git.bat が強制的に閉じる

- `test_setup.bat` を先に実行して環境確認
- Git のユーザー情報が設定されているか確認

### Git ユーザー情報の設定

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 既に Git リポジトリが存在する

```bash
# 既存のリポジトリを削除（注意: 慎重に）
rmdir /s /q .git
# その後 setup_git.bat を実行
setup_git.bat
```

### push_to_github.bat でエラーが出る

初回プッシュの場合は手動で:

```bash
git remote add origin https://github.com/YOUR_USERNAME/stroke-risk-check.git
git branch -M main
git push -u origin main
```

その後は `push_to_github.bat` が使えます。

---

## 詳細ガイド

- **Vercel デプロイ詳細**: [VERCEL_DEPLOY_GUIDE.md](VERCEL_DEPLOY_GUIDE.md)
- **Google Sheets 連携**: [GOOGLE_SHEETS_SETUP.md](GOOGLE_SHEETS_SETUP.md)
- **ローカル開発**: [README.md](README.md)

---

## サポート

問題が発生した場合は、上記のトラブルシューティングを確認してください。

**重要なファイル**:
- `setup_git.bat` - Git セットアップ
- `test_setup.bat` - 環境確認
- `push_to_github.bat` - GitHub プッシュ
- `.env.example` - 環境変数のテンプレート
