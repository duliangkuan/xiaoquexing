const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');
const storage = require('../config/storage');

const DEFAULT_PASSWORD = process.env.DIARY_PASSWORD || 'admin888888';

// 保存日记
router.post('/', async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.json({
                success: false,
                message: '日记内容不能为空'
            });
        }

        const diary = {
            content: content.trim(),
            date: new Date(),
            created_at: new Date()
        };

        // 尝试使用MongoDB
        const db = await getDatabase();
        
        if (db) {
            const collection = db.collection('diaries');
            await collection.insertOne(diary);
        } else {
            // 使用JSON文件存储
            const diaries = storage.readDiaries();
            diaries.push({
                ...diary,
                id: diaries.length + 1
            });
            storage.writeDiaries(diaries);
        }

        res.json({
            success: true,
            message: '保存成功'
        });
    } catch (error) {
        console.error('保存日记错误:', error);
        res.json({
            success: false,
            message: '保存失败，请重试'
        });
    }
});

// 查看历史日记
router.post('/history', async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.json({
                success: false,
                message: '请输入密码'
            });
        }

        if (password !== DEFAULT_PASSWORD) {
            return res.json({
                success: false,
                message: '密码错误'
            });
        }

        // 尝试使用MongoDB
        const db = await getDatabase();
        let diaries = [];

        if (db) {
            const collection = db.collection('diaries');
            diaries = await collection.find({})
                .sort({ date: -1 })
                .toArray();
        } else {
            // 使用JSON文件存储
            diaries = storage.readDiaries()
                .sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        // 转换日期格式
        diaries = diaries.map(diary => ({
            id: diary._id || diary.id,
            content: diary.content,
            date: diary.date || diary.created_at
        }));

        res.json({
            success: true,
            data: diaries
        });
    } catch (error) {
        console.error('查看历史错误:', error);
        res.json({
            success: false,
            message: '查询失败，请重试'
        });
    }
});

module.exports = router;

