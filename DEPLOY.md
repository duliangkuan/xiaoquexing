# Vercel部署指南 🚀

本文档详细说明如何将小确幸日记网站部署到Vercel平台。

## 📋 前置要求

1. **GitHub账号**：用于代码托管
2. **Vercel账号**：免费注册 [vercel.com](https://vercel.com)
3. **MongoDB Atlas账号**：免费注册 [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)（可选，但强烈推荐）

## 🔧 第一步：配置MongoDB Atlas（推荐）

如果不配置MongoDB，在Vercel的serverless环境中数据无法持久化存储。

### 1. 创建MongoDB Atlas账户

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 点击 "Try Free" 注册账号（免费）
3. 验证邮箱并登录

### 2. 创建集群

1. 选择 "Build a Database"
2. 选择 **FREE** (M0) 套餐（免费）
3. 选择云服务提供商（AWS/GCP/Azure）
4. 选择最近的区域（如：Singapore）
5. 点击 "Create"
6. 等待集群创建完成（约3-5分钟）

### 3. 配置数据库访问

1. 点击 "Database Access"（左侧菜单）
2. 点击 "Add New Database User"
3. 选择 "Password" 认证方式
4. 输入用户名和密码（记住这些信息）
5. 设置权限：选择 "Atlas admin" 或 "Read and write to any database"
6. 点击 "Add User"

### 4. 配置网络访问

1. 点击 "Network Access"（左侧菜单）
2. 点击 "Add IP Address"
3. 选择 "Allow Access from Anywhere"（输入 `0.0.0.0/0`）
4. 点击 "Confirm"

### 5. 获取连接字符串

1. 点击 "Database"（左侧菜单）
2. 点击 "Connect" 按钮
3. 选择 "Connect your application"
4. 选择驱动：**Node.js**，版本：**5.5 or later**
5. 复制连接字符串，格式如下：
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. 将 `<username>` 和 `<password>` 替换为你创建的用户名和密码
7. 在连接字符串末尾添加数据库名：
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/xiaokuixing_diary?retryWrites=true&w=majority
   ```
8. **保存这个连接字符串**，稍后在Vercel中需要用到

## 🚀 第二步：准备代码

### 1. 创建GitHub仓库

1. 在GitHub上创建一个新仓库（可以是私有或公开）
2. 将本地代码推送到GitHub：

```bash
# 初始化Git仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 添加远程仓库
git remote add origin https://github.com/你的用户名/仓库名.git

# 推送到GitHub
git push -u origin main
```

### 2. 确保.env文件已添加到.gitignore

**重要**：确保 `.env` 文件不会被推送到GitHub（已经在 `.gitignore` 中）

## 📦 第三步：部署到Vercel

### 方法一：通过GitHub部署（推荐）

1. **登录Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "Sign Up" 注册（或使用GitHub账号登录）

2. **导入项目**
   - 登录后，点击 "Add New..." -> "Project"
   - 选择 "Import Git Repository"
   - 授权Vercel访问你的GitHub账号（如果需要）
   - 选择你的仓库并点击 "Import"

3. **配置项目**
   - **Framework Preset**: 选择 "Other" 或留空
   - **Root Directory**: 留空（项目根目录）
   - **Build Command**: 留空（无需构建）
   - **Output Directory**: 留空
   - **Install Command**: `npm install`

4. **配置环境变量**
   在部署之前，点击 "Environment Variables" 添加以下变量：

   | 变量名 | 值 | 说明 |
   |--------|-----|------|
   | `MONGODB_URI` | `mongodb+srv://...` | MongoDB连接字符串（从Atlas获取） |
   | `DIARY_PASSWORD` | `admin888888` | 查看历史日记的密码（可自定义） |
   | `SMTP_HOST` | `smtp.qq.com` | QQ邮箱SMTP服务器 |
   | `SMTP_PORT` | `465` | SMTP端口 |
   | `SMTP_USER` | `your_email@qq.com` | 发件人QQ邮箱地址 |
   | `SMTP_PASS` | `xxxxx` | QQ邮箱授权码（不是登录密码） |
   | `RECIPIENT_EMAIL` | `your_recipient@qq.com` | 收件人邮箱地址（您的QQ邮箱） |

5. **部署**
   - 点击 "Deploy" 按钮
   - 等待部署完成（约2-3分钟）
   - 部署成功后，Vercel会提供一个URL（如：`https://your-project.vercel.app`）

### 方法二：使用Vercel CLI

1. **安装Vercel CLI**
```bash
npm i -g vercel
```

2. **登录Vercel**
```bash
vercel login
```

3. **部署项目**
```bash
# 在项目根目录运行
vercel
```

4. **配置环境变量**
```bash
vercel env add MONGODB_URI
vercel env add DIARY_PASSWORD
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASS
vercel env add RECIPIENT_EMAIL
```

5. **生产环境部署**
```bash
vercel --prod
```

## ⚙️ 第四步：配置QQ邮箱SMTP

### 获取QQ邮箱授权码

1. 登录QQ邮箱：https://mail.qq.com
2. 点击 "设置"（右上角）
3. 点击 "账户"（左侧菜单）
4. 找到 "POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
5. 开启 "POP3/SMTP服务" 或 "IMAP/SMTP服务"
6. 点击 "生成授权码"
7. 按照提示发送短信验证
8. 复制生成的授权码（16位字符串）
9. 将这个授权码设置到 `SMTP_PASS` 环境变量

**注意**：
- 授权码**不是**你的QQ邮箱登录密码
- 授权码只能生成一次，如果忘记需要重新生成
- 妥善保管授权码，不要泄露

## 🔄 第五步：更新环境变量并重新部署

如果在部署后需要修改环境变量：

1. 登录Vercel控制台
2. 进入项目设置（Settings）
3. 点击 "Environment Variables"
4. 添加或修改环境变量
5. 点击 "Redeploy" 重新部署

或者在项目页面点击 "Redeploy" 按钮。

## ✅ 验证部署

部署完成后：

1. **访问网站**
   - 打开Vercel提供的URL
   - 检查页面是否正常加载

2. **测试功能**
   - ✅ 测试保存日记功能
   - ✅ 测试查看历史功能（密码：admin888888）
   - ✅ 测试树洞倾诉功能（检查是否收到邮件）

3. **检查数据库**
   - 登录MongoDB Atlas
   - 查看 "Collections" 确认数据已保存

## 🐛 常见问题

### 1. 部署失败

- **检查**：确保 `package.json` 中的依赖版本正确
- **检查**：确保代码没有语法错误
- **检查**：查看Vercel部署日志中的错误信息

### 2. 数据库连接失败

- **检查**：MongoDB连接字符串是否正确
- **检查**：MongoDB Atlas中的网络访问设置（是否允许所有IP）
- **检查**：数据库用户名和密码是否正确

### 3. 邮件发送失败

- **检查**：QQ邮箱授权码是否正确（不是登录密码）
- **检查**：SMTP配置是否正确
- **检查**：收件人邮箱地址是否正确

### 4. 页面404错误

- **检查**：`vercel.json` 配置是否正确
- **检查**：静态文件路径是否正确
- **检查**：API路由是否正确

### 5. 数据不持久化

- **原因**：Vercel的serverless环境无法使用文件系统存储
- **解决**：必须配置MongoDB Atlas

## 📝 后续维护

### 更新代码

1. 在本地修改代码
2. 提交到GitHub：
```bash
git add .
git commit -m "更新说明"
git push
```
3. Vercel会自动检测并重新部署（如果启用了自动部署）

### 修改环境变量

1. 在Vercel项目设置中修改环境变量
2. 点击 "Redeploy" 重新部署

### 查看日志

1. 在Vercel项目页面点击 "Functions" 或 "Logs"
2. 查看服务器日志和错误信息

## 🎉 完成！

恭喜！你的小确幸日记网站已经成功部署到Vercel了！

现在可以：
- 分享网站链接给朋友
- 开始记录你的小确幸
- 随时查看历史记录
- 使用树洞功能倾诉心声

祝你使用愉快！💕

