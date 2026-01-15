/**
 * Google Apps Script - 脳卒中リスクチェック データ受信API
 *
 * セットアップ手順:
 * 1. Googleスプレッドシートを作成
 * 2. 拡張機能 > Apps Script でこのコードを貼り付け
 * 3. デプロイ > 新しいデプロイ > ウェブアプリ
 * 4. アクセス権限: 「全員」
 * 5. デプロイURLをReactアプリの環境変数に設定
 */

/**
 * POSTリクエストを受け取る関数
 */
function doPost(e) {
  try {
    // リクエストボディをパース
    var data = JSON.parse(e.postData.contents);

    // スプレッドシートに保存
    saveToSheet(data);

    // 成功レスポンス
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'データを保存しました'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // エラーレスポンス
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * GETリクエスト（テスト用）
 */
function doGet(e) {
  return ContentService
    .createTextOutput('脳卒中リスクチェック データ受信API v1.0')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * スプレッドシートにデータを保存
 */
function saveToSheet(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('リスクチェックデータ');

  // シートが存在しない場合は作成
  if (!sheet) {
    sheet = ss.insertSheet('リスクチェックデータ');
    // ヘッダー行を追加
    sheet.appendRow([
      'タイムスタンプ',
      '名前',
      '年齢',
      '性別',
      '喫煙習慣',
      '身長(cm)',
      '体重(kg)',
      'BMI',
      '収縮期血圧',
      '拡張期血圧',
      '降圧剤服用',
      '糖尿病',
      'HDLコレステロール',
      'LDLコレステロール',
      '総コレステロール',
      '中性脂肪',
      '合計スコア',
      '発症確率(%)',
      'リスクレベル',
      '年齢スコア',
      '性別スコア',
      '喫煙スコア',
      'BMIスコア',
      '血圧スコア',
      '糖尿病スコア',
      '脳梗塞リスク(%)',
      '心筋梗塞リスク(%)',
      '脳卒中全体リスク(%)',
      '血管年齢',
      '実年齢との差'
    ]);

    // ヘッダー行をフォーマット
    var headerRange = sheet.getRange(1, 1, 1, 30);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
  }

  // データ行を追加
  var row = [
    new Date(), // タイムスタンプ
    data.basicInfo.name,
    data.basicInfo.age,
    data.basicInfo.gender === 'male' ? '男性' : '女性',
    getSmokingText(data.input.smoking),
    data.input.height,
    data.input.weight,
    data.result.bmi,
    data.input.systolic_bp,
    data.input.diastolic_bp,
    data.input.on_bp_medication ? 'あり' : 'なし',
    data.input.has_diabetes ? 'あり' : 'なし',
    data.input.hdl_cholesterol || '',
    data.input.ldl_cholesterol || '',
    data.input.total_cholesterol || '',
    data.input.triglycerides || '',
    data.result.total_score,
    data.result.risk_probability,
    getRiskLevelText(data.result.risk_level),
    data.result.age_score,
    data.result.gender_score,
    data.result.smoking_score,
    data.result.bmi_score,
    data.result.bp_score,
    data.result.diabetes_score,
    data.circulatoryResult ? data.circulatoryResult.cerebral_infarction.risk_probability : '',
    data.circulatoryResult ? data.circulatoryResult.myocardial_infarction.risk_probability : '',
    data.circulatoryResult ? data.circulatoryResult.total_stroke.risk_probability : '',
    data.circulatoryResult ? data.circulatoryResult.vascular_age : '',
    data.circulatoryResult ? data.circulatoryResult.age_difference : ''
  ];

  sheet.appendRow(row);

  // 自動でカラム幅を調整
  sheet.autoResizeColumns(1, 30);
}

/**
 * 喫煙習慣のテキスト変換
 */
function getSmokingText(smoking) {
  switch (smoking) {
    case 'never': return '吸わない';
    case 'past': return '過去に吸っていた';
    case 'current': return '現在吸っている';
    default: return '';
  }
}

/**
 * リスクレベルのテキスト変換
 */
function getRiskLevelText(level) {
  switch (level) {
    case 'low': return '低リスク';
    case 'moderate': return '中リスク';
    case 'high': return '高リスク';
    case 'very_high': return '非常に高リスク';
    default: return '';
  }
}
