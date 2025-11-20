# 部署指南 - GitHub + Vercel 🚀

本指南将帮助您将小确幸日记网站部署到GitHub和Vercel。

## 📋 准备工作

### 1. 确保已安装Git
```bash
git --version
```

如果没有安装，请访问：https://git-scm.com/download/win

### 2. 注册账号
- **GitHub账号**：https://github.com/signup
- **Vercel账号**：https://vercel.com/signup（可使用GitHub账号登录）

### 3. 准备MongoDB Atlas（推荐）
如果不配置MongoDB，在Vercel上数据无法持久化存储。

## 🎯 第一步：上传到GitHub

### 1. 初始化Git仓库（如果还没初始化）

```bash
cd C:\Users\23303\OneDrive\Desktop\liwu
git init
```

### 2. 添加所有文件到Git

```bash
git add .
```

**注意**：`.gitignore`已配置，会自动忽略以下文件：
- `.env` - 环境变量（包含敏感信息）
- `data/` - 本地数据文件
- `node_modules/` - 依赖包
- `.vercel` - Vercel配置

### 3. 提交文件

```bash
git commit -m "Initial commit: 小确幸日记网站"
```

### 4. 在GitHub上创建仓库

1. 登录 https://github.com
2. 点击右上角 "+" 号，选择 "New repository"
3. 填写仓库信息：
   - **Repository name**: `xiaokuixing-diary`（或您喜欢的名称）
   - **Description**: 小确幸日记网站
   - **Visibility**: Public 或 Private（推荐Private，因为包含个人邮箱配置）
   - **不要勾选** "Initialize this repository with a README"（我们已经有了文件）
4. 点击 "Create repository"

### 5. 连接到GitHub并推送代码

复制GitHub提供的命令（替换`YOUR_USERNAME`为您的GitHub用户名）：

```bash
git remote add origin https://github.com/YOUR_USERNAME/xiaokuixing-diary.git
git branch -M main
git push -u origin main
```

如果提示输入用户名和密码，GitHub现在要求使用**Personal Access Token**而不是密码。

#### 如何获取Personal Access Token：
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 点击 "Generate new token"
3. 设置权限（至少需要 `repo` 权限）
4. 复制生成的token（只显示一次，务必保存）

推送时：
- Username: 您的GitHub用户名
- Password: 粘贴Personal Access Token

### 6. 验证上传成功

访问您的GitHub仓库URL：`https://github.com/YOUR_USERNAME/xiaokuixing-diary`

应该能看到所有文件（除了`.gitignore`中忽略的文件）。

## 🚀 第二步：部署到Vercel

### 方法一：通过GitHub部署（推荐）

1. **登录Vercel**
   - 访问 https://vercel.com
   - 点击 "Sign Up" 或使用GitHub账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 在 "Import Git Repository" 中找到您的仓库
   - 点击 "Import"

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
   | `MONGODB_URI` | `mongodb+srv://...` | MongoDB连接字符串（如果有） |
   | `DIARY_PASSWORD` | `admin888888` | 查看历史密码（可自定义） |
   | `SMTP_HOST` | `smtp.qq.com` | QQ邮箱SMTP服务器 |
   | `SMTP_PORT` | `465` | SMTP端口 |
   | `SMTP_USER` | `2330304961@qq.com` | 发件人QQ邮箱 |
   | `SMTP_PASS` | `gbedglcqrgsydigi` | QQ邮箱授权码 |
   | `RECIPIENT_EMAIL` | `2330304961@qq.com` | 收件人邮箱 |

   **重要**：每个变量都要分别添加，确保：
   - Production（生产环境）✓
   - Preview（预览环境）✓
   - Development（开发环境）✓

5. **部署**
   - 点击 "Deploy" 按钮
   - 等待部署完成（约2-3分钟）

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
cd C:\Users\23303\OneDrive\Desktop\liwu
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

## ✅ 第三步：验证部署

### 1. 访问网站
部署成功后，Vercel会提供一个URL（如：`https://your-project.vercel.app`）

### 2. 测试功能
- ✅ 测试保存日记功能
- ✅ 测试查看历史功能（密码：admin888888）
- ✅ 测试树洞倾诉功能（检查是否收到邮件）

### 3. 检查MongoDB（如果配置了）
- 登录MongoDB Atlas
- 查看 "Collections" 确认数据已保存

## 🔧 后续更新

### 更新代码并重新部署

1. **修改代码后提交**
```bash
git add .
git commit -m "更新说明"
git push
```

2. **Vercel自动部署**
   - 如果已连接GitHub，Vercel会自动检测推送并重新部署
   - 或者手动在Vercel控制台点击 "Redeploy"

### 修改环境变量

1. 在Vercel项目设置中修改环境变量
2. 点击 "Redeploy" 重新部署

## 🐛 常见问题

### 1. 部署失败

**检查**：
- 确保 `package.json` 中的依赖版本正确
- 检查 Vercel 部署日志中的错误信息
- 确保 Node.js 版本兼容（需要 >=18.0.0）

### 2. 邮件发送失败

**检查**：
- QQ邮箱授权码是否正确（不是登录密码）
- SMTP配置是否正确
- 检查服务器日志中的错误信息

### 3. 数据库连接失败

**检查**：
- MongoDB连接字符串是否正确
- MongoDB Atlas中的网络访问设置（是否允许所有IP `0.0.0.0/0`）
- 数据库用户名和密码是否正确

### 4. 页面404错误

**检查**：
- `vercel.json` 配置是否正确
- 静态文件路径是否正确
- API路由是否正确

## 📝 重要提醒

⚠️ **安全提示**：
1. **不要**将`.env`文件提交到GitHub
2. **不要**在GitHub上公开邮箱授权码
3. 建议仓库设置为**Private**（私有）
4. 所有敏感信息都通过Vercel环境变量配置

✅ **已配置的忽略文件**：
- `.env` - 环境变量
- `data/` - 本地数据文件
- `node_modules/` - 依赖包

## 🎉 完成！

恭喜！您的小确幸日记网站已经成功部署到Vercel了！

现在可以：
- 分享网站链接给朋友
- 开始记录您的小确幸
- 随时查看历史记录
- 使用树洞功能倾诉心声

祝您使用愉快！💕

