import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft } from 'lucide-react';

export function BasicInfoPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '' as 'male' | 'female' | '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'お名前を入力してください';
    }

    const age = parseInt(formData.age);
    if (!formData.age) {
      newErrors.age = '年齢を入力してください';
    } else if (isNaN(age) || age < 40 || age > 69) {
      newErrors.age = '年齢は40歳から69歳の範囲で入力してください';
    }

    if (!formData.gender) {
      newErrors.gender = '性別を選択してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // データを保存してリスクチェック画面へ
      localStorage.setItem('strokeCheckBasicInfo', JSON.stringify(formData));
      navigate('/risk-check');
    }
  };

  return (
    <div className="container">
      <div className="form-header">
        <User size={64} className="icon" />
        <h1>基本情報の入力</h1>
        <p>リスク評価に必要な基本情報を入力してください</p>
      </div>

      <div className="step-content">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">
              お名前 <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="山田 太郎"
            />
            {errors.name && (
              <div style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {errors.name}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="age">
              年齢 <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="number"
              id="age"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
              placeholder="40〜69歳"
              min="40"
              max="69"
            />
            {errors.age && (
              <div style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {errors.age}
              </div>
            )}
            <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>
              このツールは40歳から69歳の方を対象としています
            </div>
          </div>

          <div className="form-group">
            <label>
              性別 <span style={{ color: 'red' }}>*</span>
            </label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value as 'male' })
                  }
                />
                <span>男性</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value as 'female' })
                  }
                />
                <span>女性</span>
              </label>
            </div>
            {errors.gender && (
              <div style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {errors.gender}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={20} />
              戻る
            </button>
            <button type="submit" className="btn-primary">
              次へ進む
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
