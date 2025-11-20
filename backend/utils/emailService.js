const nodemailer = require('nodemailer');
const dns = require('dns');
const dnsPromises = require('dns').promises;

// IP地址缓存（避免每次都要解析DNS）
let ipCache = {
    hostname: null,
    ip: null,
    timestamp: 0
};
const CACHE_DURATION = 3600000; // 缓存1小时

// 预先解析 DNS（用于解决 serverless 环境的 DNS 问题）
async function resolveHostname(hostname) {
    try {
        // 先检查缓存
        const now = Date.now();
        if (ipCache.hostname === hostname && 
            ipCache.ip && 
            (now - ipCache.timestamp) < CACHE_DURATION) {
            console.log(`使用缓存的IP地址: ${hostname} -> ${ipCache.ip}`);
            return ipCache.ip;
        }

        // 尝试多种DNS解析方法
        let addresses = [];
        
        // 方法1: 使用 resolve4
        try {
            addresses = await dnsPromises.resolve4(hostname);
        } catch (e) {
            console.warn('resolve4失败，尝试lookup方法:', e.message);
        }

        // 方法2: 如果resolve4失败，使用lookup
        if (!addresses || addresses.length === 0) {
            try {
                const result = await dnsPromises.lookup(hostname, { family: 4 });
                addresses = [result.address];
            } catch (e) {
                console.warn('lookup也失败:', e.message);
            }
        }

        if (addresses && addresses.length > 0) {
            const ip = addresses[0];
            console.log(`DNS解析成功: ${hostname} -> ${ip}`);
            // 更新缓存
            ipCache = {
                hostname: hostname,
                ip: ip,
                timestamp: now
            };
            return ip;
        }
    } catch (error) {
        console.warn(`DNS解析失败: ${hostname}`, error.message);
    }
    return null;
}

// 创建邮件传输器（支持使用IP地址）
function createTransporter(smtpIp = null) {
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
        host: smtpIp || smtpHost, // 如果提供了IP，使用IP；否则使用域名
        port: smtpPort,
        secure: smtpSecure, // true for 465, false for other ports
        auth: {
            user: smtpUser,
            pass: smtpPass // 使用授权码，不是QQ密码
        }
    };

    // 如果使用IP地址，需要设置hostname用于TLS验证
    if (smtpIp) {
        transporterConfig.name = smtpHost; // 用于SNI
        transporterConfig.hostname = smtpHost; // 用于TLS证书验证
    }

    // 如果使用587端口，需要配置TLS
    if (smtpPort === 587) {
        transporterConfig.requireTLS = true;
        transporterConfig.tls = {
            rejectUnauthorized: false,
            servername: smtpHost // 指定服务器名称用于TLS
        };
    }

    // 对于 465 端口，也配置 TLS
    if (smtpPort === 465) {
        transporterConfig.tls = {
            rejectUnauthorized: false,
            servername: smtpHost // 指定服务器名称用于TLS
        };
    }

    return nodemailer.createTransport(transporterConfig);
}

// 发送树洞倾诉邮件
async function sendTreeholeEmail(content) {
    // 先检查基本配置
    const recipientEmail = process.env.RECIPIENT_EMAIL;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    
    if (!recipientEmail || !smtpUser || !smtpPass) {
        const missing = [];
        if (!smtpUser) missing.push('SMTP_USER');
        if (!smtpPass) missing.push('SMTP_PASS');
        if (!recipientEmail) missing.push('RECIPIENT_EMAIL');
        throw new Error(`邮件服务未配置，缺少环境变量: ${missing.join(', ')}`);
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

    const smtpHost = process.env.SMTP_HOST || 'smtp.qq.com';
    const maxRetries = 3;
    let lastError = null;

    // 重试发送邮件
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`尝试发送邮件 (第 ${attempt}/${maxRetries} 次)...`);
            
            // 先尝试解析 DNS 获取 IP 地址
            let smtpIp = null;
            try {
                smtpIp = await resolveHostname(smtpHost);
                if (smtpIp) {
                    console.log(`使用IP地址连接: ${smtpIp}`);
                } else {
                    console.warn('DNS解析失败，将使用域名连接');
                }
            } catch (dnsError) {
                console.warn('DNS预解析失败，将使用域名连接:', dnsError.message);
            }

            // 创建传输器（优先使用IP地址）
            const transporter = createTransporter(smtpIp);
            
            if (!transporter) {
                const missing = [];
                if (!process.env.SMTP_USER) missing.push('SMTP_USER');
                if (!process.env.SMTP_PASS) missing.push('SMTP_PASS');
                if (!process.env.RECIPIENT_EMAIL) missing.push('RECIPIENT_EMAIL');
                throw new Error(`邮件服务未配置，缺少环境变量: ${missing.join(', ')}`);
            }
            
            // 发送邮件
            const info = await transporter.sendMail(mailOptions);
            console.log('邮件发送成功:', info.messageId);
            console.log('收件人:', recipientEmail);
            return true;
            
        } catch (error) {
            lastError = error;
            console.error(`第 ${attempt} 次尝试失败:`);
            console.error('错误代码:', error.code);
            console.error('错误消息:', error.message);
            
            // 如果是DNS相关错误且还有重试机会，等待后重试
            const isDnsError = error.code === 'EBADNAME' || 
                             error.code === 'ENOTFOUND' || 
                             error.message.includes('EBADNAME') || 
                             error.message.includes('ENOTFOUND') ||
                             error.message.includes('queryA') ||
                             error.message.includes('DNS解析失败');
            
            if (isDnsError && attempt < maxRetries) {
                // 清除IP缓存，强制重新解析
                ipCache = { hostname: null, ip: null, timestamp: 0 };
                const waitTime = attempt * 1000; // 递增等待时间：1s, 2s, 3s
                console.log(`DNS错误，等待 ${waitTime}ms 后重试...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }
            
            // 如果不是DNS错误，或者已经重试完，直接抛出错误
            if (!isDnsError || attempt === maxRetries) {
                break;
            }
        }
    }

    // 所有重试都失败，提供详细的错误信息
    console.error('邮件发送失败详情:');
    console.error('错误代码:', lastError.code);
    console.error('错误消息:', lastError.message);
    console.error('响应:', lastError.response);
    
    // 提供更详细的错误信息
    if (lastError.code === 'EAUTH') {
        lastError.message = '邮箱认证失败，请检查SMTP_USER和SMTP_PASS（授权码）是否正确';
    } else if (lastError.code === 'ECONNECTION') {
        lastError.message = `无法连接到邮件服务器 ${smtpHost}:${process.env.SMTP_PORT}，请检查网络和服务器配置`;
    } else if (lastError.code === 'ETIMEDOUT') {
        lastError.message = '邮件服务器连接超时，请检查网络连接';
    } else if (lastError.code === 'EBADNAME' || lastError.message.includes('EBADNAME') || lastError.message.includes('queryA')) {
        lastError.message = 'DNS解析失败，无法解析SMTP服务器地址。这可能是serverless环境的DNS限制，已重试多次仍失败，请稍后重试或联系管理员';
    } else if (lastError.code === 'ENOTFOUND' || lastError.message.includes('ENOTFOUND')) {
        lastError.message = '无法找到SMTP服务器，请检查SMTP_HOST配置是否正确';
    }
    
    throw lastError;
}

module.exports = {
    sendTreeholeEmail
};

