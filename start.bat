@echo off
echo ========================================
echo    TailTales RPG - Запуск приложения
echo ========================================
echo.

echo Установка зависимостей...
call npm run install-all

echo.
echo Инициализация базы данных...
call npm run init-db

echo.
echo Запуск приложения...
call npm run dev

pause

