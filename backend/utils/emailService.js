const nodemailer = require('nodemailer');
const dns = require('dns').promises;

// 预先解析 DNS（用于解决 serverless 环境的 DNS 问题）
async function resolveHostname(hostname) {
    try {
        const addresses = await dns.resolve4(hostname);
        if (addresses && addresses.length > 0) {
            console.log(`DNS解析成功: ${hostname} -> ${addresses[0]}`);
            return addresses[0];
        }
    } catch (error) {
        console.warn(`DNS解析失败: ${hostname}`, error.message);
    }
    return null;
}

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

    // 对于 465 端口，也配置 TLS
    if (smtpPort === 465) {
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
        const missing = [];
        if (!process.env.SMTP_USER) missing.push('SMTP_USER');
        if (!process.env.SMTP_PASS) missing.push('SMTP_PASS');
        if (!process.env.RECIPIENT_EMAIL) missing.push('RECIPIENT_EMAIL');
        throw new Error(`邮件服务未配置，缺少环境变量: ${missing.join(', ')}`);
    }

    const recipientEmail = process.env.RECIPIENT_EMAIL;
    const smtpUser = process.env.SMTP_USER;
    
    if (!recipientEmail || !smtpUser) {
        throw new Error('邮件配置不完整：缺少收件人或发件人邮箱');
    }
    
    const now = new Date();
    const dateStr = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    // 转义HTML内容，防止XSS攻击
    const escapeHtml = (text) => {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    };

    const escapedContent = escapeHtml(content);

    const mailOptions = {
        from: `"树洞倾诉" <${smtpUser}>`,
        to: recipientEmail,
        subject: `树洞倾诉 - ${dateStr}`,
        text: content,
        html: `
            <div style="font-family: 'Microsoft YaHei', Arial, sans-serif; padding: 20px; background-color: #FFF5F5; border-radius: 10px;">
                <h2 style="color: #E91E63; margin-bottom: 20px;">树洞倾诉 💌</h2>
                <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #FFB6C1; white-space: pre-wrap; line-height: 1.8; color: #4A4A4A;">
                    ${escapedContent.replace(/\n/g, '<br>')}
                </div>
                <p style="color: #C97D9E; margin-top: 20px; font-size: 12px;">时间: ${dateStr}</p>
            </div>
        `
    };

    try {
        // 先尝试解析 DNS（帮助解决 serverless 环境的 DNS 问题）
        const smtpHost = process.env.SMTP_HOST || 'smtp.qq.com';
        try {
            await resolveHostname(smtpHost);
        } catch (dnsError) {
            console.warn('DNS预解析失败，但继续尝试发送邮件:', dnsError.message);
        }
        
        // 验证连接（跳过验证，直接发送，因为验证也可能触发 DNS 问题）
        // await transporter.verify();
        // console.log('SMTP服务器连接验证成功');
        
        const info = await transporter.sendMail(mailOptions);
        console.log('邮件发送成功:', info.messageId);
        console.log('收件人:', recipientEmail);
        return true;
    } catch (error) {
        console.error('邮件发送失败详情:');
        console.error('错误代码:', error.code);
        console.error('错误消息:', error.message);
        console.error('响应:', error.response);
        
        // 提供更详细的错误信息
        if (error.code === 'EAUTH') {
            error.message = '邮箱认证失败，请检查SMTP_USER和SMTP_PASS（授权码）是否正确';
        } else if (error.code === 'ECONNECTION') {
            error.message = `无法连接到邮件服务器 ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}，请检查网络和服务器配置`;
        } else if (error.code === 'ETIMEDOUT') {
            error.message = '邮件服务器连接超时，请检查网络连接';
        } else if (error.code === 'EBADNAME' || error.message.includes('EBADNAME') || error.message.includes('queryA')) {
            error.message = 'DNS解析失败，无法解析SMTP服务器地址。这可能是serverless环境的DNS限制，请稍后重试或联系管理员';
        } else if (error.code === 'ENOTFOUND' || error.message.includes('ENOTFOUND')) {
            error.message = '无法找到SMTP服务器，请检查SMTP_HOST配置是否正确';
        }
        
        throw error;
    }
}

module.exports = {
    sendTreeholeEmail
};

