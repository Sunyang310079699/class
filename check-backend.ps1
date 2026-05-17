Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "检查后端服务状态" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 等待服务启动
Write-Host "等待服务启动..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 测试健康检查接口
Write-Host "测试健康检查接口..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get -ErrorAction Stop
    Write-Host "✓ 后端服务启动成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "响应数据:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 3
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "服务信息" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "服务地址: http://localhost:3000" -ForegroundColor White
    Write-Host "健康检查: http://localhost:3000/api/health" -ForegroundColor White
    Write-Host "API 文档: 查看 docs/backend/API.md" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "✗ 无法连接到后端服务" -ForegroundColor Red
    Write-Host "错误信息: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "请检查:" -ForegroundColor Yellow
    Write-Host "1. MongoDB 是否正在运行" -ForegroundColor White
    Write-Host "2. 端口 3000 是否被占用" -ForegroundColor White
    Write-Host "3. 查看控制台错误信息" -ForegroundColor White
}




