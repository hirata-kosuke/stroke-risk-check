# デプロイ方法

## Vercel（推奨・無料）

### 初回デプロイ

1. **Vercelアカウント作成**
   - https://vercel.com にアクセス
   - GitHubアカウントでサインアップ

2. **GitHubリポジトリ作成**
   ```bash
   cd C:\Users\kawag\work\stroke-risk-check
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **GitHubにプッシュ**
   - GitHub（https://github.com）で新しいリポジトリ作成
   - リモートリポジトリを追加してプッシュ
   ```bash
   git remote add origin https://github.com/your-username/stroke-risk-check.git
   git branch -M main
   git push -u origin main
   ```

4. **Vercelでインポート**
   - Vercel ダッシュボードで「New Project」
   - GitHubリポジトリを選択
   - Framework Preset: Vite を選択
   - Deploy をクリック

5. **公開URL取得**
   - デプロイ完了後、`https://your-project.vercel.app` のようなURLが発行されます

### 更新方法

```bash
git add .
git commit -m "Update scoring logic"
git push
```
→ 自動的に再デプロイされます

## Netlify（無料）

1. **Netlifyアカウント作成**
   - https://www.netlify.com にアクセス

2. **ドラッグ&ドロップデプロイ**
   ```bash
   npm run build
   ```
   - `dist` フォルダをNetlifyサイトにドラッグ&ドロップ

3. **公開URL取得**
   - `https://random-name.netlify.app` のようなURLが発行されます

## GitHub Pages（無料）

1. **ビルド設定**

   `vite.config.ts` に base を追加:
   ```typescript
   export default defineConfig({
     base: '/stroke-risk-check/',
     // ...
   })
   ```

2. **デプロイ**
   ```bash
   npm run build
   git add dist -f
   git commit -m "Deploy to GitHub Pages"
   git subtree push --prefix dist origin gh-pages
   ```

3. **GitHub Settings**
   - リポジトリの Settings > Pages
   - Source: gh-pages branch を選択
   - URL: `https://your-username.github.io/stroke-risk-check/`

## 環境変数（Supabase使用時）

Vercel/Netlifyの場合:
- ダッシュボードで Environment Variables を設定
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## カスタムドメイン

Vercel/Netlifyで独自ドメインを設定可能:
1. ドメインを購入（お名前.com等）
2. Vercel/NetlifyのダッシュボードでCustom Domainを追加
3. DNSレコードを設定

例: `https://stroke-check.example.com`
