/**
 * Google Sheets データ送信ユーティリティ
 */

const GOOGLE_APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '';

export interface SheetData {
  basicInfo: {
    name: string;
    age: string;
    gender: 'male' | 'female';
  };
  input: any;
  result: any;
  circulatoryResult: any;
}

/**
 * Google スプレッドシートにデータを送信
 */
export async function sendToGoogleSheets(data: SheetData): Promise<void> {
  // URLが設定されていない場合はスキップ
  if (!GOOGLE_APPS_SCRIPT_URL) {
    console.log('Google Sheets URL not configured. Skipping data export.');
    return;
  }

  try {
    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      mode: 'no-cors', // Google Apps Script requires no-cors
    });

    console.log('Data sent to Google Sheets successfully');
  } catch (error) {
    console.error('Failed to send data to Google Sheets:', error);
    // エラーが発生してもアプリの動作は継続
  }
}
