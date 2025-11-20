const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const diaryRoutes = require('./backend/routes/diaries');
const treeholeRoutes = require('./backend/routes/treehole');

const app = express();

// 中间件
app.use(cors());
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

