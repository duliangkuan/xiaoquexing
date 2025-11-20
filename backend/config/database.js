const { MongoClient } = require('mongodb');

let client = null;
let db = null;
let isConnecting = false;

// MongoDB连接字符串（从环境变量获取，如果没有则使用本地存储）
// 支持多种环境变量名：
// 1. MONGODB_URI - 手动配置的MongoDB连接字符串
// 2. MONGODB_URL - Vercel数据库集成创建的（如果前缀是MONGODB）
// 3. STORAGE_URL - Vercel数据库集成创建的（如果前缀是STORAGE）
const MONGODB_URI = process.env.MONGODB_URI || 
                    process.env.MONGODB_URL || 
                    process.env.STORAGE_URL || 
                    'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'xiaokuixing_diary';

// 初始化数据库连接（优化serverless环境）
async function initDatabase() {
    try {
        // 如果没有MongoDB URI，使用JSON文件存储（备选方案）
        if (!process.env.MONGODB_URI || process.env.MONGODB_URI === 'mongodb://localhost:27017') {
            console.log('使用JSON文件存储（MongoDB未配置）');
            return null;
        }

        // 如果已经有连接，直接返回
        if (db && client) {
            return db;
        }

        // 如果正在连接中，等待连接完成
        if (isConnecting) {
            while (isConnecting) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            if (db && client) {
                return db;
            }
        }

        // 创建新连接
        isConnecting = true;
        try {
            // 在serverless环境中，重用连接很重要
            // 使用连接池配置优化性能
            client = new MongoClient(MONGODB_URI, {
                maxPoolSize: 10,
                minPoolSize: 1,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            
            await client.connect();
            db = client.db(DB_NAME);
            console.log('MongoDB连接成功');
            return db;
        } finally {
            isConnecting = false;
        }
    } catch (error) {
        isConnecting = false;
        console.error('MongoDB连接失败，使用JSON文件存储:', error.message);
        // 清理失败的连接
        if (client) {
            try {
                await client.close();
            } catch (e) {
                // 忽略关闭错误
            }
            client = null;
            db = null;
        }
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

