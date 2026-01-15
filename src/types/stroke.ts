// ユーザー情報
export interface User {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  consent_date: string;
  consent_version: string;
  created_at: string;
}

// 脳卒中リスクチェック入力データ
export interface StrokeRiskInput {
  age: number; // 40-69歳
  gender: 'male' | 'female';
  smoking: 'never' | 'past' | 'current'; // 喫煙習慣: なし/過去/現在
  height: number; // 身長(cm)
  weight: number; // 体重(kg)
  systolic_bp: number; // 収縮期血圧(mmHg)
  diastolic_bp: number; // 拡張期血圧(mmHg)
  on_bp_medication: boolean; // 降圧剤服用
  has_diabetes: boolean; // 糖尿病
  // 循環器疾患リスク用（オプション）
  hdl_cholesterol?: number; // HDLコレステロール(mg/dL)
  ldl_cholesterol?: number; // LDLコレステロール(mg/dL)
  total_cholesterol?: number; // 総コレステロール(mg/dL) - LDL不明時
  triglycerides?: number; // 中性脂肪(mg/dL) - オプション
}

// リスク評価結果
export interface StrokeRiskResult {
  total_score: number; // 合計スコア
  risk_probability: number; // 10年間の発症確率(%)
  risk_level: 'low' | 'moderate' | 'high' | 'very_high'; // リスクレベル
  age_score: number;
  gender_score: number;
  smoking_score: number;
  bmi_score: number;
  bp_score: number;
  diabetes_score: number;
  bmi: number; // 計算されたBMI
}

// 循環器疾患リスク評価結果
export interface CirculatoryRiskResult {
  // 脳梗塞リスク
  cerebral_infarction: {
    risk_probability: number; // 10年間の発症確率(%)
    risk_level: 'low' | 'moderate' | 'high' | 'very_high';
  };
  // 心筋梗塞リスク
  myocardial_infarction: {
    risk_probability: number; // 10年間の発症確率(%)
    risk_level: 'low' | 'moderate' | 'high' | 'very_high';
  };
  // 脳卒中全体リスク
  total_stroke: {
    risk_probability: number; // 10年間の発症確率(%)
    risk_level: 'low' | 'moderate' | 'high' | 'very_high';
  };
  // 血管年齢
  vascular_age?: number;
  // 実年齢との差
  age_difference?: number;
}

// 脳卒中チェック記録
export interface StrokeCheck {
  id: string;
  user_id: string;
  check_date: string;

  // 入力データ
  age: number;
  gender: string;
  smoking: string;
  height: number;
  weight: number;
  bmi: number;
  systolic_bp: number;
  diastolic_bp: number;
  on_bp_medication: boolean;
  has_diabetes: boolean;

  // スコア
  age_score: number;
  gender_score: number;
  smoking_score: number;
  bmi_score: number;
  bp_score: number;
  diabetes_score: number;
  total_score: number;

  // 結果
  risk_probability: number;
  risk_level: string;

  created_at: string;
}

// フォーム入力データ
export interface StrokeRiskFormData {
  // 基本情報
  name: string;
  age: number;
  gender: 'male' | 'female';

  // リスク因子
  smoking: 'never' | 'past' | 'current';
  height: number;
  weight: number;
  systolic_bp: number;
  diastolic_bp: number;
  on_bp_medication: boolean;
  has_diabetes: boolean;

  // 循環器疾患リスク用（オプション）
  hdl_cholesterol?: number;
  ldl_cholesterol?: number;
  total_cholesterol?: number;
  triglycerides?: number;
}
