@echo off
chcp 65001 >nul
echo ========================================
echo   TESTE WEBHOOK - PROFITSCAN AI
echo ========================================
echo.

set /p EMAIL=Digite o email de teste: 
set /p NOME=Digite o nome completo: 

echo.
echo Testando webhook ProfitScan...
echo URL: http://localhost:3000/api/webhooks/profitscan
echo.

curl -X POST http://localhost:3000/api/webhooks/profitscan ^
  -H "Content-Type: application/json" ^
  -d "{\"event\":\"order.paid\",\"order\":{\"id\":%RANDOM%%RANDOM%,\"email\":\"%EMAIL%\",\"phone\":\"11999999999\",\"total_price\":\"19.90\",\"payment_type\":\"pix\",\"payment_status\":1,\"customer\":{\"id\":123,\"first_name\":\"%NOME%\",\"last_name\":\"\",\"email\":\"%EMAIL%\",\"phone\":\"11999999999\",\"cpf\":\"12345678901\",\"full_name\":\"%NOME%\"},\"line_items\":[{\"id\":1,\"product_id\":999,\"title\":\"ProfitScan AI - Acesso Vitalicio\",\"price\":19.90,\"quantity\":1}]}}"

echo.
echo.
echo ========================================
echo   RESULTADO ACIMA
echo ========================================
echo.
pause
