@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo Git リポジトリのセットアップ
echo ========================================
echo.

REM nul ファイルを削除（Windows特有の問題回避）
if exist nul (
    echo [1/5] nul ファイルを削除しています...
    del /F /Q nul 2>nul
) else (
    echo [1/5] nul ファイルは存在しません（正常）
)

REM Git 初期化
echo [2/5] Git リポジトリを初期化しています...
if exist .git (
    echo 既に Git リポジトリが存在します
) else (
    git init
    if errorlevel 1 (
        echo.
        echo [ERROR] Git の初期化に失敗しました
        echo Git がインストールされているか確認してください
        echo.
        pause
        exit /b 1
    )
    echo Git リポジトリを作成しました
)

REM 改行コード設定
echo [3/5] Git 設定を行っています...
git config core.autocrlf true
git config user.name >nul 2>&1
if errorlevel 1 (
    echo.
    echo [WARNING] Git のユーザー名が設定されていません
    echo 以下のコマンドで設定してください:
    echo   git config --global user.name "Your Name"
    echo   git config --global user.email "your.email@example.com"
    echo.
)

REM ステージング
echo [4/5] ファイルをステージングしています...
git add . 2>error.log
if errorlevel 1 (
    echo.
    echo [ERROR] ファイルのステージングに失敗しました
    type error.log
    del error.log
    echo.
    pause
    exit /b 1
)
if exist error.log del error.log
echo すべてのファイルをステージングしました

REM 初回コミット
echo [5/5] 初回コミットを作成しています...
git commit -m "Initial commit: 脳卒中リスクチェックアプリ" >nul 2>&1
if errorlevel 1 (
    REM コミットが失敗した場合（変更がない、またはユーザー情報未設定）
    git status | findstr "nothing to commit" >nul
    if not errorlevel 1 (
        echo 既にコミット済みです（変更がありません）
    ) else (
        echo.
        echo [WARNING] コミットに失敗しました
        echo Git のユーザー情報が設定されていない可能性があります
        echo.
        echo 以下を実行してから再度お試しください:
        echo   git config --global user.name "Your Name"
        echo   git config --global user.email "your.email@example.com"
        echo.
        pause
        exit /b 1
    )
) else (
    echo 初回コミットを作成しました
)

echo.
echo ========================================
echo ✓ Git セットアップが完了しました
echo ========================================
echo.
echo 次のステップ:
echo.
echo 【1】 GitHub で新しいリポジトリを作成
echo      https://github.com/new
echo      リポジトリ名: stroke-risk-check
echo.
echo 【2】 以下のコマンドを実行（YOUR_USERNAME は自分のユーザー名に置き換え）
echo      git remote add origin https://github.com/YOUR_USERNAME/stroke-risk-check.git
echo      git branch -M main
echo      git push -u origin main
echo.
echo 【3】 その後、Vercel でデプロイ
echo      https://vercel.com
echo.

pause
