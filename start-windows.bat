@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Chua tim thay Node.js. Hay cai Node.js LTS truoc.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Dang cai thu vien...
  call npm install
  if errorlevel 1 (echo Loi cai thu vien & pause & exit /b 1)
)
echo Mo website tai dia chi Vite hien thi ben duoi.
call npm run dev
pause
