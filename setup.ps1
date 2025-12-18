# 🚀 Quick Setup Script for TrackerForURewards

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "TrackerForURewards Setup Helper" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
} else {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    
    Write-Host ""
    Write-Host "Please provide your Supabase credentials:" -ForegroundColor Cyan
    Write-Host "(You can find these in your Supabase project dashboard under Settings > API)" -ForegroundColor Gray
    Write-Host ""
    
    $supabaseUrl = Read-Host "Enter your Supabase Project URL (e.g., https://xxxxx.supabase.co)"
    $supabaseKey = Read-Host "Enter your Supabase Anon Key"
    
    $envContent = @"
VITE_SUPABASE_URL=$supabaseUrl
VITE_SUPABASE_ANON_KEY=$supabaseKey
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "✓ .env file created successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Make sure you have a Supabase project created at https://supabase.com" -ForegroundColor Yellow
Write-Host "2. Run the database migration:" -ForegroundColor Yellow
Write-Host "   - Go to your Supabase dashboard" -ForegroundColor Gray
Write-Host "   - Click 'SQL Editor' in the sidebar" -ForegroundColor Gray
Write-Host "   - Click 'New Query'" -ForegroundColor Gray
Write-Host "   - Copy contents from: supabase/migrations/20251218104210_create_issue_tracker_schema.sql" -ForegroundColor Gray
Write-Host "   - Paste and click 'Run'" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start the development server:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Green
Write-Host ""
Write-Host "For detailed instructions, see SETUP.md" -ForegroundColor Cyan
Write-Host ""
