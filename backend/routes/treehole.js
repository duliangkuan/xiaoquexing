const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');
const storage = require('../config/storage');
const { sendTreeholeNotification } = require('../utils/email');

// 发送树洞倾诉
router.post('/send', async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.json({
                success: false,
                message: '倾诉内容不能为空'
            });
        }

        const log = {
            content: content.trim(),
            sent_at: new Date()
        };

        // 尝试使用MongoDB
        const db = await getDatabase();
        
        if (db) {
            const collection = db.collection('treehole_logs');
            await collection.insertOne(log);
        } else {
            // 使用JSON文件存储
            const logs = storage.readTreehole();
            logs.push({
                ...log,
                id: logs.length + 1
            });
            storage.writeTreehole(logs);
        }

        // 发送邮件通知（异步，不阻塞响应）
        sendTreeholeNotification(content).catch(err => {
            console.error('邮件发送失败（不影响主流程）:', err.message);
        });

        res.json({
            success: true,
            message: '已成功倾诉'
        });
    } catch (error) {
        console.error('发送树洞错误:', error);
        res.json({
            success: false,
            message: '发送失败，请重试'
        });
    }
});

module.exports = router;

