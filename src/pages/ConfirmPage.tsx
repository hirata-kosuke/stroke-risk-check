import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { evaluateStrokeRisk } from '../utils/evaluation';
import { evaluateCirculatoryRisk } from '../utils/circulatory-evaluation';
import { sendToGoogleSheets } from '../utils/google-sheets';
import type { StrokeRiskInput } from '../types/stroke';

interface ConfirmData {
  basicInfo: {
    name: string;
    age: string;
    gender: 'male' | 'female';
  };
  riskFactors: {
    smoking: 'never' | 'past' | 'current';
    height: string;
    weight: string;
    systolic_bp: string;
    diastolic_bp: string;
    on_bp_medication: boolean;
    has_diabetes: boolean;
    hdl_cholesterol?: string;
    ldl_cholesterol?: string;
    total_cholesterol?: string;
    triglycerides?: string;
  };
}

export function ConfirmPage() {
  const navigate = useNavigate();
  const [confirmData, setConfirmData] = useState<ConfirmData | null>(null);

  useEffect(() => {
    const basicInfoStr = localStorage.getItem('strokeCheckBasicInfo');
    const riskFactorsStr = localStorage.getItem('strokeCheckRiskFactors');

    if (!basicInfoStr || !riskFactorsStr) {
      navigate('/basic-info');
      return;
    }

    setConfirmData({
      basicInfo: JSON.parse(basicInfoStr),
      riskFactors: JSON.parse(riskFactorsStr),
    });
  }, [navigate]);

  if (!confirmData) {
    return null;
  }

  const { basicInfo, riskFactors } = confirmData;

  const getSmokingText = (smoking: string) => {
    switch (smoking) {
      case 'never':
        return '吸わない';
      case 'past':
        return '過去に吸っていた';
      case 'current':
        return '現在吸っている';
      default:
        return '';
    }
  };

  const calculateBMI = () => {
    const height = parseFloat(riskFactors.height);
    const weight = parseFloat(riskFactors.weight);
    if (height && weight) {
      const bmi = weight / Math.pow(height / 100, 2);
      return bmi.toFixed(1);
    }
    return '-';
  };

  const handleBack = () => {
    navigate('/risk-check');
  };

  const handleConfirm = async () => {
    if (!confirmData) return;

    const { basicInfo, riskFactors } = confirmData;

    // リスク評価の実行
    const input: StrokeRiskInput = {
      age: parseInt(basicInfo.age),
      gender: basicInfo.gender,
      smoking: riskFactors.smoking,
      height: parseFloat(riskFactors.height),
      weight: parseFloat(riskFactors.weight),
      systolic_bp: parseInt(riskFactors.systolic_bp),
      diastolic_bp: parseInt(riskFactors.diastolic_bp),
      on_bp_medication: riskFactors.on_bp_medication,
      has_diabetes: riskFactors.has_diabetes,
      // 循環器疾患リスク用（オプション）
      ...(riskFactors.hdl_cholesterol && { hdl_cholesterol: parseFloat(riskFactors.hdl_cholesterol) }),
      ...(riskFactors.ldl_cholesterol && { ldl_cholesterol: parseFloat(riskFactors.ldl_cholesterol) }),
      ...(riskFactors.total_cholesterol && { total_cholesterol: parseFloat(riskFactors.total_cholesterol) }),
      ...(riskFactors.triglycerides && { triglycerides: parseFloat(riskFactors.triglycerides) }),
    };

    const result = evaluateStrokeRisk(input);

    // 循環器疾患リスクの評価（コレステロール値がある場合）
    const circulatoryResult = evaluateCirculatoryRisk(input);

    // 結果を保存
    const resultData = { basicInfo, input, result, circulatoryResult };
    localStorage.setItem('strokeCheckResult', JSON.stringify(resultData));

    // Google Sheetsにデータを送信（非同期・エラーは無視）
    sendToGoogleSheets(resultData).catch(err => {
      console.error('Google Sheets送信エラー:', err);
    });

    // 結果画面へ遷移
    navigate('/result');
  };

  return (
    <div className="container">
      <div className="form-header">
        <CheckCircle size={64} className="icon" />
        <h1>入力内容の確認</h1>
        <p>以下の内容で脳卒中リスクを評価します</p>
      </div>

      <div className="step-content">
        {/* 基本情報 */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #3b82f6' }}>
            基本情報
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', width: '30%', background: '#f9fafb' }}>
                  お名前
                </th>
                <td style={{ padding: '0.75rem' }}>{basicInfo.name}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', background: '#f9fafb' }}>
                  年齢
                </th>
                <td style={{ padding: '0.75rem' }}>{basicInfo.age}歳</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', background: '#f9fafb' }}>
                  性別
                </th>
                <td style={{ padding: '0.75rem' }}>
                  {basicInfo.gender === 'male' ? '男性' : '女性'}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* リスク因子 */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #3b82f6' }}>
            リスク因子
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', width: '30%', background: '#f9fafb' }}>
                  喫煙習慣
                </th>
                <td style={{ padding: '0.75rem' }}>
                  {getSmokingText(riskFactors.smoking)}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', background: '#f9fafb' }}>
                  身長
                </th>
                <td style={{ padding: '0.75rem' }}>{riskFactors.height} cm</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', background: '#f9fafb' }}>
                  体重
                </th>
                <td style={{ padding: '0.75rem' }}>{riskFactors.weight} kg</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', background: '#f9fafb' }}>
                  BMI
                </th>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>
                  {calculateBMI()}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', background: '#f9fafb' }}>
                  血圧
                </th>
                <td style={{ padding: '0.75rem' }}>
                  {riskFactors.systolic_bp}/{riskFactors.diastolic_bp} mmHg
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', background: '#f9fafb' }}>
                  降圧剤服用
                </th>
                <td style={{ padding: '0.75rem' }}>
                  {riskFactors.on_bp_medication ? 'あり' : 'なし'}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', background: '#f9fafb' }}>
                  糖尿病
                </th>
                <td style={{ padding: '0.75rem' }}>
                  {riskFactors.has_diabetes ? 'あり' : 'なし'}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* コレステロール値（入力されている場合） */}
        {(riskFactors.hdl_cholesterol || riskFactors.ldl_cholesterol || riskFactors.total_cholesterol) && (
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #10b981' }}>
              コレステロール値（循環器疾患リスク評価用）
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {riskFactors.hdl_cholesterol && (
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', width: '30%', background: '#f9fafb' }}>
                      HDLコレステロール
                    </th>
                    <td style={{ padding: '0.75rem' }}>
                      {riskFactors.hdl_cholesterol} mg/dL
                    </td>
                  </tr>
                )}
                {riskFactors.ldl_cholesterol && (
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', background: '#f9fafb' }}>
                      LDLコレステロール
                    </th>
                    <td style={{ padding: '0.75rem' }}>
                      {riskFactors.ldl_cholesterol} mg/dL
                    </td>
                  </tr>
                )}
                {riskFactors.total_cholesterol && (
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', background: '#f9fafb' }}>
                      総コレステロール
                    </th>
                    <td style={{ padding: '0.75rem' }}>
                      {riskFactors.total_cholesterol} mg/dL
                    </td>
                  </tr>
                )}
                {riskFactors.triglycerides && (
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', background: '#f9fafb' }}>
                      中性脂肪
                    </th>
                    <td style={{ padding: '0.75rem' }}>
                      {riskFactors.triglycerides} mg/dL
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}

        {/* アクション */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleBack}
          >
            <ArrowLeft size={20} />
            戻って修正
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleConfirm}
          >
            この内容で評価する
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
