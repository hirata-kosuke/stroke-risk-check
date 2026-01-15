# Supabase セットアップ手順

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセス
2. 新しいプロジェクトを作成
3. プロジェクトのURLとanon keyをコピー

## 2. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成し、以下を設定:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. データベーススキーマの作成

Supabase SQL Editorで以下のSQLを実行してください。

### ユーザーテーブル

```sql
-- ユーザーテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 40 AND age <= 69),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  consent_date TIMESTAMP WITH TIME ZONE NOT NULL,
  consent_version TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- コメント
COMMENT ON TABLE users IS '脳卒中リスクチェック利用者情報';
COMMENT ON COLUMN users.age IS '年齢（40-69歳）';
COMMENT ON COLUMN users.gender IS '性別（male: 男性, female: 女性）';
```

### 脳卒中チェックテーブル

```sql
-- 脳卒中チェックテーブル
CREATE TABLE stroke_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  check_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- 入力データ
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  smoking TEXT NOT NULL CHECK (smoking IN ('never', 'past', 'current')),
  height NUMERIC NOT NULL,
  weight NUMERIC NOT NULL,
  bmi NUMERIC NOT NULL,
  systolic_bp INTEGER NOT NULL,
  diastolic_bp INTEGER NOT NULL,
  on_bp_medication BOOLEAN NOT NULL,
  has_diabetes BOOLEAN NOT NULL,

  -- スコア
  age_score INTEGER NOT NULL,
  gender_score INTEGER NOT NULL,
  smoking_score INTEGER NOT NULL,
  bmi_score INTEGER NOT NULL,
  bp_score INTEGER NOT NULL,
  diabetes_score INTEGER NOT NULL,
  total_score INTEGER NOT NULL,

  -- 結果
  risk_probability NUMERIC NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'very_high')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- インデックス
CREATE INDEX idx_stroke_checks_user_id ON stroke_checks(user_id);
CREATE INDEX idx_stroke_checks_check_date ON stroke_checks(check_date);

-- コメント
COMMENT ON TABLE stroke_checks IS '脳卒中リスクチェック記録';
COMMENT ON COLUMN stroke_checks.smoking IS '喫煙習慣（never: なし, past: 過去, current: 現在）';
COMMENT ON COLUMN stroke_checks.bmi IS '体格指数（BMI）';
COMMENT ON COLUMN stroke_checks.systolic_bp IS '収縮期血圧（mmHg）';
COMMENT ON COLUMN stroke_checks.diastolic_bp IS '拡張期血圧（mmHg）';
COMMENT ON COLUMN stroke_checks.on_bp_medication IS '降圧剤服用';
COMMENT ON COLUMN stroke_checks.has_diabetes IS '糖尿病';
COMMENT ON COLUMN stroke_checks.risk_probability IS '10年間の発症確率（%）';
COMMENT ON COLUMN stroke_checks.risk_level IS 'リスクレベル（low/moderate/high/very_high）';
```

### Row Level Security (RLS)の設定

```sql
-- RLS有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stroke_checks ENABLE ROW LEVEL SECURITY;

-- ポリシー: すべてのユーザーが自分のデータを挿入可能
CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can insert their own checks" ON stroke_checks
  FOR INSERT WITH CHECK (true);

-- ポリシー: すべてのユーザーが自分のデータを閲覧可能（将来的な拡張用）
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can view their own checks" ON stroke_checks
  FOR SELECT USING (true);
```

### 集団解析用ビュー（オプション）

```sql
-- 統計用ビュー
CREATE OR REPLACE VIEW stroke_risk_statistics AS
SELECT
  CASE
    WHEN age < 50 THEN '40-49'
    WHEN age < 60 THEN '50-59'
    ELSE '60-69'
  END as age_group,
  gender,
  COUNT(*) as total_checks,
  AVG(risk_probability) as avg_risk_probability,
  AVG(total_score) as avg_total_score,
  SUM(CASE WHEN risk_level = 'low' THEN 1 ELSE 0 END) as count_low_risk,
  SUM(CASE WHEN risk_level = 'moderate' THEN 1 ELSE 0 END) as count_moderate_risk,
  SUM(CASE WHEN risk_level = 'high' THEN 1 ELSE 0 END) as count_high_risk,
  SUM(CASE WHEN risk_level = 'very_high' THEN 1 ELSE 0 END) as count_very_high_risk
FROM stroke_checks
GROUP BY age_group, gender
ORDER BY age_group, gender;

COMMENT ON VIEW stroke_risk_statistics IS '脳卒中リスクチェック統計（年代・性別ごと）';
```

## 4. セットアップ完了

これで脳卒中リスクチェックアプリのデータベースセットアップが完了です。

## データ構造の補足

### 喫煙習慣
- `never`: 吸ったことがない
- `past`: 過去に吸っていた（現在は禁煙）
- `current`: 現在も吸っている

### リスクレベル
- `low`: 低リスク（発症確率 < 5%）
- `moderate`: 中リスク（5% ≤ 発症確率 < 10%）
- `high`: 高リスク（10% ≤ 発症確率 < 15%）
- `very_high`: 非常に高リスク（発症確率 ≥ 15%）
