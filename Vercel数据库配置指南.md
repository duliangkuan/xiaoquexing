# Vercel 数据库配置指南 🗄️

本指南将帮助您在 Vercel 上配置 MongoDB 数据库，使您的项目能够持久化存储数据。

## 📋 为什么需要配置数据库？

在 Vercel 的 serverless 环境中：
- ❌ 文件系统是**只读的**，无法写入 JSON 文件
- ❌ 每次函数执行后，内存中的数据会丢失
- ✅ **必须使用云数据库**（如 MongoDB Atlas）来持久化存储数据

## 🚀 第一步：创建 MongoDB Atlas 账户

### 1.1 注册账户

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 点击右上角 **"Try Free"** 或 **"Sign Up"** 按钮
3. 选择注册方式：
   - 使用 Google 账号登录（推荐）
   - 使用邮箱注册
4. 填写注册信息并验证邮箱

### 1.2 创建组织（首次使用）

1. 如果是首次使用，会提示创建组织
2. 输入组织名称（如：`My Projects`）
3. 选择组织类型：**个人项目** 或 **公司项目**
4. 点击 **"Next"**

## 🔧 第二步：创建免费集群

### 2.1 选择部署类型

1. 登录后，点击 **"Build a Database"** 按钮
2. 选择 **"M0 FREE"** 套餐（免费，512MB 存储空间）
3. 点击 **"Create"**

### 2.2 选择云服务提供商和区域

1. **Cloud Provider**：选择任意一个（AWS、Google Cloud、Azure）
2. **Region**：选择**离您最近的区域**（推荐选择亚洲区域，如：`Singapore (ap-southeast-1)`）
3. 点击 **"Create Cluster"**

### 2.3 等待集群创建

- 集群创建需要 **3-5 分钟**
- 创建过程中会显示进度条
- 创建完成后会显示 **"Your cluster is being created"** 提示

## 👤 第三步：创建数据库用户

### 3.1 设置用户名和密码

1. 在集群创建过程中，会提示创建数据库用户
2. 或者创建完成后，点击左侧菜单 **"Database Access"**
3. 点击 **"Add New Database User"** 按钮

### 3.2 配置用户信息

1. **Authentication Method**：选择 **"Password"**
2. **Username**：输入用户名（如：`liwu_user`）
3. **Password**：点击 **"Autogenerate Secure Password"** 或手动输入
   - ⚠️ **重要**：如果自动生成，请**立即复制并保存**密码
   - 如果手动输入，请使用强密码（至少 8 位，包含大小写字母、数字、特殊字符）
4. **Database User Privileges**：选择 **"Atlas admin"**（拥有所有权限）
5. 点击 **"Add User"**

### 3.3 保存用户信息

⚠️ **重要**：请妥善保存以下信息，稍后需要用到：
- 用户名：`_________________`
- 密码：`_________________`

## 🌐 第四步：配置网络访问

### 4.1 允许所有 IP 访问（推荐用于开发）

1. 点击左侧菜单 **"Network Access"**
2. 点击 **"Add IP Address"** 按钮
3. 点击 **"Allow Access from Anywhere"** 按钮
   - 这会自动填入 `0.0.0.0/0`（允许所有 IP 访问）
4. 点击 **"Confirm"**

⚠️ **安全提示**：
- 对于生产环境，建议只添加 Vercel 的 IP 地址范围
- 但为了方便，开发阶段可以允许所有 IP

### 4.2 等待配置生效

- 网络访问配置通常需要 **1-2 分钟** 生效
- 状态会从 **"Pending"** 变为 **"Active"**

## 🔗 第五步：获取连接字符串

### 5.1 进入连接页面

1. 点击左侧菜单 **"Database"**
2. 在集群列表中，找到您刚创建的集群
3. 点击集群卡片上的 **"Connect"** 按钮

### 5.2 选择连接方式

1. 在弹出的对话框中，选择 **"Connect your application"**
2. **Driver**：选择 **"Node.js"**
3. **Version**：选择 **"5.5 or later"**（或最新版本）

### 5.3 复制连接字符串

您会看到类似这样的连接字符串：

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 5.4 修改连接字符串

1. 将 `<username>` 替换为您创建的数据库用户名
2. 将 `<password>` 替换为您创建的数据库密码
   - ⚠️ **注意**：如果密码中包含特殊字符（如 `@`、`#`、`%` 等），需要进行 URL 编码
   - 例如：`@` 需要替换为 `%40`，`#` 需要替换为 `%23`
