@echo off
chcp 65001 >nul
echo ========================================
echo   TESTE COMPLETO - PROFITSCAN + BLINDAGEM
echo   (Simula compra com orderbump)
echo ========================================
echo.

set /p EMAIL=Digite o email de teste: 
set /p NOME=Digite o nome completo: 

echo.
echo [1/2] Enviando webhook ProfitScan...
echo.

curl -X POST http://localhost:3000/api/webhooks/profitscan ^
  -H "Content-Type: application/json" ^
  -d "{\"event\":\"order.paid\",\"order\":{\"id\":%RANDOM%%RANDOM%,\"email\":\"%EMAIL%\",\"phone\":\"11999999999\",\"total_price\":\"46.90\",\"payment_type\":\"pix\",\"payment_status\":1,\"customer\":{\"id\":123,\"first_name\":\"%NOME%\",\"last_name\":\"\",\"email\":\"%EMAIL%\",\"phone\":\"11999999999\",\"cpf\":\"12345678901\",\"full_name\":\"%NOME%\"},\"line_items\":[{\"id\":1,\"product_id\":999,\"title\":\"ProfitScan AI\",\"price\":19.90,\"quantity\":1},{\"id\":2,\"product_id\":888,\"title\":\"Blindagem de Reputacao\",\"price\":27.00,\"quantity\":1}]}}"

echo.
echo.
echo [2/2] Enviando webhook Blindagem...
echo.

curl -X POST http://localhost:3000/api/webhooks/blindagem ^
  -H "Content-Type: application/json" ^
  -d "{\"event\":\"order.paid\",\"order\":{\"id\":%RANDOM%%RANDOM%,\"email\":\"%EMAIL%\",\"phone\":\"11999999999\",\"total_price\":\"27.00\",\"payment_type\":\"pix\",\"payment_status\":1,\"customer\":{\"id\":123,\"first_name\":\"%NOME%\",\"last_name\":\"\",\"email\":\"%EMAIL%\",\"phone\":\"11999999999\",\"cpf\":\"12345678901\",\"full_name\":\"%NOME%\"},\"line_items\":[{\"id\":1,\"product_id\":888,\"title\":\"Blindagem de Reputacao\",\"price\":27.00,\"quantity\":1}]}}"

echo.
echo.
echo ========================================
echo   TESTE COMPLETO!
echo   Usuario: %EMAIL%
echo   Produtos: ProfitScan AI + Blindagem
echo ========================================
echo.
echo Verifique:
echo  - Supabase Auth: usuario criado
echo  - Tabela orders: pedido salvo
echo  - Tabela user_access: acesso ProfitScan
echo  - Tabela reputation_access: acesso Blindagem
echo  - Console do servidor: credenciais geradas
echo.
pause
