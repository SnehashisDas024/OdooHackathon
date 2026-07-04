# HRMS Quick Start Script
# Run from: OdooHackathon\ directory
# Usage: .\start.ps1

Write-Host "🚀 Starting HRMS..." -ForegroundColor Cyan

# Add PostgreSQL to PATH for this session
$env:Path += ";C:\Program Files\PostgreSQL\17\bin"

# Check PostgreSQL password
$pgPassword = Read-Host "Enter your PostgreSQL 'postgres' user password" -AsSecureString
$plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
  [Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword)
)
$env:PGPASSWORD = $plain

# Create database if it doesn't exist
Write-Host "📦 Creating hrms_db database..." -ForegroundColor Yellow
& psql -U postgres -c "CREATE DATABASE hrms_db;" 2>&1 | Out-Null
Write-Host "✅ Database ready" -ForegroundColor Green

# Update server .env with correct password
$envPath = "server\.env"
$envContent = Get-Content $envPath -Raw
$envContent = $envContent -replace 'DATABASE_URL=.*', "DATABASE_URL=postgresql://postgres:$plain@localhost:5432/hrms_db"
Set-Content $envPath $envContent
Write-Host "✅ .env updated" -ForegroundColor Green

# Run Prisma migrations
Write-Host "🗄️  Pushing schema to database..." -ForegroundColor Yellow
Set-Location server
& npx prisma db push --accept-data-loss 2>&1
Write-Host "✅ Schema pushed" -ForegroundColor Green

# Seed the database
Write-Host "🌱 Seeding demo data..." -ForegroundColor Yellow
& node prisma/seed.js
Write-Host "✅ Database seeded" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "✅ Setup complete! Starting servers..." -ForegroundColor Green
Write-Host ""
Write-Host "Demo accounts:" -ForegroundColor Cyan
Write-Host "  👑 Admin   : admin@hrms.com / Admin@1234"
Write-Host "  👤 Employee: arjun.sharma@hrms.com / Employee@1234"
Write-Host ""

# Start backend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\server'; npm run dev" -WindowStyle Normal

# Wait for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "🌐 Starting frontend at http://localhost:3000" -ForegroundColor Cyan
Set-Location client
npm run dev
