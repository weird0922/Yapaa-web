@echo off
cd /d "%~dp0"
where npm.cmd >nul 2>&1
if errorlevel 1 (
  echo Instala Node.js antes de iniciar YAPAA Web.
  pause
  exit /b 1
)
call npm.cmd ci
if errorlevel 1 goto error
echo Abre http://localhost:4200/login cuando Angular termine de iniciar.
call npm.cmd start
if errorlevel 1 goto error
exit /b 0
:error
pause
exit /b 1
