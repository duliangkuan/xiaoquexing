const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');
const storage = require('../config/storage');
const { sendTreeholeEmail } = require('../utils/emailService');

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

        // 发送邮件
        try {
            await sendTreeholeEmail(content.trim());
        } catch (emailError) {
            console.error('邮件发送失败，但已保存记录:', emailError);
            // 即使邮件发送失败，也返回成功（因为已经保存到数据库）
            // 如果需要严格要求邮件发送成功，可以取消下面的注释
            // return res.json({
            //     success: false,
            //     message: '邮件发送失败，请检查配置'
            // });
        }

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

