# 一键删除旧环境变量、添加新配置并触发重新部署
# 使用方法：在PowerShell中运行：.\一键更新部署.ps1

Write-Host "=== 一键更新SMTP环境变量并重新部署 ===" -ForegroundColor Cyan
Write-Host ""

# 检查是否在正确的目录
if (-not (Test-Path "package.json")) {
    Write-Host "❌ 错误：请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 检查是否已登录Vercel
Write-Host "检查Vercel登录状态..." -ForegroundColor Yellow
$vercelWhoAmI = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 未登录Vercel，请先运行：vercel login" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 已登录Vercel: $($vercelWhoAmI -split "`n" | Select-Object -Last 1)" -ForegroundColor Green
Write-Host ""

# 配置信息
$email = "2330304961@qq.com"
$passcode = "bwzqgvsfgehwdjde"
$smtpHost = "smtp.qq.com"
$smtpPort = "587"

Write-Host "新配置信息：" -ForegroundColor Cyan
Write-Host "  SMTP_HOST: $smtpHost"
Write-Host "  SMTP_PORT: $smtpPort (STARTTLS)"
Write-Host "  SMTP_USER: $email"
Write-Host "  SMTP_PASS: $passcode"
Write-Host "  RECIPIENT_EMAIL: $email"
Write-Host ""

# 确认操作
Write-Host "⚠️  警告：这将删除所有SMTP相关的环境变量并重新添加！" -ForegroundColor Yellow
$confirm = Read-Host "是否继续？(y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "已取消" -ForegroundColor Yellow
    exit 0
}

# 要删除的变量列表
$varsToDelete = @("SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "RECIPIENT_EMAIL")
$environments = @("production", "preview", "development")

# 步骤1：删除旧环境变量
Write-Host ""
Write-Host "步骤1：删除旧的环境变量..." -ForegroundColor Cyan
foreach ($var in $varsToDelete) {
    foreach ($env in $environments) {
        Write-Host "  删除 $var ($env)..." -ForegroundColor Gray -NoNewline
        $result = vercel env rm $var $env --yes 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅" -ForegroundColor Green
        } else {
            Write-Host " ⚠️ (可能不存在)" -ForegroundColor Yellow
        }
    }
}
Write-Host "✅ 旧环境变量删除完成" -ForegroundColor Green
Write-Host ""

# 步骤2：添加新环境变量
Write-Host "步骤2：添加新的环境变量..." -ForegroundColor Cyan

function Add-VercelEnv {
    param($VarName, $Value, $Env)
    Write-Host "  添加 ${VarName} ($Env)..." -ForegroundColor Gray -NoNewline
    echo $Value | vercel env add $VarName $Env --force 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅" -ForegroundColor Green
    } else {
        Write-Host " ❌" -ForegroundColor Red
    }
}

# SMTP_HOST
foreach ($env in $environments) {
    Add-VercelEnv "SMTP_HOST" $smtpHost $env
}

# SMTP_PORT
foreach ($env in $environments) {
    Add-VercelEnv "SMTP_PORT" $smtpPort $env
}

# SMTP_USER
foreach ($env in $environments) {
    Add-VercelEnv "SMTP_USER" $email $env
}

# SMTP_PASS
foreach ($env in $environments) {
    Add-VercelEnv "SMTP_PASS" $passcode $env
}

# RECIPIENT_EMAIL
foreach ($env in $environments) {
    Add-VercelEnv "RECIPIENT_EMAIL" $email $env
}

Write-Host "✅ 新环境变量添加完成" -ForegroundColor Green
Write-Host ""

# 步骤3：验证配置
Write-Host "步骤3：验证配置..." -ForegroundColor Cyan
Write-Host ""
$envList = vercel env ls 2>&1
if ($LASTEXITCODE -eq 0) {
    $smtpVars = $envList | Select-String -Pattern "SMTP|RECIPIENT"
    if ($smtpVars) {
        Write-Host "当前配置的环境变量：" -ForegroundColor Cyan
        $smtpVars | ForEach-Object {
            Write-Host "  $_" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️  未找到SMTP相关环境变量" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  无法获取环境变量列表" -ForegroundColor Yellow
}
Write-Host ""

# 步骤4：触发重新部署
Write-Host "步骤4：触发重新部署..." -ForegroundColor Cyan
Write-Host ""
Write-Host "选项：" -ForegroundColor Yellow
Write-Host "1. 推送代码到GitHub（自动触发部署）"
Write-Host "2. 使用Vercel CLI重新部署"
Write-Host "3. 跳过（稍后手动部署）"
Write-Host ""
$deployChoice = Read-Host "选择部署方式 (1/2/3)"

if ($deployChoice -eq "1") {
    Write-Host ""
    Write-Host "推送代码到GitHub..." -ForegroundColor Cyan
    git add .
    git commit --allow-empty -m "chore: Update SMTP configuration to use port 587 (STARTTLS)"
    git push origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 代码已推送到GitHub，Vercel将自动部署" -ForegroundColor Green
    } else {
        Write-Host "❌ 推送失败，请手动推送" -ForegroundColor Red
    }
} elseif ($deployChoice -eq "2") {
    Write-Host ""
    Write-Host "使用Vercel CLI重新部署..." -ForegroundColor Cyan
    vercel --prod
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 部署成功" -ForegroundColor Green
    } else {
        Write-Host "❌ 部署失败" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "⚠️  已跳过部署，请稍后手动部署" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "手动部署方法：" -ForegroundColor Cyan
    Write-Host "1. 访问：https://vercel.com/duliangkuans-projects/liwu"
    Write-Host "2. 点击 'Redeploy' 按钮"
    Write-Host "或运行：git push origin main"
}

Write-Host ""
Write-Host "=== 完成 ===" -ForegroundColor Green
Write-Host ""
Write-Host "下一步：" -ForegroundColor Cyan
Write-Host "1. 等待部署完成（约2-3分钟）"
Write-Host "2. 访问网站测试邮件发送功能"
Write-Host "3. 查看Vercel部署日志确认配置"
Write-Host ""
Write-Host "访问项目：https://vercel.com/duliangkuans-projects/liwu" -ForegroundColor Cyan
Write-Host ""
