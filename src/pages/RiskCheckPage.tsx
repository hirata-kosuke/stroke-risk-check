import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ArrowLeft } from 'lucide-react';

export function RiskCheckPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    smoking: '' as 'never' | 'past' | 'current' | '',
    height: '',
    weight: '',
    systolic_bp: '',
    diastolic_bp: '',
    on_bp_medication: false,
    has_diabetes: false,
    // 循環器疾患リスク用（オプション）
    hdl_cholesterol: '',
    ldl_cholesterol: '',
    total_cholesterol: '',
    triglycerides: '',
  });

  const [showCholesterol, setShowCholesterol] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // 基本情報が入力されていない場合は基本情報画面へ
    const basicInfo = localStorage.getItem('strokeCheckBasicInfo');
    if (!basicInfo) {
      navigate('/basic-info');
    }
  }, [navigate]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.smoking) {
      newErrors.smoking = '喫煙習慣を選択してください';
    }

    const height = parseFloat(formData.height);
    if (!formData.height) {
      newErrors.height = '身長を入力してください';
    } else if (isNaN(height) || height < 100 || height > 250) {
      newErrors.height = '身長は100〜250cmの範囲で入力してください';
    }

    const weight = parseFloat(formData.weight);
    if (!formData.weight) {
      newErrors.weight = '体重を入力してください';
    } else if (isNaN(weight) || weight < 20 || weight > 200) {
      newErrors.weight = '体重は20〜200kgの範囲で入力してください';
    }

    const systolic = parseInt(formData.systolic_bp);
    if (!formData.systolic_bp) {
      newErrors.systolic_bp = '収縮期血圧を入力してください';
    } else if (isNaN(systolic) || systolic < 70 || systolic > 250) {
      newErrors.systolic_bp = '収縮期血圧は70〜250mmHgの範囲で入力してください';
    }

    const diastolic = parseInt(formData.diastolic_bp);
    if (!formData.diastolic_bp) {
      newErrors.diastolic_bp = '拡張期血圧を入力してください';
    } else if (isNaN(diastolic) || diastolic < 40 || diastolic > 150) {
      newErrors.diastolic_bp = '拡張期血圧は40〜150mmHgの範囲で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // リスク因子データを保存
      localStorage.setItem('strokeCheckRiskFactors', JSON.stringify(formData));

      // 確認画面へ遷移
      navigate('/confirm');
    }
  };

  return (
    <div className="container">
      <div className="form-header">
        <ClipboardList size={64} className="icon" />
        <h1>リスク因子の入力</h1>
        <p>脳卒中のリスク因子について入力してください</p>
      </div>

      <div className="step-content">
        <form onSubmit={handleSubmit}>
          {/* 喫煙習慣 */}
          <div className="form-group">
            <label>
              喫煙習慣 <span style={{ color: 'red' }}>*</span>
            </label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="smoking"
                  value="never"
                  checked={formData.smoking === 'never'}
                  onChange={(e) =>
                    setFormData({ ...formData, smoking: e.target.value as 'never' })
                  }
                />
                <span>吸わない</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="smoking"
                  value="past"
                  checked={formData.smoking === 'past'}
                  onChange={(e) =>
                    setFormData({ ...formData, smoking: e.target.value as 'past' })
                  }
                />
                <span>過去に吸っていた</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="smoking"
                  value="current"
                  checked={formData.smoking === 'current'}
                  onChange={(e) =>
                    setFormData({ ...formData, smoking: e.target.value as 'current' })
                  }
                />
                <span>現在吸っている</span>
              </label>
            </div>
            {errors.smoking && (
              <div style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {errors.smoking}
              </div>
            )}
          </div>

          {/* 身長・体重 */}
          <div className="form-group">
            <label htmlFor="height">
              身長（cm） <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="number"
              id="height"
              value={formData.height}
              onChange={(e) =>
                setFormData({ ...formData, height: e.target.value })
              }
              placeholder="例: 170"
              step="0.1"
            />
            {errors.height && (
              <div style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {errors.height}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="weight">
              体重（kg） <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="number"
              id="weight"
              value={formData.weight}
              onChange={(e) =>
                setFormData({ ...formData, weight: e.target.value })
              }
              placeholder="例: 65"
              step="0.1"
            />
            {errors.weight && (
              <div style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {errors.weight}
              </div>
            )}
          </div>

          {/* 血圧 */}
          <div className="form-group">
            <label htmlFor="systolic_bp">
              収縮期血圧（上の血圧、mmHg） <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="number"
              id="systolic_bp"
              value={formData.systolic_bp}
              onChange={(e) =>
                setFormData({ ...formData, systolic_bp: e.target.value })
              }
              placeholder="例: 120"
            />
            {errors.systolic_bp && (
              <div style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {errors.systolic_bp}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="diastolic_bp">
              拡張期血圧（下の血圧、mmHg） <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="number"
              id="diastolic_bp"
              value={formData.diastolic_bp}
              onChange={(e) =>
                setFormData({ ...formData, diastolic_bp: e.target.value })
              }
              placeholder="例: 80"
            />
            {errors.diastolic_bp && (
              <div style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {errors.diastolic_bp}
              </div>
            )}
          </div>

          {/* 降圧剤服用 */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.on_bp_medication}
                onChange={(e) =>
                  setFormData({ ...formData, on_bp_medication: e.target.checked })
                }
              />
              <span>降圧剤（血圧を下げる薬）を服用している</span>
            </label>
          </div>

          {/* 糖尿病 */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.has_diabetes}
                onChange={(e) =>
                  setFormData({ ...formData, has_diabetes: e.target.checked })
                }
              />
              <span>糖尿病と診断されている</span>
            </label>
          </div>

          {/* 循環器疾患リスク評価（オプション） */}
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f0f9ff', borderRadius: '8px' }}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showCholesterol}
                  onChange={(e) => setShowCholesterol(e.target.checked)}
                />
                <span style={{ fontWeight: 'bold' }}>循環器疾患リスク（脳梗塞・心筋梗塞・血管年齢）も評価する</span>
              </label>
              <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.5rem', marginLeft: '2rem' }}>
                コレステロール値がわかる場合は、より詳細なリスク評価が可能です
              </div>
            </div>

            {showCholesterol && (
              <>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>コレステロール値</h3>

                <div className="form-group">
                  <label htmlFor="hdl_cholesterol">
                    HDLコレステロール（mg/dL）
                  </label>
                  <input
                    type="number"
                    id="hdl_cholesterol"
                    value={formData.hdl_cholesterol}
                    onChange={(e) =>
                      setFormData({ ...formData, hdl_cholesterol: e.target.value })
                    }
                    placeholder="例: 50"
                    step="0.1"
                  />
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                    基準値: 40 mg/dL以上（低いと動脈硬化のリスク増加）
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="ldl_cholesterol">
                    LDLコレステロール（mg/dL）
                  </label>
                  <input
                    type="number"
                    id="ldl_cholesterol"
                    value={formData.ldl_cholesterol}
                    onChange={(e) =>
                      setFormData({ ...formData, ldl_cholesterol: e.target.value })
                    }
                    placeholder="例: 120"
                    step="0.1"
                  />
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                    基準値: 120 mg/dL未満（高いと動脈硬化のリスク増加）
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="total_cholesterol">
                    総コレステロール（mg/dL）
                  </label>
                  <input
                    type="number"
                    id="total_cholesterol"
                    value={formData.total_cholesterol}
                    onChange={(e) =>
                      setFormData({ ...formData, total_cholesterol: e.target.value })
                    }
                    placeholder="例: 200"
                    step="0.1"
                  />
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                    LDLが不明な場合に使用。基準値: 220 mg/dL未満
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="triglycerides">
                    中性脂肪（mg/dL）
                  </label>
                  <input
                    type="number"
                    id="triglycerides"
                    value={formData.triglycerides}
                    onChange={(e) =>
                      setFormData({ ...formData, triglycerides: e.target.value })
                    }
                    placeholder="例: 150"
                    step="0.1"
                  />
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                    オプション。基準値: 150 mg/dL未満
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="note">
            <strong>注意:</strong> 現在の評価ロジックは暫定値を使用しています。
            JPHC研究の正確な値に基づいて更新する必要があります。
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/basic-info')}
            >
              <ArrowLeft size={20} />
              戻る
            </button>
            <button type="submit" className="btn-primary">
              入力内容を確認
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
