import type { StrokeRiskInput, CirculatoryRiskResult } from '../types/stroke';

/**
 * 循環器疾患リスク評価
 *
 * 出典: JPHC研究（国立がん研究センター）
 * https://epi.ncc.go.jp/riskcheck/circulatory/
 *
 * 注意: 以下の実装は暫定値です。
 * 正確な計算式は公式ツールまたは原著論文を参照してください。
 */

/**
 * 循環器疾患リスクの評価
 * コレステロール値が入力されている場合のみ評価可能
 */
export function evaluateCirculatoryRisk(
  input: StrokeRiskInput
): CirculatoryRiskResult | null {
  // コレステロール値が入力されていない場合はnullを返す
  if (!input.hdl_cholesterol && !input.total_cholesterol) {
    return null;
  }

  // 各疾患のリスク確率を計算（暫定値）
  const cerebralInfarctionRisk = calculateCerebralInfarctionRisk(input);
  const myocardialInfarctionRisk = calculateMyocardialInfarctionRisk(input);
  const totalStrokeRisk = calculateTotalStrokeRisk(input);

  // 血管年齢を推定
  const vascularAge = estimateVascularAge(input);
  const ageDifference = vascularAge ? vascularAge - input.age : undefined;

  return {
    cerebral_infarction: {
      risk_probability: cerebralInfarctionRisk,
      risk_level: determineRiskLevel(cerebralInfarctionRisk),
    },
    myocardial_infarction: {
      risk_probability: myocardialInfarctionRisk,
      risk_level: determineRiskLevel(myocardialInfarctionRisk),
    },
    total_stroke: {
      risk_probability: totalStrokeRisk,
      risk_level: determineRiskLevel(totalStrokeRisk),
    },
    vascular_age: vascularAge,
    age_difference: ageDifference,
  };
}

/**
 * 脳梗塞リスクの計算（暫定）
 */
function calculateCerebralInfarctionRisk(input: StrokeRiskInput): number {
  let risk = 1; // ベースリスク

  // 年齢
  if (input.age >= 60) risk += 3;
  else if (input.age >= 50) risk += 2;
  else if (input.age >= 45) risk += 1;

  // 性別
  if (input.gender === 'male') risk += 1;

  // 喫煙
  if (input.smoking === 'current') risk += 2;
  else if (input.smoking === 'past') risk += 0.5;

  // 血圧
  if (input.on_bp_medication) risk += 3;
  else if (input.systolic_bp >= 140) risk += 2;
  else if (input.systolic_bp >= 130) risk += 1;

  // 糖尿病
  if (input.has_diabetes) risk += 2;

  // HDLコレステロール
  if (input.hdl_cholesterol) {
    if (input.hdl_cholesterol < 40) risk += 1.5;
    else if (input.hdl_cholesterol >= 60) risk -= 0.5;
  }

  // LDLコレステロール
  if (input.ldl_cholesterol) {
    if (input.ldl_cholesterol >= 160) risk += 2;
    else if (input.ldl_cholesterol >= 140) risk += 1.5;
    else if (input.ldl_cholesterol >= 120) risk += 1;
  } else if (input.total_cholesterol) {
    // 総コレステロールで代替
    if (input.total_cholesterol >= 260) risk += 2;
    else if (input.total_cholesterol >= 240) risk += 1.5;
    else if (input.total_cholesterol >= 220) risk += 1;
  }

  return Math.min(risk, 30); // 最大30%
}

/**
 * 心筋梗塞リスクの計算（暫定）
 */
function calculateMyocardialInfarctionRisk(input: StrokeRiskInput): number {
  let risk = 0.5; // ベースリスク（脳梗塞より低め）

  // 年齢（心筋梗塞は高齢でリスク増）
  if (input.age >= 65) risk += 3;
  else if (input.age >= 55) risk += 2;
  else if (input.age >= 50) risk += 1;

  // 性別（男性で顕著）
  if (input.gender === 'male') risk += 2;

  // 喫煙（心筋梗塞との関連が強い）
  if (input.smoking === 'current') risk += 3;
  else if (input.smoking === 'past') risk += 1;

  // 血圧
  if (input.on_bp_medication) risk += 2;
  else if (input.systolic_bp >= 140) risk += 1.5;

  // 糖尿病（心筋梗塞との関連が強い）
  if (input.has_diabetes) risk += 2.5;

  // HDLコレステロール（心筋梗塞で重要）
  if (input.hdl_cholesterol) {
    if (input.hdl_cholesterol < 40) risk += 2;
    else if (input.hdl_cholesterol >= 60) risk -= 1;
  }

  // LDLコレステロール（心筋梗塞で重要）
  if (input.ldl_cholesterol) {
    if (input.ldl_cholesterol >= 160) risk += 3;
    else if (input.ldl_cholesterol >= 140) risk += 2;
    else if (input.ldl_cholesterol >= 120) risk += 1;
  } else if (input.total_cholesterol) {
    if (input.total_cholesterol >= 260) risk += 2.5;
    else if (input.total_cholesterol >= 240) risk += 2;
    else if (input.total_cholesterol >= 220) risk += 1;
  }

  return Math.min(risk, 25); // 最大25%
}

/**
 * 脳卒中全体のリスク計算（脳梗塞+脳内出血+くも膜下出血）
 */
function calculateTotalStrokeRisk(input: StrokeRiskInput): number {
  const cerebralInfarction = calculateCerebralInfarctionRisk(input);

  // 脳内出血・くも膜下出血のリスクを追加（暫定）
  let additionalRisk = 0.5;

  // 血圧は脳出血のリスク因子
  if (input.on_bp_medication) additionalRisk += 1.5;
  else if (input.systolic_bp >= 160) additionalRisk += 2;
  else if (input.systolic_bp >= 140) additionalRisk += 1;

  // 喫煙はくも膜下出血のリスク因子
  if (input.smoking === 'current') additionalRisk += 1;

  return Math.min(cerebralInfarction + additionalRisk, 35); // 最大35%
}

/**
 * 血管年齢の推定（暫定）
 */
function estimateVascularAge(input: StrokeRiskInput): number | undefined {
  // リスク因子の数をカウント
  let riskFactors = 0;

  if (input.smoking === 'current') riskFactors++;
  if (input.on_bp_medication || input.systolic_bp >= 140) riskFactors++;
  if (input.has_diabetes) riskFactors++;
  if (input.hdl_cholesterol && input.hdl_cholesterol < 40) riskFactors++;
  if (input.ldl_cholesterol && input.ldl_cholesterol >= 140) riskFactors++;
  else if (input.total_cholesterol && input.total_cholesterol >= 240) riskFactors++;

  // BMI
  const bmi = input.weight / Math.pow(input.height / 100, 2);
  if (bmi >= 25) riskFactors++;

  // リスク因子の数に応じて血管年齢を加算
  const ageIncrease = riskFactors * 3; // 1因子につき3歳増

  return input.age + ageIncrease;
}

/**
 * リスクレベルの判定
 */
function determineRiskLevel(
  probability: number
): 'low' | 'moderate' | 'high' | 'very_high' {
  if (probability < 5) return 'low';
  if (probability < 10) return 'moderate';
  if (probability < 15) return 'high';
  return 'very_high';
}
