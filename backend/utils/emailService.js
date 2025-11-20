const nodemailer = require('nodemailer');

// 创建邮件传输器
function createTransporter() {
    const smtpHost = process.env.SMTP_HOST || 'smtp.qq.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '465');
    const smtpSecure = smtpPort === 465; // 465端口使用SSL，587端口使用TLS
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const recipientEmail = process.env.RECIPIENT_EMAIL;

    if (!smtpUser || !smtpPass || !recipientEmail) {
        console.warn('邮件配置不完整，邮件功能将不可用');
        console.warn('缺少的配置:', {
            SMTP_USER: !smtpUser,
            SMTP_PASS: !smtpPass,
            RECIPIENT_EMAIL: !recipientEmail
        });
        return null;
    }

    const transporterConfig = {
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure, // true for 465, false for other ports
        auth: {
            user: smtpUser,
            pass: smtpPass // 使用授权码，不是QQ密码
        }
    };

    // 如果使用587端口，需要配置TLS
    if (smtpPort === 587) {
        transporterConfig.requireTLS = true;
        transporterConfig.tls = {
            rejectUnauthorized: false
        };
    }

    return nodemailer.createTransport(transporterConfig);
}

// 发送树洞倾诉邮件
async function sendTreeholeEmail(content) {
    const transporter = createTransporter();
    
    if (!transporter) {
        throw new Error('邮件服务未配置');
    }

    const recipientEmail = process.env.RECIPIENT_EMAIL;
    const smtpUser = process.env.SMTP_USER;
    
    const now = new Date();
    const dateStr = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    const mailOptions = {
        from: `"树洞倾诉" <${smtpUser}>`,
        to: recipientEmail,
        subject: `树洞倾诉 - ${dateStr}`,
        text: content,
        html: `
            <div style="font-family: 'Microsoft YaHei', Arial, sans-serif; padding: 20px; background-color: #FFF5F5; border-radius: 10px;">
                <h2 style="color: #E91E63; margin-bottom: 20px;">树洞倾诉 💌</h2>
                <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #FFB6C1; white-space: pre-wrap; line-height: 1.8; color: #4A4A4A;">
                    ${content.replace(/\n/g, '<br>')}
                </div>
                <p style="color: #C97D9E; margin-top: 20px; font-size: 12px;">时间: ${dateStr}</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('邮件发送成功:', info.messageId);
        return true;
    } catch (error) {
        console.error('邮件发送失败:', error);
        throw error;
    }
}

module.exports = {
    sendTreeholeEmail
};

