@echo off
echo.
echo ==========================================
echo   AURUM NUMEROS - Deploy a Fly.io
echo ==========================================
echo.

cd /d "C:\Users\susecomp\Desktop\Lotto-Fortune-Finder"

echo [1/4] Creando volumen en region dfw (Dallas)...
flyctl volumes create aurum_data --region dfw --size 1 --app app-shy-dust-7250 --yes

echo.
echo [2/4] Configurando clave secreta...
flyctl secrets set SESSION_SECRET=clave-aurum-secreta-2025 --app app-shy-dust-7250

echo.
echo [3/4] Desplegando...
flyctl deploy --app app-shy-dust-7250

echo.
echo ==========================================
echo   Listo! Abre: https://app-shy-dust-7250.fly.dev
echo ==========================================
pause
