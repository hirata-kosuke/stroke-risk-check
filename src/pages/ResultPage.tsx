import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Home, Printer, Heart, Camera, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { getRiskLevelText, getRiskLevelColor } from '../utils/evaluation';
import type { StrokeRiskResult, StrokeRiskInput, CirculatoryRiskResult } from '../types/stroke';

interface ResultData {
  basicInfo: {
    name: string;
    age: string;
    gender: 'male' | 'female';
  };
  input: StrokeRiskInput;
  result: StrokeRiskResult;
  circulatoryResult?: CirculatoryRiskResult | null;
}

export function ResultPage() {
  const navigate = useNavigate();
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const resultContainerRef = useRef<HTMLDivElement>(null);
  const [isSavingImage, setIsSavingImage] = useState(false);

  // スマホかどうかを判定
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
    const dataStr = localStorage.getItem('strokeCheckResult');
    if (!dataStr) {
      navigate('/');
      return;
    }
    setResultData(JSON.parse(dataStr));
  }, [navigate]);

  if (!resultData) {
    return null;
  }

  const { basicInfo, input, result, circulatoryResult } = resultData;

  const getRiskClassName = (level: string) => {
    switch (level) {
      case 'low':
        return 'risk-green';
      case 'moderate':
        return 'risk-yellow';
      case 'high':
        return 'risk-orange';
      case 'very_high':
        return 'risk-red';
      default:
        return '';
    }
  };

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

  const handlePrint = () => {
    window.print();
  };

  // 画像として保存する機能（カメラロール/写真アプリに保存）
  const handleSaveAsImage = async () => {
    if (!resultContainerRef.current || isSavingImage) return;

    setIsSavingImage(true);

    try {
      // スクロール位置を保存
      const scrollY = window.scrollY;
      window.scrollTo(0, 0);

      // 少し待ってからキャプチャ
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(resultContainerRef.current, {
        backgroundColor: '#f3f4f6',
        scale: 2, // 高解像度
        useCORS: true,
        logging: false,
        windowWidth: resultContainerRef.current.scrollWidth,
        windowHeight: resultContainerRef.current.scrollHeight,
      });

      // スクロール位置を復元
      window.scrollTo(0, scrollY);

      // Blob に変換
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png', 1.0);
      });

      // ファイル名を生成
      const fileName = `脳卒中リスク評価結果_${new Date().toLocaleDateString('ja-JP').replace(/\//g, '-')}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // Web Share API でファイル共有（写真アプリに保存可能）
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: '脳卒中リスク評価結果',
            text: '結果を画像として保存'
          });
          setIsSavingImage(false);
          return;
        } catch (err: unknown) {
          // ユーザーがキャンセルした場合
          if (err instanceof Error && err.name === 'AbortError') {
            setIsSavingImage(false);
            return;
          }
          console.log('共有に失敗、フォールバックを使用');
        }
      }

      // フォールバック: 画像を新しいタブで開く（長押しで保存可能）
      const dataUrl = canvas.toDataURL('image/png');

      // iOSの場合は新しいウィンドウで画像を開く（長押しで保存できる）
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>脳卒中リスク評価結果</title>
              <style>
                body { margin: 0; padding: 20px; background: #f3f4f6; text-align: center; }
                img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                p { color: #374151; font-family: sans-serif; margin-top: 20px; font-size: 16px; }
              </style>
            </head>
            <body>
              <p>📱 画像を長押しして「写真に追加」を選択してください</p>
              <img src="${dataUrl}" alt="脳卒中リスク評価結果" />
            </body>
            </html>
          `);
          newWindow.document.close();
        }
      } else {
        // Androidの場合はダウンロード
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('画像をダウンロードしました。ダウンロードフォルダを確認してください。');
      }
    } catch (error) {
      console.error('画像保存エラー:', error);
      alert('画像の保存に失敗しました');
    } finally {
      setIsSavingImage(false);
    }
  };

  // スマホ用の共有機能（テキスト）
  const handleShare = async () => {
    if (!resultData) return;

    const shareText = `【脳卒中リスク評価結果】
10年間の発症確率: ${resultData.result.risk_probability}%
リスクレベル: ${getRiskLevelText(resultData.result.risk_level)}
合計スコア: ${resultData.result.total_score}点

評価日時: ${new Date().toLocaleString('ja-JP')}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '脳卒中リスク評価結果',
          text: shareText,
        });
      } catch (err) {
        console.log('共有がキャンセルされました');
      }
    } else {
      // Web Share APIが使えない場合はクリップボードにコピー
      try {
        await navigator.clipboard.writeText(shareText);
        alert('結果をクリップボードにコピーしました');
      } catch (err) {
        alert('コピーに失敗しました');
      }
    }
  };

  const handleRestart = () => {
    localStorage.removeItem('strokeCheckBasicInfo');
    localStorage.removeItem('strokeCheckResult');
    navigate('/');
  };

  return (
    <div className="container" ref={resultContainerRef}>
      <div className="result-header no-print">
        <Activity size={64} className="icon" />
        <h1>脳卒中リスク評価結果</h1>
      </div>

      {/* 印刷用ヘッダー */}
      <div className="print-only print-header">
        <h1>脳卒中リスク評価結果</h1>
        <div className="print-date">
          評価日: {new Date().toLocaleDateString('ja-JP')}
        </div>
      </div>

      {/* リスクサマリー */}
      <div className={`result-summary ${getRiskClassName(result.risk_level)}`}>
        <h2>{getRiskLevelText(result.risk_level)}</h2>
        <p style={{ fontSize: '1.5rem', margin: '1rem 0' }}>
          10年間の脳卒中発症確率: <strong>{result.risk_probability}%</strong>
        </p>
        <p>
          あなたの今後10年間で脳卒中を発症する確率は、
          {result.risk_probability}%と推定されます。
        </p>
      </div>

      {/* 循環器疾患リスク（コレステロール値がある場合） */}
      {circulatoryResult && (
        <div style={{ margin: '2rem 0', padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Heart size={32} style={{ color: '#ef4444' }} />
            <h2 style={{ margin: 0 }}>循環器疾患リスク評価</h2>
          </div>

          {/* 血管年齢 */}
          {circulatoryResult.vascular_age && (
            <div style={{ padding: '1.5rem', background: '#fef3c7', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#92400e' }}>推定血管年齢</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#92400e' }}>
                {circulatoryResult.vascular_age}歳
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '1.1rem', color: '#92400e' }}>
                実年齢との差: {circulatoryResult.age_difference && circulatoryResult.age_difference > 0 ? '+' : ''}
                {circulatoryResult.age_difference}歳
              </div>
            </div>
          )}

          {/* 3つの疾患リスク */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {/* 脳梗塞リスク */}
            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '2px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 1rem 0' }}>脳梗塞リスク</h4>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: getRiskLevelColor(circulatoryResult.cerebral_infarction.risk_level), marginBottom: '0.5rem' }}>
                {circulatoryResult.cerebral_infarction.risk_probability}%
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                {getRiskLevelText(circulatoryResult.cerebral_infarction.risk_level)}
              </div>
            </div>

            {/* 心筋梗塞リスク */}
            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '2px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 1rem 0' }}>心筋梗塞リスク</h4>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: getRiskLevelColor(circulatoryResult.myocardial_infarction.risk_level), marginBottom: '0.5rem' }}>
                {circulatoryResult.myocardial_infarction.risk_probability}%
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                {getRiskLevelText(circulatoryResult.myocardial_infarction.risk_level)}
              </div>
            </div>

            {/* 脳卒中全体リスク */}
            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '2px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 1rem 0' }}>脳卒中全体リスク</h4>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: getRiskLevelColor(circulatoryResult.total_stroke.risk_level), marginBottom: '0.5rem' }}>
                {circulatoryResult.total_stroke.risk_probability}%
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                {getRiskLevelText(circulatoryResult.total_stroke.risk_level)}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef3c7', borderRadius: '6px', fontSize: '0.9rem' }}>
            <strong>注意:</strong> 循環器疾患リスクの計算式は暫定値です。
            より正確な評価は国立がん研究センターの公式ツールをご利用ください。
          </div>
        </div>
      )}

      {/* 詳細情報 */}
      <div className="result-details">
        <section className="print-section">
          <h2>基本情報</h2>
          <table>
            <tbody>
              <tr>
                <th>お名前</th>
                <td>{basicInfo.name}</td>
              </tr>
              <tr>
                <th>年齢</th>
                <td>{basicInfo.age}歳</td>
              </tr>
              <tr>
                <th>性別</th>
                <td>{basicInfo.gender === 'male' ? '男性' : '女性'}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="print-section">
          <h2>入力データ</h2>
          <table>
            <tbody>
              <tr>
                <th>喫煙習慣</th>
                <td>{getSmokingText(input.smoking)}</td>
              </tr>
              <tr>
                <th>身長</th>
                <td>{input.height} cm</td>
              </tr>
              <tr>
                <th>体重</th>
                <td>{input.weight} kg</td>
              </tr>
              <tr>
                <th>BMI</th>
                <td>{result.bmi}</td>
              </tr>
              <tr>
                <th>血圧</th>
                <td>
                  {input.systolic_bp}/{input.diastolic_bp} mmHg
                </td>
              </tr>
              <tr>
                <th>降圧剤服用</th>
                <td>{input.on_bp_medication ? 'あり' : 'なし'}</td>
              </tr>
              <tr>
                <th>糖尿病</th>
                <td>{input.has_diabetes ? 'あり' : 'なし'}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="print-section">
          <h2>スコア詳細</h2>
          <table>
            <tbody>
              <tr>
                <th>年齢スコア</th>
                <td>{result.age_score} 点</td>
              </tr>
              <tr>
                <th>性別スコア</th>
                <td>{result.gender_score} 点</td>
              </tr>
              <tr>
                <th>喫煙スコア</th>
                <td>{result.smoking_score} 点</td>
              </tr>
              <tr>
                <th>BMIスコア</th>
                <td>{result.bmi_score} 点</td>
              </tr>
              <tr>
                <th>血圧スコア</th>
                <td>{result.bp_score} 点</td>
              </tr>
              <tr>
                <th>糖尿病スコア</th>
                <td>{result.diabetes_score} 点</td>
              </tr>
              <tr style={{ borderTop: '2px solid #000' }}>
                <th>合計スコア</th>
                <td>
                  <strong>{result.total_score} 点</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="print-section">
          <h2>リスクレベルの説明</h2>
          <ul>
            <li>
              <strong style={{ color: getRiskLevelColor('low') }}>低リスク</strong>: 発症確率
              5%未満
            </li>
            <li>
              <strong style={{ color: getRiskLevelColor('moderate') }}>
                中リスク
              </strong>
              : 発症確率 5%〜10%
            </li>
            <li>
              <strong style={{ color: getRiskLevelColor('high') }}>高リスク</strong>:
              発症確率 10%〜15%
            </li>
            <li>
              <strong style={{ color: getRiskLevelColor('very_high') }}>
                非常に高リスク
              </strong>
              : 発症確率 15%以上
            </li>
          </ul>
        </section>

        <section className="print-section">
          <h2>今後の対策</h2>
          <div className="note">
            <p>
              <strong>重要:</strong>{' '}
              この結果はあくまで統計的な推定値であり、医師の診断に代わるものではありません。
            </p>
          </div>
          <ul>
            <li>定期的に健康診断を受けましょう</li>
            <li>高血圧の場合は、医師の指導のもと適切に管理しましょう</li>
            <li>喫煙している場合は、禁煙を検討しましょう</li>
            <li>適度な運動と バランスの取れた食事を心がけましょう</li>
            <li>糖尿病の場合は、血糖値のコントロールを適切に行いましょう</li>
            <li>
              リスクが高い場合や健康上の不安がある場合は、医療機関を受診してください
            </li>
          </ul>
        </section>

        <div className="print-only print-footer">
          <p>この結果は統計的な推定値であり、医師の診断に代わるものではありません。</p>
          <p>出典: JPHC研究（国立がん研究センター）</p>
        </div>
      </div>

      <div className="result-actions no-print" style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '0.75rem',
        marginTop: '1.5rem'
      }}>
        {isMobile ? (
          <>
            <button
              className="btn-primary"
              onClick={handleSaveAsImage}
              disabled={isSavingImage}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1rem',
                fontSize: '1rem',
                width: '100%',
                backgroundColor: '#10b981'
              }}
            >
              <Camera size={20} />
              {isSavingImage ? '保存中...' : '画像として保存'}
            </button>
            <button
              className="btn-primary"
              onClick={handleShare}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1rem',
                fontSize: '1rem',
                width: '100%'
              }}
            >
              <Share2 size={20} />
              テキストで共有
            </button>
            <button
              className="btn-secondary"
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1rem',
                fontSize: '1rem',
                width: '100%'
              }}
            >
              <Printer size={20} />
              印刷 / PDF保存
            </button>
            <button
              className="btn-secondary"
              onClick={handleRestart}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1rem',
                fontSize: '1rem',
                width: '100%'
              }}
            >
              <Home size={20} />
              最初に戻る
            </button>
          </>
        ) : (
          <>
            <button className="btn-secondary" onClick={handlePrint}>
              <Printer size={20} />
              結果を印刷
            </button>
            <button className="btn-primary" onClick={handleRestart}>
              <Home size={20} />
              最初に戻る
            </button>
          </>
        )}
      </div>
    </div>
  );
}
