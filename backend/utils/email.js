const nodemailer = require('nodemailer');
const dns = require('dns').promises;
const { emailConfig, validateConfig } = require('../config/email');

// 创建邮件传输器
let transporter = null;

// DNS解析缓存
let dnsCache = null;
const DNS_CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存
let dnsCacheTime = 0;

// 预解析DNS（解决serverless环境DNS问题）
async function resolveDNS(hostname, retries = 3) {
    // 检查缓存
    const now = Date.now();
    if (dnsCache && (now - dnsCacheTime) < DNS_CACHE_TTL) {
        return dnsCache;
    }
    
    for (let i = 0; i < retries; i++) {
        try {
            const addresses = await Promise.race([
                dns.resolve4(hostname),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('DNS解析超时')), 5000)
                )
            ]);
            
            if (addresses && addresses.length > 0) {
                dnsCache = addresses[0];
                dnsCacheTime = now;
                console.log(`✅ DNS解析成功: ${hostname} -> ${dnsCache}`);
                return dnsCache;
            }
        } catch (error) {
            console.warn(`⚠️ DNS解析尝试 ${i + 1}/${retries} 失败:`, error.message);
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }
    
    // DNS解析失败，返回null，让nodemailer使用默认DNS
    console.warn(`⚠️ DNS解析失败，将使用默认DNS解析: ${hostname}`);
    return null;
}

// 初始化邮件传输器
async function initTransporter() {
    if (!validateConfig()) {
        return null;
    }
    
    try {
        // 在serverless环境中预解析DNS
        let resolvedHost = emailConfig.host;
        try {
            const ip = await resolveDNS(emailConfig.host);
            // 注意：nodemailer不支持直接使用IP，所以我们仍然使用域名
            // 但预解析可以确保DNS缓存可用
        } catch (error) {
            console.warn('DNS预解析失败，继续使用域名:', error.message);
        }
        
        transporter = nodemailer.createTransport({
            host: resolvedHost,
            port: emailConfig.port,
            secure: emailConfig.secure,
            auth: emailConfig.auth,
            // 添加连接选项，提高serverless环境兼容性
            connectionTimeout: 10000, // 10秒连接超时
            greetingTimeout: 10000,   // 10秒问候超时
            socketTimeout: 10000,     // 10秒socket超时
            // 使用自定义lookup函数，提高serverless环境兼容性
            lookup: (hostname, options, callback) => {
                // 优先使用dns.lookup（更兼容serverless环境）
                dns.lookup(hostname, options, (err, address, family) => {
                    if (err) {
                        // 如果lookup失败，尝试resolve4
                        dns.resolve4(hostname).then(addresses => {
                            if (addresses && addresses.length > 0) {
                                callback(null, addresses[0], 4);
                            } else {
                                callback(err); // 返回原始错误
                            }
                        }).catch(() => {
                            callback(err); // 返回原始错误
                        });
                    } else {
                        callback(null, address, family);
                    }
                });
            }
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
        transporter = await initTransporter();
    }
    
    if (!transporter) {
        return false;
    }
    
    try {
        await Promise.race([
            transporter.verify(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('连接验证超时')), 10000)
            )
        ]);
        console.log('✅ 邮件服务器连接验证成功');
        return true;
    } catch (error) {
        console.error('❌ 邮件服务器连接验证失败:', error.message);
        return false;
    }
}

// 发送邮件（带重试机制）
async function sendEmail(options, retries = 2) {
    if (!transporter) {
        transporter = await initTransporter();
    }
    
    if (!transporter) {
        const errorMsg = '邮件传输器未初始化，请检查邮件配置';
        console.error('❌', errorMsg);
        return {
            success: false,
            error: errorMsg,
            message: '邮件发送失败：配置错误'
        };
    }
    
    const mailOptions = {
        from: options.from || emailConfig.from,
        to: options.to || emailConfig.to,
        subject: options.subject || '通知邮件',
        text: options.text || '',
        html: options.html || options.text || ''
    };
    
    // 重试机制
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // 每次重试前重新初始化传输器（解决DNS缓存问题）
            if (attempt > 0) {
                console.log(`🔄 邮件发送重试 ${attempt}/${retries}...`);
                transporter = await initTransporter();
                if (!transporter) {
                    throw new Error('无法重新初始化邮件传输器');
                }
                // 等待一段时间再重试
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
            
            const info = await Promise.race([
                transporter.sendMail(mailOptions),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('邮件发送超时')), 15000)
                )
            ]);
            
            console.log('✅ 邮件发送成功:', info.messageId);
            return {
                success: true,
                messageId: info.messageId,
                message: '邮件发送成功'
            };
        } catch (error) {
            const errorMsg = error.message || '未知错误';
            const isDNSError = errorMsg.includes('ENOTFOUND') || 
                              errorMsg.includes('DNS') || 
                              errorMsg.includes('getaddrinfo') ||
                              errorMsg.includes('解析');
            
            console.error(`❌ 邮件发送失败 (尝试 ${attempt + 1}/${retries + 1}):`, errorMsg);
            
            // 如果是DNS错误且还有重试机会
            if (isDNSError && attempt < retries) {
                // 清除DNS缓存，强制重新解析
                dnsCache = null;
                dnsCacheTime = 0;
                continue;
            }
            
            // 最后一次尝试失败
            if (attempt === retries) {
                // 静默失败，不抛出错误，只记录日志
                console.warn('⚠️ 邮件发送最终失败:', errorMsg);
                return {
                    success: false,
                    error: errorMsg,
                    message: isDNSError 
                        ? '邮件发送失败（DNS解析问题，serverless环境限制）'
                        : '邮件发送失败'
                };
            }
        }
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

