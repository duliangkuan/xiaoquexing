const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const diaryRoutes = require('./backend/routes/diaries');
const treeholeRoutes = require('./backend/routes/treehole');
const { initTransporter, verifyConnection } = require('./backend/utils/email');

const app = express();

// 隐藏Express的x-powered-by头部
app.disable('x-powered-by');

// 安全头部中间件
app.use((req, res, next) => {
    // 设置安全相关的HTTP头部
    res.setHeader('X-Content-Type-Options', 'nosniff'); // 防止MIME类型嗅探
    res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // 防止点击劫持（将被CSP替代，但为了兼容性保留）
    res.setHeader('X-XSS-Protection', '1; mode=block'); // XSS保护
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin'); // 推荐人策略
    
    // 设置Content Security Policy (CSP)
    // 允许来自同源的资源，以及允许内联脚本和样式（用于简单的单页应用）
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // 允许内联脚本（如果需要可以更严格）
        "style-src 'self' 'unsafe-inline'", // 允许内联样式
        "img-src 'self' data: https:", // 允许图片和数据URI
        "font-src 'self' data:", // 允许字体和数据URI
        "connect-src 'self' https://api.vercel.app", // 允许API请求
        "frame-ancestors 'self'", // 替代X-Frame-Options
        "base-uri 'self'", // 限制base标签的URI
        "form-action 'self'", // 限制表单提交
        "object-src 'none'", // 禁止object、embed等标签
        "upgrade-insecure-requests" // 自动升级HTTP到HTTPS
    ].join('; ');
    res.setHeader('Content-Security-Policy', csp);
    
    // 设置缓存控制（替代Expires头部）
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 缓存1小时
    
    next();
});

// 中间件
// CORS配置：支持自定义域名和Vercel默认域名
const allowedOrigins = [
    'https://dufengyun.xyz',
    'https://www.dufengyun.xyz',
    /^https:\/\/.*\.vercel\.app$/  // Vercel默认域名（包括所有子域名）
];

app.use(cors({
    origin: function (origin, callback) {
        // 允许没有origin的请求（如移动应用、Postman等）
        if (!origin) return callback(null, true);
        
        // 检查是否在允许列表中
        const isAllowed = allowedOrigins.some(allowed => {
            if (typeof allowed === 'string') {
                return origin === allowed;
            } else if (allowed instanceof RegExp) {
                return allowed.test(origin);
            }
            return false;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            // 开发环境允许所有来源
            if (process.env.NODE_ENV !== 'production') {
                callback(null, true);
            } else {
                callback(new Error('不允许的CORS来源'));
            }
        }
    },
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// API路由
app.use('/api/diaries', diaryRoutes);
app.use('/api/treehole', treeholeRoutes);

// 根路径返回index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: '服务器内部错误'
    });
});

// 启动服务器
const PORT = process.env.PORT || 3000;

if (require.main === module) {
    // 初始化邮件系统
    initTransporter();
    
    // 验证邮件连接（异步，不阻塞服务器启动）
    verifyConnection().catch(err => {
        console.log('邮件系统将在配置完成后可用');
    });
    
    app.listen(PORT, () => {
        console.log(`服务器运行在 http://localhost:${PORT}`);
    });
}

module.exports = app;

