const { MongoClient } = require('mongodb');

let client = null;
let db = null;

// MongoDB连接字符串（从环境变量获取，如果没有则使用本地存储）
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'xiaokuixing_diary';

// 初始化数据库连接
async function initDatabase() {
    try {
        // 如果没有MongoDB URI，使用JSON文件存储（备选方案）
        if (!process.env.MONGODB_URI || process.env.MONGODB_URI === 'mongodb://localhost:27017') {
            console.log('使用JSON文件存储（MongoDB未配置）');
            return null;
        }

        if (!client) {
            client = new MongoClient(MONGODB_URI);
            await client.connect();
            db = client.db(DB_NAME);
            console.log('MongoDB连接成功');
        }
        return db;
    } catch (error) {
        console.error('MongoDB连接失败，使用JSON文件存储:', error.message);
        return null;
    }
}

// 获取数据库实例
async function getDatabase() {
    if (!db) {
        await initDatabase();
    }
    return db;
}

// 关闭数据库连接
async function closeDatabase() {
    if (client) {
        await client.close();
        client = null;
        db = null;
        console.log('MongoDB连接已关闭');
    }
}

module.exports = {
    initDatabase,
    getDatabase,
    closeDatabase
};

