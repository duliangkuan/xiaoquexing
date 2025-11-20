# 小确幸日记网站 💕

一个简洁优雅的单页面日记网站，包含三个核心功能：
- 📖 **记录小确幸**：记录每天让你感到幸福的小事
- 📅 **查看历史**：密码保护的历史记录查看
- 🫧 **树洞倾诉**：秘密的情绪宣泄口，倾诉内容会发送到指定邮箱

## ✨ 功能特点

- 🎨 **简洁美观的UI**：暖色调设计，少女心风格，给人安全感
- 🫧 **漂流瓶按钮**：右下角精美的漂流瓶样式按钮，带浮动动画
- 💾 **自动保存草稿**：本地自动保存，防止意外丢失
- ☁️ **云端存储**：支持MongoDB Atlas云数据库或本地JSON存储
- ✉️ **邮件通知**：树洞倾诉自动发送邮件提醒
- 📱 **响应式设计**：完美适配桌面端和移动端

## 🚀 快速开始

### 本地开发

1. **克隆项目**
```bash
git clone <repository-url>
cd liwu
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

复制 `.env.example` 文件为 `.env`，并填写配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下内容：
- `MONGODB_URI`（可选）：MongoDB Atlas连接字符串，如果不配置则使用JSON文件存储
- `DIARY_PASSWORD`：查看历史日记的密码（默认：admin888888）
- `SMTP_USER`：发件人QQ邮箱地址
- `SMTP_PASS`：发件人QQ邮箱授权码（需要在QQ邮箱设置中生成）
- `RECIPIENT_EMAIL`：收件人邮箱地址（您的QQ邮箱）

**QQ邮箱授权码获取方法：**
1. 登录QQ邮箱
2. 进入"设置" -> "账户"
3. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
4. 开启"POP3/SMTP服务"或"IMAP/SMTP服务"
5. 点击"生成授权码"，按提示操作
6. 将生成的授权码复制到 `SMTP_PASS`

4. **启动服务器**
```bash
npm start
```

或者使用开发模式（自动重启）：
```bash
npm run dev
```

5. **访问网站**
打开浏览器访问：`http://localhost:3000`

## 📦 Vercel部署

### 1. 准备工作

确保你已经：
- 注册了 [Vercel](https://vercel.com) 账号
- 注册了 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 账号（可选，但推荐）

### 2. 配置MongoDB Atlas（推荐）

1. 登录 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建一个免费集群（Free Tier）
3. 创建数据库用户
4. 设置网络访问（添加 `0.0.0.0/0` 允许所有IP）
5. 获取连接字符串，格式如下：
   ```
   mongodb+srv://用户名:密码@集群地址/xiaokuixing_diary?retryWrites=true&w=majority
   ```

### 3. 部署到Vercel

**方法一：通过GitHub部署（推荐）**

1. 将代码推送到GitHub仓库
2. 登录 [Vercel](https://vercel.com)
3. 点击 "New Project"
4. 导入你的GitHub仓库
5. 配置环境变量（Settings -> Environment Variables）：
   - `MONGODB_URI`：MongoDB连接字符串（如果有）
   - `DIARY_PASSWORD`：查看历史密码（默认：admin888888）
   - `SMTP_HOST`：smtp.qq.com
   - `SMTP_PORT`：465
   - `SMTP_USER`：发件人QQ邮箱
   - `SMTP_PASS`：QQ邮箱授权码
   - `RECIPIENT_EMAIL`：收件人邮箱
6. 点击 "Deploy"

**方法二：使用Vercel CLI**

1. 安装Vercel CLI：
```bash
npm i -g vercel
```

2. 在项目目录运行：
```bash
vercel
```

3. 按照提示完成部署

4. 配置环境变量：
```bash
vercel env add MONGODB_URI
vercel env add DIARY_PASSWORD
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASS
vercel env add RECIPIENT_EMAIL
```

### 4. 环境变量说明

在Vercel项目设置中，添加以下环境变量：

| 变量名 | 必需 | 说明 | 示例 |
|--------|------|------|------|
| `MONGODB_URI` | 否 | MongoDB连接字符串 | `mongodb+srv://user:pass@cluster.mongodb.net/...` |
| `DIARY_PASSWORD` | 是 | 查看历史密码 | `admin888888` |
| `SMTP_HOST` | 是 | SMTP服务器 | `smtp.qq.com` |
| `SMTP_PORT` | 是 | SMTP端口 | `465` |
| `SMTP_USER` | 是 | 发件人邮箱 | `your_email@qq.com` |
| `SMTP_PASS` | 是 | 邮箱授权码 | `xxxxxxxxxxxx` |
| `RECIPIENT_EMAIL` | 是 | 收件人邮箱 | `recipient@qq.com` |

### 5. 重新部署

配置完环境变量后，需要重新部署：
- 在Vercel控制台点击 "Redeploy"
- 或推送新的代码到GitHub

## 📁 项目结构

```
liwu/
├── public/                 # 前端静态文件
│   ├── index.html         # 主页面
│   ├── css/
│   │   └── style.css      # 样式文件
│   └── js/
│       └── app.js         # 前端逻辑
├── backend/               # 后端代码
│   ├── config/
│   │   ├── database.js    # 数据库配置
│   │   └── storage.js     # JSON文件存储
│   ├── routes/
│   │   ├── diaries.js     # 日记相关路由
│   │   └── treehole.js    # 树洞相关路由
│   └── utils/
│       └── emailService.js # 邮件服务
├── data/                  # 数据文件（JSON存储，自动创建）
├── server.js              # Express服务器入口
├── package.json           # 项目依赖
├── vercel.json            # Vercel配置
├── .env.example           # 环境变量示例
└── README.md              # 说明文档
```

## 🔧 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **后端**：Node.js, Express.js
- **数据库**：MongoDB Atlas（云数据库）或 JSON文件存储
- **邮件**：Nodemailer (SMTP)
- **部署**：Vercel

## 📝 API接口

### 保存日记
- **POST** `/api/diaries`
- **Body**: `{ "content": "日记内容" }`

### 查看历史
- **POST** `/api/diaries/history`
- **Body**: `{ "password": "密码" }`

### 树洞倾诉
- **POST** `/api/treehole/send`
- **Body**: `{ "content": "倾诉内容" }`

## 🎨 UI设计

- **主色调**：暖色调粉红色系
- **布局**：中央编辑区 + 右下角漂流瓶按钮 + 右上角历史入口
- **动画**：柔和的过渡动画和浮动效果
- **响应式**：完美适配各种设备

## ⚠️ 注意事项

1. **邮件配置**：确保正确配置QQ邮箱授权码，不是登录密码
2. **数据库**：如果不配置MongoDB，数据将存储在 `data/` 目录的JSON文件中
3. **密码安全**：建议修改默认密码 `admin888888`
4. **Vercel部署**：确保所有环境变量都已正确配置

## 📄 许可证

MIT License

## 💝 致谢

感谢使用小确幸日记网站，希望这个简洁优雅的网站能记录下你生活中的每一个小确幸！

如有问题或建议，欢迎反馈。

