# 配置SMTP环境变量步骤 📧

## 您的SMTP配置信息

- **发件人/收件人邮箱**：2330304961@qq.com
- **授权码**：bwzqgvsfgehwdjde
- **SMTP服务器**：smtp.qq.com
- **SMTP端口**：465

## 方法一：在Vercel网站上配置（推荐）⭐

### 1. 访问项目设置

打开浏览器，访问：
**https://vercel.com/duliangkuans-projects/liwu/settings/environment-variables**

### 2. 添加环境变量

点击 "Add New" 按钮，依次添加以下变量：

#### ① SMTP_HOST
- **Key**: `SMTP_HOST`
- **Value**: `smtp.qq.com`
- **Environments**: ☑️ Production  ☑️ Preview  ☑️ Development
- 点击 "Save"

#### ② SMTP_PORT
- **Key**: `SMTP_PORT`
- **Value**: `465`
- **Environments**: ☑️ Production  ☑️ Preview  ☑️ Development
- 点击 "Save"

#### ③ SMTP_USER
- **Key**: `SMTP_USER`
- **Value**: `2330304961@qq.com`
- **Environments**: ☑️ Production  ☑️ Preview  ☑️ Development
- 点击 "Save"

#### ④ SMTP_PASS
- **Key**: `SMTP_PASS`
- **Value**: `bwzqgvsfgehwdjde`
- **Environments**: ☑️ Production  ☑️ Preview  ☑️ Development
- 点击 "Save"

#### ⑤ RECIPIENT_EMAIL
- **Key**: `RECIPIENT_EMAIL`
- **Value**: `2330304961@qq.com`
- **Environments**: ☑️ Production  ☑️ Preview  ☑️ Development
- 点击 "Save"

#### ⑥ DIARY_PASSWORD（如果还没有）
- **Key**: `DIARY_PASSWORD`
- **Value**: `admin888888`
- **Environments**: ☑️ Production  ☑️ Preview  ☑️ Development
- 点击 "Save"

### 3. 验证配置

添加完所有变量后，页面应该显示：
- ✅ SMTP_HOST = `smtp.qq.com`
- ✅ SMTP_PORT = `465`
- ✅ SMTP_USER = `2330304961@qq.com`
- ✅ SMTP_PASS = `***`（隐藏显示）
- ✅ RECIPIENT_EMAIL = `2330304961@qq.com`
- ✅ DIARY_PASSWORD = `***`（如果已添加）

### 4. 重新部署

配置完所有环境变量后：

1. 返回项目页面：**https://vercel.com/duliangkuans-projects/liwu**
2. 点击 **"Redeploy"** 按钮
3. 选择 "Use existing Build Cache" 或直接重新部署
4. 等待部署完成（约2-3分钟）

## 方法二：使用Vercel CLI（交互式）

如果您更喜欢使用命令行，可以运行以下命令：

```bash
cd C:\Users\23303\OneDrive\Desktop\liwu

# 添加SMTP_HOST（交互式输入）
vercel env add SMTP_HOST production
# 输入值：smtp.qq.com

vercel env add SMTP_HOST preview
# 输入值：smtp.qq.com

vercel env add SMTP_HOST development
# 输入值：smtp.qq.com

# 添加SMTP_PORT
vercel env add SMTP_PORT production
# 输入值：465

vercel env add SMTP_PORT preview
# 输入值：465

vercel env add SMTP_PORT development
# 输入值：465

# 添加SMTP_USER
vercel env add SMTP_USER production
# 输入值：2330304961@qq.com

vercel env add SMTP_USER preview
# 输入值：2330304961@qq.com

vercel env add SMTP_USER development
# 输入值：2330304961@qq.com

# 添加SMTP_PASS（授权码）
vercel env add SMTP_PASS production
# 输入值：bwzqgvsfgehwdjde

vercel env add SMTP_PASS preview
# 输入值：bwzqgvsfgehwdjde

vercel env add SMTP_PASS development
# 输入值：bwzqgvsfgehwdjde

# 添加RECIPIENT_EMAIL
vercel env add RECIPIENT_EMAIL production
# 输入值：2330304961@qq.com

vercel env add RECIPIENT_EMAIL preview
# 输入值：2330304961@qq.com

vercel env add RECIPIENT_EMAIL development
# 输入值：2330304961@qq.com

# 添加DIARY_PASSWORD（如果还没有）
vercel env add DIARY_PASSWORD production
# 输入值：admin888888

vercel env add DIARY_PASSWORD preview
# 输入值：admin888888

vercel env add DIARY_PASSWORD development
# 输入值：admin888888
```

每个命令执行后，会提示您输入值，按提示操作即可。

## ✅ 配置完成后验证

### 1. 检查环境变量

使用Vercel CLI检查：
```bash
vercel env ls
```

应该能看到所有配置的变量。

### 2. 重新部署

配置完环境变量后，必须重新部署：
```bash
vercel --prod
```

或在Vercel网站上点击 "Redeploy"。

### 3. 测试邮件功能

部署完成后：

1. 访问网站
2. 点击右下角的漂流瓶按钮
3. 输入测试内容
4. 点击"倾诉"按钮
5. 检查邮箱 `2330304961@qq.com` 是否收到邮件

## ⚠️ 重要提示

1. **每个环境都要配置**
   - Production（生产环境）
   - Preview（预览环境）
   - Development（开发环境）

2. **配置后必须重新部署**
   - 环境变量只在新部署时生效
   - 配置后必须重新部署才能使用

3. **授权码安全**
   - 授权码是敏感信息，不要在公开场合泄露
   - Vercel会自动加密存储环境变量

## 🎉 完成！

配置完所有SMTP环境变量并重新部署后，树洞倾诉功能就能正常发送邮件了！

如有问题，请查看部署日志或联系技术支持。

