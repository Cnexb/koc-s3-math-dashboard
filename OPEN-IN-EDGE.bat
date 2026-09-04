@echo off
setlocal
cd /d "%~dp0"
set "URL=http://127.0.0.1:8770/dashboard/s3.html#lessons"
set "PY=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
if not exist "%PY%" set "PY=python"
set KOC_PORT=8770
echo Starting full local dashboard server on port 8770...
start "KOC-S3-Server" /min cmd /c "set KOC_PORT=8770&& \"%PY%\" \"%~dp0local_server.py\""
set /a n=0
:WAIT
set /a n+=1
powershell -NoProfile -Command "try { $r=Invoke-WebRequest -Uri 'http://127.0.0.1:8770/dashboard/s3.html' -UseBasicParsing -TimeoutSec 2; if($r.StatusCode -eq 200 -and $r.Content -match 'S3 Lessons'){exit 0}; exit 1 } catch { exit 1 }"
if %errorlevel%==0 goto OPEN
if %n% geq 25 ( echo Could not start server. & pause & exit /b 1 )
timeout /t 1 /nobreak >nul
goto WAIT
:OPEN
start msedge "%URL%"
exit /b 0
