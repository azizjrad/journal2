# Start Stripe Webhook Forwarding
# This script will forward Stripe webhooks to your localhost

Write-Host "`n🚀 Starting Stripe Webhook Forwarding..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

Write-Host "`n📋 Instructions:" -ForegroundColor Yellow
Write-Host "1. Keep this terminal window OPEN" -ForegroundColor White
Write-Host "2. Copy the webhook secret (whsec_...)" -ForegroundColor White
Write-Host "3. Update STRIPE_WEBHOOK_SECRET in .env.local" -ForegroundColor White
Write-Host "4. Restart your Next.js dev server (npm run dev)" -ForegroundColor White
Write-Host "5. Test a subscription!" -ForegroundColor White

Write-Host "`n🔄 Forwarding webhooks to: localhost:3000/api/newsletter/webhook" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# Start Stripe webhook forwarding
stripe listen --forward-to localhost:3000/api/newsletter/webhook
