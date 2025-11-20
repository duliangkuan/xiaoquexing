# Vercel数据库配置说明 🔧

## 📋 对话框操作步骤

您看到的"Configure liwu"对话框是Vercel的数据库连接配置界面。以下是操作步骤：

### 1. 环境选择（Environment）

✅ **建议全部勾选**：
- ☑️ **Development** - 开发环境
- ☑️ **Preview** - 预览环境  
- ☑️ **Production** - 生产环境

这样数据库在所有环境中都可用。

### 2. 自定义前缀（Custom Prefix）

**当前显示**：`STORAGE` → 会创建 `STORAGE_URL` 环境变量

**建议修改为**：`MONGODB` → 会创建 `MONGODB_URL` 环境变量

**操作**：
1. 点击输入框中的 `STORAGE`
2. 删除并输入 `MONGODB`
3. 会显示为：`MONGODB_URL`

### 3. 点击连接

点击右下角的黑色 **"Connect"** 按钮完成配置。

## ✅ 配置后会发生什么

配置完成后：

1. **Vercel会自动创建环境变量**：
   - `MONGODB_URL`（如果前缀是MONGODB）
   - 或 `STORAGE_URL`（如果前缀是STORAGE）

2. **代码已更新**：
   - 代码现在支持读取 `MONGODB_URI`、`MONGODB_URL` 或 `STORAGE_URL`
   - 无论您选择什么前缀，代码都能正常工作

3. **需要重新部署**：
   - 配置环境变量后，需要重新部署项目
   - 在Vercel项目页面点击 "Redeploy"
   - 或推送代码到GitHub（自动部署）

## 🔄 推荐配置

### 推荐设置

- **前缀**：`MONGODB`
- **环境**：全部勾选（Development、Preview、Production）
- **结果**：创建 `MONGODB_URL` 环境变量

### 或者保持STORAGE

如果保持 `STORAGE` 前缀：
- 会创建 `STORAGE_URL` 环境变量
- 代码也已经支持读取这个变量
- 也能正常工作

## ⚠️ 重要提示

### 配置后必须重新部署

配置完数据库后：

1. **在Vercel网站上**：
   - 访问项目页面
   - 点击 "Redeploy" 按钮
   - 选择 "Use existing Build Cache" 或直接重新部署

2. **或者推送代码**：
   ```bash
   git push origin main
   ```
   Vercel会自动检测并重新部署

### 验证配置

部署完成后，测试保存功能：

1. 访问网站
2. 输入日记内容
3. 点击"保存小确幸"
4. 应该能成功保存（不再显示错误）

## 🔍 检查配置

### 在Vercel网站上检查

1. 访问项目设置：https://vercel.com/duliangkuans-projects/liwu/settings/environment-variables
2. 查看环境变量列表
3. 应该能看到：
   - `MONGODB_URL` 或 `STORAGE_URL`（取决于您选择的前缀）
   - 以及其他已配置的变量

### 使用Vercel CLI检查

```bash
vercel env ls
```

应该能看到所有环境变量。

## 📝 代码说明

代码已经更新为支持多种环境变量名：

```javascript
// 支持以下环境变量：
// - MONGODB_URI（手动配置）
// - MONGODB_URL（Vercel数据库集成，前缀MONGODB）
// - STORAGE_URL（Vercel数据库集成，前缀STORAGE）
const MONGODB_URI = process.env.MONGODB_URI || 
                    process.env.MONGODB_URL || 
                    process.env.STORAGE_URL || 
                    'mongodb://localhost:27017';
```

所以无论您选择什么前缀，代码都能正常工作！

## ✅ 下一步操作

1. **在对话框中**：
   - 确认环境已全部勾选
   - 将前缀改为 `MONGODB`（推荐）或保持 `STORAGE`
   - 点击 **"Connect"** 按钮

2. **配置完成后**：
   - 在Vercel项目页面点击 "Redeploy"
   - 或等待几分钟让Vercel自动检测

3. **测试功能**：
   - 访问网站
   - 测试保存日记功能
   - 应该能成功保存了！

## 🎉 完成！

配置完成后，您的网站就能正常保存数据了！数据库连接会自动配置，无需手动设置连接字符串。

