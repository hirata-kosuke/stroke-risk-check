@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo 環境チェック
echo ========================================
echo.

REM Git インストール確認
echo [1/3] Git インストール確認...
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git がインストールされていません
    echo.
    echo Git をインストールしてください:
    echo https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
) else (
    git --version
    echo ✓ Git がインストールされています
)

echo.

REM Git ユーザー設定確認
echo [2/3] Git ユーザー設定確認...
git config user.name >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Git ユーザー名が未設定です
    echo.
    set /p username="Git ユーザー名を入力してください: "
    git config --global user.name "%username%"
    echo ✓ ユーザー名を設定しました: %username%
) else (
    for /f "delims=" %%i in ('git config user.name') do set gituser=%%i
    echo ✓ ユーザー名: !gituser!
)

git config user.email >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Git メールアドレスが未設定です
    echo.
    set /p email="Git メールアドレスを入力してください: "
    git config --global user.email "%email%"
    echo ✓ メールアドレスを設定しました: %email%
) else (
    for /f "delims=" %%i in ('git config user.email') do set gitemail=%%i
    echo ✓ メールアドレス: !gitemail!
)

echo.

REM Node.js インストール確認
echo [3/3] Node.js インストール確認...
node --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Node.js がインストールされていません
    echo.
    echo Node.js をインストールすると、ローカルで開発できます:
    echo https://nodejs.org/
) else (
    node --version
    npm --version
    echo ✓ Node.js がインストールされています
)

echo.
echo ========================================
echo ✓ 環境チェック完了
echo ========================================
echo.
echo これで setup_git.bat を実行できます
echo.

pause
