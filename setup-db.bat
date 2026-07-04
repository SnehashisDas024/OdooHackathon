@echo off
REM Run this after PostgreSQL installer finishes
REM Double-click or run from OdooHackathon directory

echo ============================================
echo   HRMS Database Setup
echo ============================================
echo.
echo Step 1: Enter your PostgreSQL password when prompted
echo.

set PGPATH=C:\Program Files\PostgreSQL\17\bin
set PATH=%PGPATH%;%PATH%

REM Create DB (may fail if already exists - that's ok)
"%PGPATH%\psql.exe" -U postgres -c "CREATE DATABASE hrms_db;" 2>nul
echo.
echo Database created (or already exists).
echo.
echo Step 2: Update server\.env with your password
echo   Open server\.env and change:
echo   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/hrms_db
echo.
pause
echo.
echo Step 3: Pushing Prisma schema...
cd server
call npx prisma db push --accept-data-loss
echo.
echo Step 4: Seeding demo data...
call node prisma/seed.js
cd ..
echo.
echo ============================================
echo   DONE! Now run the app:
echo.
echo   Terminal 1: cd server ^&^& npm run dev
echo   Terminal 2: cd client ^&^& npm run dev
echo.
echo   Open: http://localhost:3000
echo ============================================
pause