3. 在连接字符串的 `?` 之前添加数据库名称：
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/xiaokuixing_diary?retryWrites=true&w=majority
   ```

**完整示例**：
```
mongodb+srv://liwu_user:MyP@ssw0rd@cluster0.abc123.mongodb.net/xiaokuixing_diary?retryWrites=true&w=majority
```

⚠️ **重要**：请保存这个完整的连接字符串，下一步需要在 Vercel 中使用。

## ⚙️ 第六步：在 Vercel 中配置环境变量

### 6.1 进入 Vercel 项目设置

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到您的项目（`liwu`）
3. 点击项目进入详情页
4. 点击顶部菜单 **"Settings"**
5. 在左侧菜单中点击 **"Environment Variables"**

### 6.2 添加 MONGODB_URI 环境变量

1. 在 **"Key"** 输入框中输入：`MONGODB_URI`
2. 在 **"Value"** 输入框中粘贴您刚才复制的完整连接字符串
3. 在 **"Environment"** 中选择需要应用的环境：
   - ✅ **Production**（生产环境）
   - ✅ **Preview**（预览环境）
   - ✅ **Development**（开发环境）
4. 点击 **"Save"** 按钮

### 6.3 添加 DB_NAME 环境变量（可选）

如果您的项目需要自定义数据库名称：

1. 点击 **"Add New"** 添加新变量
2. **Key**：`DB_NAME`
3. **Value**：`xiaokuixing_diary`（或您想要的数据库名称）
4. 选择所有环境
5. 点击 **"Save"**

⚠️ **注意**：如果连接字符串中已经包含了数据库名称（如上面的示例），则不需要单独配置 `DB_NAME`。

## 🔄 第七步：重新部署项目

### 方法一：在 Vercel 网站上重新部署

1. 返回项目详情页（点击项目名称）
2. 点击 **"Deployments"** 标签
3. 找到最新的部署记录
4. 点击右侧的 **"..."** 菜单
5. 选择 **"Redeploy"**
6. 确认重新部署

### 方法二：使用 Vercel CLI

在项目根目录运行：

```bash
vercel --prod
```

### 方法三：推送代码触发自动部署

如果您配置了 GitHub 自动部署，只需推送任意更改：

```bash
git commit --allow-empty -m "触发重新部署以应用环境变量"
git push
```

## ✅ 第八步：验证配置

### 8.1 检查部署日志

1. 在 Vercel 项目页面，点击 **"Deployments"**
2. 点击最新的部署记录
3. 查看 **"Build Logs"** 和 **"Function Logs"**
4. 查找是否有 `MongoDB连接成功` 的日志信息

### 8.2 测试保存功能

1. 访问您的网站（Vercel 提供的 URL）
2. 在日记编辑区输入一些测试内容
3. 点击 **"保存小确幸"** 按钮
4. 应该看到 **"保存成功"** 的提示

### 8.3 测试查看历史功能

1. 点击右上角的日历图标
2. 输入密码：`admin888888`
3. 应该能看到刚才保存的日记

### 8.4 在 MongoDB Atlas 中验证数据

1. 登录 [MongoDB Atlas](https://cloud.mongodb.com)
2. 点击左侧菜单 **"Database"**
3. 点击集群卡片上的 **"Browse Collections"** 按钮
4. 如果看到 `diaries` 集合，说明数据已成功保存
5. 点击 `diaries` 集合，应该能看到您保存的日记数据

## 🐛 常见问题排查

### 问题 1：数据库连接失败

**错误信息**：`MongoDB连接失败，使用JSON文件存储`

**解决方法**：
1. ✅ 检查 `MONGODB_URI` 环境变量是否正确配置
2. ✅ 检查连接字符串中的用户名和密码是否正确
3. ✅ 检查密码中的特殊字符是否进行了 URL 编码
4. ✅ 检查 MongoDB Atlas 中的网络访问设置（是否允许所有 IP）
5. ✅ 检查数据库用户权限是否正确

### 问题 2：密码包含特殊字符导致连接失败

**解决方法**：
对密码中的特殊字符进行 URL 编码：

| 字符 | URL 编码 |
|------|----------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `=` | `%3D` |
| `?` | `%3F` |
| `/` | `%2F` |
| ` ` (空格) | `%20` |

**示例**：
- 原始密码：`MyP@ss#123`
- 编码后：`MyP%40ss%23123`
- 连接字符串：`mongodb+srv://user:MyP%40ss%23123@cluster0.xxx.mongodb.net/...`

### 问题 3：网络访问被拒绝

**错误信息**：`MongoNetworkError: connection timed out`

**解决方法**：
1. 登录 MongoDB Atlas
2. 进入 **"Network Access"**
3. 确保添加了 `0.0.0.0/0`（允许所有 IP）
4. 等待 1-2 分钟让配置生效
5. 重新部署项目

### 问题 4：环境变量未生效

**解决方法**：
1. ✅ 确保在 Vercel 中添加环境变量后**重新部署**了项目
2. ✅ 检查环境变量是否添加到了正确的环境（Production/Preview/Development）
3. ✅ 检查变量名是否正确（区分大小写）：`MONGODB_URI`

### 问题 5：数据库名称不匹配

**解决方法**：
1. 确保连接字符串中包含数据库名称：
   ```
   mongodb+srv://...@cluster0.xxx.mongodb.net/xiaokuixing_diary?...
   ```
2. 或者单独配置 `DB_NAME` 环境变量为 `xiaokuixing_diary`

## 📝 快速检查清单

在配置完成后，请确认以下所有项：

- [ ] MongoDB Atlas 账户已创建
- [ ] 免费集群已创建并运行
- [ ] 数据库用户已创建（用户名和密码已保存）
- [ ] 网络访问已配置（允许所有 IP 或 Vercel IP）
- [ ] 连接字符串已获取并修改（包含用户名、密码、数据库名）
- [ ] 在 Vercel 中添加了 `MONGODB_URI` 环境变量
- [ ] 环境变量已应用到所有环境（Production、Preview、Development）
- [ ] 项目已重新部署
- [ ] 测试保存功能成功
- [ ] 在 MongoDB Atlas 中能看到保存的数据

## 🎉 完成！

恭喜！您已经成功在 Vercel 上配置了 MongoDB 数据库！

现在您的项目可以：
- ✅ 持久化存储日记数据
- ✅ 在 serverless 环境中正常工作
- ✅ 支持多用户并发访问
- ✅ 数据安全可靠

## 📚 相关资源

- [MongoDB Atlas 官方文档](https://docs.atlas.mongodb.com/)
- [Vercel 环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)
- [MongoDB Node.js 驱动文档](https://docs.mongodb.com/drivers/node/)

## 💡 提示

- MongoDB Atlas 免费套餐提供 512MB 存储空间，对于个人项目完全够用
- 如果数据量增长，可以考虑升级到付费套餐
- 定期备份重要数据（MongoDB Atlas 提供自动备份功能）
- 保护好数据库连接字符串，不要泄露给他人

祝您使用愉快！💕


