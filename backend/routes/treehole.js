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
            console.log('邮件发送成功');
        } catch (emailError) {
            console.error('邮件发送失败:', emailError);
            
            // 构建详细的错误信息
            let errorMessage = '邮件发送失败';
            
            if (emailError.message) {
                if (emailError.message.includes('邮件服务未配置')) {
                    errorMessage = '邮件服务未配置，请检查环境变量设置';
                } else if (emailError.code === 'EAUTH') {
                    errorMessage = '邮件认证失败，请检查SMTP_USER和SMTP_PASS配置';
                } else if (emailError.code === 'ECONNECTION') {
                    errorMessage = '无法连接到邮件服务器，请检查SMTP_HOST和SMTP_PORT配置';
                } else if (emailError.message.includes('Invalid login')) {
                    errorMessage = '邮箱登录失败，请检查授权码是否正确';
                } else {
                    errorMessage = `邮件发送失败: ${emailError.message}`;
                }
            }
            
            // 返回错误信息给用户
            return res.json({
                success: false,
                message: errorMessage
            });
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

