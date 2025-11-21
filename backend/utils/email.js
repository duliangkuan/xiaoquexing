const nodemailer = require('nodemailer');
const { emailConfig, validateConfig } = require('../config/email');

// 创建邮件传输器
let transporter = null;

// 初始化邮件传输器
function initTransporter() {
    if (!validateConfig()) {
        return null;
    }
    
    try {
        transporter = nodemailer.createTransport({
            host: emailConfig.host,
            port: emailConfig.port,
            secure: emailConfig.secure,
            auth: emailConfig.auth
        });
        
        console.log('✅ 邮件传输器初始化成功');
        return transporter;
    } catch (error) {
        console.error('❌ 邮件传输器初始化失败:', error.message);
        return null;
    }
}

// 验证邮件配置（测试连接）
async function verifyConnection() {
    if (!transporter) {
        transporter = initTransporter();
    }
    
    if (!transporter) {
        return false;
    }
    
    try {
        await transporter.verify();
        console.log('✅ 邮件服务器连接验证成功');
        return true;
    } catch (error) {
        console.error('❌ 邮件服务器连接验证失败:', error.message);
        return false;
    }
}

// 发送邮件
async function sendEmail(options) {
    if (!transporter) {
        transporter = initTransporter();
    }
    
    if (!transporter) {
        throw new Error('邮件传输器未初始化，请检查邮件配置');
    }
    
    const mailOptions = {
        from: options.from || emailConfig.from,
        to: options.to || emailConfig.to,
        subject: options.subject || '通知邮件',
        text: options.text || '',
        html: options.html || options.text || ''
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ 邮件发送成功:', info.messageId);
        return {
            success: true,
            messageId: info.messageId,
            message: '邮件发送成功'
        };
    } catch (error) {
        console.error('❌ 邮件发送失败:', error.message);
        return {
            success: false,
            error: error.message,
            message: '邮件发送失败'
        };
    }
}

// 发送树洞通知邮件
async function sendTreeholeNotification(content) {
    const subject = '🌳 新的树洞倾诉';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .container {
                    background-color: #ffffff;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .header {
                    border-bottom: 2px solid #4a90e2;
                    padding-bottom: 15px;
                    margin-bottom: 20px;
                }
                .header h1 {
                    color: #4a90e2;
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    background-color: #f9f9f9;
                    border-left: 4px solid #4a90e2;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 4px;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e0e0e0;
                    color: #999;
                    font-size: 12px;
                    text-align: center;
                }
                .time {
                    color: #999;
                    font-size: 14px;
                    margin-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🌳 新的树洞倾诉</h1>
                </div>
                <div class="content">${content.replace(/\n/g, '<br>')}</div>
                <div class="time">时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</div>
                <div class="footer">
                    <p>这是一封来自小确幸日记网站的自动通知邮件</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    const text = `新的树洞倾诉\n\n${content}\n\n时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`;
    
    return await sendEmail({
        subject,
        html,
        text
    });
}

// 发送日记通知邮件（如果需要）
async function sendDiaryNotification(diary) {
    const subject = '📝 新的日记记录';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .container {
                    background-color: #ffffff;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .header {
                    border-bottom: 2px solid #4a90e2;
                    padding-bottom: 15px;
                    margin-bottom: 20px;
                }
                .header h1 {
                    color: #4a90e2;
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    background-color: #f9f9f9;
                    border-left: 4px solid #4a90e2;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 4px;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e0e0e0;
                    color: #999;
                    font-size: 12px;
                    text-align: center;
                }
                .time {
                    color: #999;
                    font-size: 14px;
                    margin-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📝 新的日记记录</h1>
                </div>
                <div class="content">${(diary.content || '').replace(/\n/g, '<br>')}</div>
                <div class="time">时间: ${new Date(diary.date || Date.now()).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</div>
                <div class="footer">
                    <p>这是一封来自小确幸日记网站的自动通知邮件</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    const text = `新的日记记录\n\n${diary.content || ''}\n\n时间: ${new Date(diary.date || Date.now()).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`;
    
    return await sendEmail({
        subject,
        html,
        text
    });
}

module.exports = {
    initTransporter,
    verifyConnection,
    sendEmail,
    sendTreeholeNotification,
    sendDiaryNotification
};

