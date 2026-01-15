# Google Apps Script版 脳卒中リスクチェック

Google Apps ScriptとGoogleスプレッドシートを使った実装ガイド

## メリット

1. **完全無料**: Googleアカウントがあれば利用可能
2. **データ管理**: Googleスプレッドシートで簡単にデータ管理
3. **共有が簡単**: URLを共有するだけ
4. **権限管理**: Googleアカウントで閲覧・編集権限を管理
5. **バックアップ不要**: Googleが自動でバックアップ

## デメリット

1. **開発の手間**: 現在のReactアプリを書き直す必要がある
2. **UIの制限**: React版ほどリッチなUIは難しい
3. **パフォーマンス**: 大量アクセスには向かない

## 実装方法

### 1. Google Apps Scriptプロジェクト作成

1. **Googleスプレッドシートを作成**
   - https://sheets.google.com で新規スプレッドシート作成
   - シート名: 「脳卒中リスクチェック_データ」

2. **Apps Scriptエディタを開く**
   - スプレッドシートで「拡張機能」→「Apps Script」

3. **シート構成**

   **シート1: 入力データ**
   ```
   | タイムスタンプ | 名前 | 年齢 | 性別 | 喫煙 | 身長 | 体重 | BMI | 収縮期血圧 | 拡張期血圧 | 降圧剤 | 糖尿病 | 合計スコア | 発症確率 | リスクレベル |
   ```

   **シート2: スコア設定**
   - JPHCのスコアテーブルをスプレッドシートで管理
   - 計算式の修正が容易

### 2. コード構成

**Code.gs** (メインロジック)
```javascript
// JPHC研究に基づくスコア計算
function calculateStrokeRisk(input) {
  const ageScore = calculateAgeScore(input.age);
  const genderScore = input.gender === 'male' ? 6 : 0;
  const smokingScore = calculateSmokingScore(input.smoking, input.gender);
  const bmiScore = calculateBMIScore(input.bmi);
  const bpScore = calculateBPScore(input.systolic_bp, input.diastolic_bp, input.on_bp_medication);
  const diabetesScore = input.has_diabetes ? 7 : 0;

  const totalScore = ageScore + genderScore + smokingScore + bmiScore + bpScore + diabetesScore;
  const probability = calculateRiskProbability(totalScore);
  const riskLevel = determineRiskLevel(probability);

  return {
    totalScore: totalScore,
    probability: probability,
    riskLevel: riskLevel
  };
}

// スプレッドシートにデータ保存
function saveData(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('入力データ');
  const row = [
    new Date(),
    data.name,
    data.age,
    data.gender,
    data.smoking,
    data.height,
    data.weight,
    data.bmi,
    data.systolic_bp,
    data.diastolic_bp,
    data.on_bp_medication ? 'あり' : 'なし',
    data.has_diabetes ? 'あり' : 'なし',
    data.totalScore,
    data.probability,
    data.riskLevel
  ];
  sheet.appendRow(row);
}
```

**HTML.html** (UI)
```html
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <style>
    /* スタイル定義 */
  </style>
</head>
<body>
  <h1>脳卒中リスクチェック</h1>
  <form id="riskForm">
    <!-- フォーム要素 -->
  </form>

  <script>
    function submitForm() {
      const formData = {
        name: document.getElementById('name').value,
        age: parseInt(document.getElementById('age').value),
        // ... その他のフィールド
      };

      google.script.run
        .withSuccessHandler(showResult)
        .withFailureHandler(showError)
        .processRiskCheck(formData);
    }
  </script>
</body>
</html>
```

### 3. デプロイ

1. **Apps Scriptエディタで「デプロイ」→「新しいデプロイ」**
2. **種類を選択**: 「ウェブアプリ」
3. **アクセス権限**:
   - 「全員」: 誰でもアクセス可能
   - 「Googleアカウントを持つユーザー」: ログイン必須
4. **デプロイ** → URLが発行される

### 4. URL共有

デプロイ完了後、以下のようなURLが発行されます:
```
https://script.google.com/macros/s/[SCRIPT_ID]/exec
```

このURLを共有すれば、誰でもアクセス可能です。

## データ管理（スプレッドシート）

### メリット

1. **リアルタイム閲覧**: 入力されたデータをすぐに確認
2. **フィルタ・集計**: スプレッドシートの機能で簡単に分析
3. **グラフ作成**: リスク分布などを可視化
4. **CSVエクスポート**: データのバックアップが容易

### 分析例

**ピボットテーブル**
- リスクレベル別の人数集計
- 年齢層別の平均スコア
- 性別・喫煙習慣別の発症確率

**グラフ**
- リスクレベルの分布（円グラフ）
- 年齢別スコア推移（折れ線グラフ）
- BMIと発症確率の関係（散布図）

## 現在のReactアプリとの比較

| 項目 | React (Vercel) | Google Apps Script |
|------|----------------|-------------------|
| **費用** | 無料 | 無料 |
| **開発** | 完成済み | 要作り直し |
| **UI** | リッチ | シンプル |
| **データ管理** | Supabase/別途 | スプレッドシート統合 |
| **共有** | URL共有 | URL共有 |
| **権限管理** | 別途設定 | Googleアカウント |
| **更新** | Git push | Apps Script編集 |

## 推奨方針

### パターン1: すぐに使いたい（推奨）

1. **現在のReactアプリをVercelでデプロイ** → すぐに使える
2. **データ保存はSupabase** → 無料枠で十分
3. **Supabaseのデータをスプレッドシートにエクスポート** → 手動またはAPI連携

### パターン2: Google完結（開発時間が必要）

1. **Google Apps Scriptで作り直す** → 2-3日の開発期間
2. **スプレッドシートで直接データ管理** → 完全にGoogle内で完結

### パターン3: ハイブリッド（おすすめ）

1. **ReactアプリをVercelでデプロイ** → UIはリッチなまま
2. **データをGoogleスプレッドシートに送信**
   - Apps ScriptでAPI作成
   - ReactアプリからPOSTリクエスト
3. **スプレッドシートで分析・管理**

## 次のステップ

希望に応じて以下を実装できます:

1. **今すぐデプロイ**: 現在のReactアプリをVercelで公開
2. **Google Apps Script版を作成**: 完全にGoogle内で管理
3. **ハイブリッド実装**: ReactアプリからGoogleスプレッドシートへデータ送信

どの方針が良いでしょうか?
