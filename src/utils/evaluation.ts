import type { StrokeRiskInput, StrokeRiskResult } from '../types/stroke';

/**
 * 脳卒中リスクスコアの計算
 *
 * 出典: JPHC研究（国立がん研究センター）
 * https://epi.ncc.go.jp/jphc/outcome/3284.html
 *
 * ステップ1: 点数を当てはめる
 * ステップ2: 点数を合計する
 * ステップ3: 10年間で脳卒中を発症する確率(%)を算出
 */

/**
 * 年齢スコアの計算
 * テーブル: 40-44→0, 45-49→5, 50-54→6, 55-59→12, 60-64→16, 65-69→19
 */
function calculateAgeScore(age: number): number {
  if (age < 45) return 0;
  if (age < 50) return 5;
  if (age < 55) return 6;
  if (age < 60) return 12;
  if (age < 65) return 16;
  return 19; // 65-69
}

/**
 * 性別スコアの計算
 * テーブル: 男性→6, 女性→0
 */
function calculateGenderScore(gender: 'male' | 'female'): number {
  return gender === 'male' ? 6 : 0;
}

/**
 * 喫煙スコアの計算
 * テーブル: たばこを吸っている 男性→4, 女性→8
 */
function calculateSmokingScore(smoking: 'never' | 'past' | 'current', gender: 'male' | 'female'): number {
  if (smoking === 'current') {
    return gender === 'male' ? 4 : 8;
  }
  return 0;
}

/**
 * BMIスコアの計算
 * テーブル: <25→0, 25-<30→2, 30-→3
 * BMI = 体重(kg) ÷ 身長(m) ÷ 身長(m)
 */
function calculateBMIScore(bmi: number): number {
  if (bmi < 25) return 0;
  if (bmi < 30) return 2;
  return 3;
}

/**
 * 血圧スコアの計算
 * 降圧薬あり→7点
 * 降圧薬内服なしの場合:
 * <120/80→0, 120-129/80-84→3, 130-139/85-89→6, 140-159/90-99→8,
 * 160-179/100-109→11, 180-/110-→13
 *
 * 降圧薬内服中の場合:
 * <120/80→10, 120-129/80-84→10, 130-139/85-89→10, 140-159/90-99→11,
 * 160-179/100-109→11, 180-/110-→15
 */
function calculateBPScore(
  systolic: number,
  diastolic: number,
  onMedication: boolean
): number {
  if (onMedication) {
    // 降圧薬内服中
    if (systolic < 140 || diastolic < 90) return 10;
    if (systolic < 180 || diastolic < 110) return 11;
    return 15;
  } else {
    // 降圧薬内服なし
    if (systolic < 120 && diastolic < 80) return 0;
    if (systolic < 130 || diastolic < 85) return 3;
    if (systolic < 140 || diastolic < 90) return 6;
    if (systolic < 160 || diastolic < 100) return 8;
    if (systolic < 180 || diastolic < 110) return 11;
    return 13;
  }
}

/**
 * 糖尿病スコアの計算
 * テーブル: あり→7
 * 糖尿病ありとは: 治療中またはHbA1c(空腹時血糖値126 mg/dL以上)
 */
function calculateDiabetesScore(hasDiabetes: boolean): number {
  return hasDiabetes ? 7 : 0;
}

/**
 * 合計スコアから10年間の発症確率を計算
 * テーブル(合計点数 → 発症確率(%)):
 * 10点以下→<1%, 11-17→1-<2, 18-22→2-<3, 23-25→3-<4, 26-27→4-<5,
 * 28-29→5-<6, 30→6-<7, 31-32→7-<8, 33→8-<9, 34→9-<10,
 * 35-36→10-<12, 37-39→12-<15, 40-42→15-<20, 43点以上→20%以上
 */
function calculateRiskProbability(totalScore: number): number {
  if (totalScore <= 10) return 0.5;
  if (totalScore <= 17) return 1.5;
  if (totalScore <= 22) return 2.5;
  if (totalScore <= 25) return 3.5;
  if (totalScore <= 27) return 4.5;
  if (totalScore <= 29) return 5.5;
  if (totalScore === 30) return 6.5;
  if (totalScore <= 32) return 7.5;
  if (totalScore === 33) return 8.5;
  if (totalScore === 34) return 9.5;
  if (totalScore <= 36) return 11;
  if (totalScore <= 39) return 13.5;
  if (totalScore <= 42) return 17.5;
  return 20; // 43点以上
}

/**
 * リスクレベルの判定
 */
function determineRiskLevel(probability: number): 'low' | 'moderate' | 'high' | 'very_high' {
  if (probability < 5) return 'low';
  if (probability < 10) return 'moderate';
  if (probability < 15) return 'high';
  return 'very_high';
}

/**
 * BMIの計算
 */
export function calculateBMI(height: number, weight: number): number {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

/**
 * 脳卒中リスクの総合評価
 */
export function evaluateStrokeRisk(input: StrokeRiskInput): StrokeRiskResult {
  const bmi = calculateBMI(input.height, input.weight);

  const ageScore = calculateAgeScore(input.age);
  const genderScore = calculateGenderScore(input.gender);
  const smokingScore = calculateSmokingScore(input.smoking, input.gender);
  const bmiScore = calculateBMIScore(bmi);
  const bpScore = calculateBPScore(
    input.systolic_bp,
    input.diastolic_bp,
    input.on_bp_medication
  );
  const diabetesScore = calculateDiabetesScore(input.has_diabetes);

  const totalScore =
    ageScore +
    genderScore +
    smokingScore +
    bmiScore +
    bpScore +
    diabetesScore;

  const riskProbability = calculateRiskProbability(totalScore);
  const riskLevel = determineRiskLevel(riskProbability);

  return {
    total_score: totalScore,
    risk_probability: riskProbability,
    risk_level: riskLevel,
    age_score: ageScore,
    gender_score: genderScore,
    smoking_score: smokingScore,
    bmi_score: bmiScore,
    bp_score: bpScore,
    diabetes_score: diabetesScore,
    bmi: parseFloat(bmi.toFixed(1)),
  };
}

/**
 * リスクレベルの日本語表示
 */
export function getRiskLevelText(level: 'low' | 'moderate' | 'high' | 'very_high'): string {
  switch (level) {
    case 'low':
      return '低リスク';
    case 'moderate':
      return '中リスク';
    case 'high':
      return '高リスク';
    case 'very_high':
      return '非常に高リスク';
  }
}

/**
 * リスクレベルの色
 */
export function getRiskLevelColor(level: 'low' | 'moderate' | 'high' | 'very_high'): string {
  switch (level) {
    case 'low':
      return '#10b981'; // green
    case 'moderate':
      return '#fbbf24'; // yellow
    case 'high':
      return '#f97316'; // orange
    case 'very_high':
      return '#ef4444'; // red
  }
}
