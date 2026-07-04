# HRMS Quick Start Script (SQLite Version)
# Run from: OdooHackathon\ directory
# Usage: .\start.ps1

Write-Host "🚀 Starting HRMS (SQLite Edition)..." -ForegroundColor Cyan

# Check if schema.prisma is configured for PostgreSQL
$schemaPath = "server\prisma\schema.prisma"
$schemaContent = Get-Content $schemaPath -Raw
$isPostgres = $schemaContent -match 'provider\s*=\s*"postgresql"'

$envPath = "server\.env"
$envContent = Get-Content $envPath -Raw

if ($isPostgres) {
  Write-Host "🗄️  PostgreSQL detected in schema.prisma, keeping PostgreSQL DATABASE_URL" -ForegroundColor Cyan
} else {
  if ($envContent -notmatch 'DATABASE_URL=.*sqlite') {
    $envContent = $envContent -replace 'DATABASE_URL=.*', 'DATABASE_URL="file:./dev.db"'
    Set-Content $envPath $envContent
    Write-Host "✅ .env updated to SQLite" -ForegroundColor Green
  }
}


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
