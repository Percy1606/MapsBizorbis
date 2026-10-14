@echo off
title Conectando a Servidor VPS (percy@161.132.45.230)
cls
echo ========================================================
echo   CONEXION DIRECTA AL SERVIDOR VPS (Usuario: percy)
echo   IP: 161.132.45.230
echo ========================================================
echo.

set KEY_PATH=%USERPROFILE%\.ssh\bizorbis_key

if exist "%KEY_PATH%" (
    echo Autenticando mediante clave SSH...
    ssh -i "%KEY_PATH%" -o StrictHostKeyChecking=no percy@161.132.45.230
) else (
    echo Clave privada no encontrada en %KEY_PATH%.
    echo Conectando por contrasena...
    ssh -o StrictHostKeyChecking=no percy@161.132.45.230
)

echo.
echo ========================================================
echo Sesion finalizada.
echo ========================================================
pause
