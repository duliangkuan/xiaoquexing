# 邮件发送系统配置说明

## 📧 功能说明

邮件发送系统已成功安装并集成到项目中。当用户发送树洞倾诉时，系统会自动发送邮件通知到指定邮箱。

## 🔧 配置步骤

### 1. 创建 `.env` 文件

在项目根目录创建 `.env` 文件（如果还没有的话），并添加以下配置：

```env
# 邮件配置
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@qq.com
SMTP_PASS=your-email-auth-code
EMAIL_FROM=your-email@qq.com
EMAIL_TO=recipient@example.com
```

### 2. 获取邮箱授权码

#### QQ邮箱
1. 登录QQ邮箱
2. 点击"设置" -> "账户"
3. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
4. 开启"POP3/SMTP服务"或"IMAP/SMTP服务"
5. 点击"生成授权码"，按照提示发送短信
6. 将生成的授权码复制到 `SMTP_PASS`

#### 163邮箱
1. 登录163邮箱
2. 点击"设置" -> "POP3/SMTP/IMAP"
3. 开启"SMTP服务"
4. 设置授权码（如果还没有）
5. 将授权码复制到 `SMTP_PASS`

#### Gmail
1. 登录Gmail账户
2. 启用"两步验证"
3. 生成"应用专用密码"
4. 将应用专用密码复制到 `SMTP_PASS`
5. 设置 `SMTP_HOST=smtp.gmail.com`

### 3. 常用邮箱SMTP配置

| 邮箱服务商 | SMTP_HOST | SMTP_PORT | SMTP_SECURE |
|-----------|-----------|-----------|-------------|
| QQ邮箱 | smtp.qq.com | 587 | false |
| 163邮箱 | smtp.163.com | 465 | true |
| Gmail | smtp.gmail.com | 587 | false |
| Outlook | smtp-mail.outlook.com | 587 | false |

### 4. 配置说明

- `SMTP_HOST`: SMTP服务器地址
- `SMTP_PORT`: SMTP端口（587为TLS，465为SSL）
- `SMTP_SECURE`: 是否使用SSL（465端口需要true，587端口需要false）
- `SMTP_USER`: 发送邮件的邮箱地址
- `SMTP_PASS`: 邮箱授权码（**不是登录密码**）
- `EMAIL_FROM`: 发件人邮箱（可选，默认使用SMTP_USER）
- `EMAIL_TO`: 收件人邮箱（可选，默认使用SMTP_USER）

## 🚀 使用说明

### 自动发送

当用户通过树洞功能发送倾诉时，系统会自动发送邮件通知到配置的收件人邮箱。

### 手动测试

你可以在代码中调用邮件发送函数：

```javascript
const { sendTreeholeNotification, verifyConnection } = require('./backend/utils/email');

// 验证邮件连接
await verifyConnection();

// 发送测试邮件
await sendTreeholeNotification('这是一条测试消息');
```

## ⚠️ 注意事项

1. **授权码不是密码**：`SMTP_PASS` 必须使用邮箱授权码，不能使用登录密码
2. **环境变量**：确保 `.env` 文件在项目根目录，且不会被提交到版本控制系统
3. **邮件发送是异步的**：邮件发送失败不会影响主业务流程
4. **生产环境**：在生产环境中，建议使用专业的邮件服务（如SendGrid、Mailgun等）

## 🔍 故障排查

### 邮件发送失败

1. 检查 `.env` 文件配置是否正确
2. 确认授权码是否有效
3. 检查SMTP服务器地址和端口是否正确
4. 查看服务器日志中的错误信息

### 连接验证失败

运行服务器时，如果看到"邮件服务器连接验证失败"，请检查：
- 网络连接是否正常
- SMTP服务器地址是否正确
- 端口是否被防火墙阻止
- 授权码是否过期

## 📝 已安装的依赖

- `nodemailer`: ^7.0.10 - 邮件发送库

## 📁 相关文件

- `backend/config/email.js` - 邮件配置文件
- `backend/utils/email.js` - 邮件发送工具函数
- `backend/routes/treehole.js` - 树洞路由（已集成邮件发送）

