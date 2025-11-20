const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const diaryRoutes = require('./backend/routes/diaries');
const treeholeRoutes = require('./backend/routes/treehole');

const app = express();

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
    app.listen(PORT, () => {
        console.log(`服务器运行在 http://localhost:${PORT}`);
    });
}

module.exports = app;

