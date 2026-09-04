@echo off
cd /d "%~dp0"
start "" "http://127.0.0.1:8765/dashboard/s3.html#lessons"
where npx >nul 2>&1
if errorlevel 1 (
  echo npx not found. Open the URL above after starting the server.
  pause
  exit /b 1
)
echo Serving full GitHub clone at http://127.0.0.1:8765/dashboard/s3.html#lessons
echo Keep this window open.
npx --yes serve -l 8765 --no-port-switching .
