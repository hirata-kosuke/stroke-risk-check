@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo GitHub へのプッシュ
echo.

REM コミットメッセージを入力
set /p commit_msg="コミットメッセージを入力してください: "

if "%commit_msg%"=="" (
    echo エラー: コミットメッセージが空です
    pause
    exit /b 1
)

echo.
echo ファイルをステージングしています...
git add .
if errorlevel 1 (
    echo エラー: ステージングに失敗しました
    pause
    exit /b 1
)

echo コミットを作成しています...
git commit -m "%commit_msg%"
if errorlevel 1 (
    echo 注意: コミットできませんでした（変更がない可能性があります）
)

echo GitHub にプッシュしています...
git push
if errorlevel 1 (
    echo エラー: プッシュに失敗しました
    echo.
    echo 初回プッシュの場合は以下を実行してください:
    echo git remote add origin https://github.com/YOUR_USERNAME/stroke-risk-check.git
    echo git branch -M main
    echo git push -u origin main
    pause
    exit /b 1
)

echo.
echo ✓ プッシュが完了しました
echo Vercel が自動的にデプロイを開始します（約2分）
echo.

pause
