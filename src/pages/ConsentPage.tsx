import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

export function ConsentPage() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = () => {
    if (agreed) {
      navigate('/basic-info');
    }
  };

  return (
    <div className="container">
      <div className="consent-header">
        <Shield size={64} className="icon" />
        <h1>脳卒中リスクチェック</h1>
        <p>ご利用にあたっての同意事項</p>
      </div>

      <div className="consent-content">
        <section>
          <h2>このツールについて</h2>
          <p>
            このツールは、日本人を対象とした大規模疫学研究（JPHC研究）の成果に基づいて、
            あなたの今後10年間の脳卒中発症リスクを評価します。
          </p>
        </section>

        <section>
          <h2>ご利用にあたっての注意事項</h2>
          <ul>
            <li>このツールは40歳から69歳の方を対象としています</li>
            <li>結果はあくまで統計的な推定であり、個人の診断を行うものではありません</li>
            <li>健康上の問題や不安がある場合は、必ず医療機関を受診してください</li>
            <li>このツールの結果は医師の診断に代わるものではありません</li>
          </ul>
        </section>

        <section>
          <h2>個人情報の取り扱いについて</h2>
          <ul>
            <li>入力された情報は、リスク評価の目的でのみ使用されます</li>
            <li>個人を特定できる情報は収集しません</li>
            <li>入力データはお客様のブラウザとデータベースに保存されます</li>
            <li>データは統計的な分析に使用される場合があります</li>
          </ul>
        </section>

        <section>
          <h2>データの管理について</h2>
          <ul>
            <li>チェック結果は履歴として保存され、いつでも確認できます</li>
            <li>保存されたデータは、お客様ご自身で削除することができます</li>
            <li>データは適切なセキュリティ対策のもとで管理されます</li>
          </ul>
        </section>

        <div className="privacy-policy-link">
          <a href="/privacy" target="_blank" rel="noopener noreferrer">
            プライバシーポリシーの詳細を見る
          </a>
        </div>
      </div>

      <div className="consent-checkbox">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>上記の内容を理解し、同意します</span>
        </label>
      </div>

      <div className="consent-actions">
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!agreed}
        >
          同意して次へ進む
        </button>
      </div>
    </div>
  );
}
