# 一键删除并重新配置SMTP环境变量脚本
# 使用方法：在PowerShell中运行：.\一键删除并添加环境变量.ps1

Write-Host "=== 删除并重新配置SMTP环境变量 ===" -ForegroundColor Cyan
Write-Host ""

# 检查是否在正确的目录
if (-not (Test-Path "package.json")) {
    Write-Host "❌ 错误：请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 检查是否已登录Vercel
Write-Host "检查Vercel登录状态..." -ForegroundColor Yellow
$vercelCheck = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 未登录Vercel，请先运行：vercel login" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 已登录Vercel" -ForegroundColor Green
Write-Host ""

# 配置信息
$email = "2330304961@qq.com"
$passcode = "bwzqgvsfgehwdjde"
$smtpHost = "smtp.qq.com"
$smtpPort = "587"  # 改为587端口（STARTTLS）

Write-Host "新配置信息：" -ForegroundColor Cyan
Write-Host "  SMTP_HOST: $smtpHost"
Write-Host "  SMTP_PORT: $smtpPort (STARTTLS)"
Write-Host "  SMTP_USER: $email"
Write-Host "  SMTP_PASS: $passcode"
Write-Host "  RECIPIENT_EMAIL: $email"
Write-Host ""

# 确认删除
Write-Host "⚠️  警告：这将删除所有SMTP相关的环境变量！" -ForegroundColor Yellow
$confirm = Read-Host "是否继续？(y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "已取消" -ForegroundColor Yellow
    exit 0
}

# 要删除的变量列表
$varsToDelete = @("SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "RECIPIENT_EMAIL")
$environments = @("production", "preview", "development")

# 删除旧环境变量
Write-Host ""
Write-Host "步骤1：删除旧的环境变量..." -ForegroundColor Cyan
foreach ($var in $varsToDelete) {
    foreach ($env in $environments) {
        Write-Host "  删除 $var ($env)..." -ForegroundColor Gray
        vercel env rm $var $env --yes 2>&1 | Out-Null
    }
}
Write-Host "✅ 旧环境变量已删除" -ForegroundColor Green
Write-Host ""

# 添加新环境变量
Write-Host "步骤2：添加新的环境变量..." -ForegroundColor Cyan

# SMTP_HOST
Write-Host "  添加 SMTP_HOST..." -ForegroundColor Gray
foreach ($env in $environments) {
    echo $smtpHost | vercel env add SMTP_HOST $env --force 2>&1 | Out-Null
}

# SMTP_PORT（改为587）
Write-Host "  添加 SMTP_PORT (587)..." -ForegroundColor Gray
foreach ($env in $environments) {
    echo $smtpPort | vercel env add SMTP_PORT $env --force 2>&1 | Out-Null
}

# SMTP_USER
Write-Host "  添加 SMTP_USER..." -ForegroundColor Gray
foreach ($env in $environments) {
    echo $email | vercel env add SMTP_USER $env --force 2>&1 | Out-Null
}

# SMTP_PASS
Write-Host "  添加 SMTP_PASS..." -ForegroundColor Gray
foreach ($env in $environments) {
    echo $passcode | vercel env add SMTP_PASS $env --force 2>&1 | Out-Null
}

# RECIPIENT_EMAIL
Write-Host "  添加 RECIPIENT_EMAIL..." -ForegroundColor Gray
foreach ($env in $environments) {
    echo $email | vercel env add RECIPIENT_EMAIL $env --force 2>&1 | Out-Null
}

Write-Host "✅ 新环境变量已添加" -ForegroundColor Green
Write-Host ""

# 验证配置
Write-Host "步骤3：验证配置..." -ForegroundColor Cyan
Write-Host ""
vercel env ls | Select-String -Pattern "SMTP|RECIPIENT" | ForEach-Object {
    Write-Host $_ -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ 环境变量配置完成！" -ForegroundColor Green
Write-Host ""
Write-Host "下一步：" -ForegroundColor Cyan
Write-Host "1. 访问 Vercel 项目页面重新部署"
Write-Host "2. 或运行：git push origin main（触发自动部署）"
Write-Host ""
Write-Host "访问项目：https://vercel.com/duliangkuans-projects/liwu" -ForegroundColor Cyan
Write-Host ""

