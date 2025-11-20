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

// QQ邮箱SMTP备用IP地址（如果DNS解析失败）
// 注意：这些IP地址可能会变化，如果连接失败，需要查找最新的IP地址
// QQ邮箱SMTP服务器的IP地址通常是腾讯的服务器，可能会动态变化
const QQ_SMTP_IPS = [
    '140.249.11.194',  // QQ邮箱SMTP常见IP（优先使用）
    '163.177.90.124',  // 备用IP
    '14.17.57.61'      // 备用IP
];

// 预先解析 DNS（用于解决 serverless 环境的 DNS 问题）
async function resolveHostname(hostname) {
    try {
        // 如果环境变量中配置了SMTP_IP，直接使用
        if (process.env.SMTP_IP) {
            console.log(`使用环境变量配置的IP地址: ${process.env.SMTP_IP}`);
            return process.env.SMTP_IP;
        }

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
        
        // 方法1: 使用 resolve4（尝试指定DNS服务器）
        try {
            // 使用Google DNS服务器解析
            dnsPromises.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
            addresses = await dnsPromises.resolve4(hostname);
        } catch (e) {
            console.warn('resolve4失败，尝试lookup方法:', e.message);
        }

        // 方法2: 如果resolve4失败，使用lookup
        if (!addresses || addresses.length === 0) {
            try {
                const result = await dnsPromises.lookup(hostname, { 
                    family: 4,
                    hints: dns.ADDRCONFIG
                });
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
    
    // 如果所有DNS解析方法都失败，且是QQ邮箱，返回备用IP
    if (hostname === 'smtp.qq.com') {
        console.warn('DNS解析失败，返回QQ邮箱备用IP地址');
        return QQ_SMTP_IPS[0];
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
        },
        // 在serverless环境中，优化连接配置
        connectionTimeout: 10000, // 10秒连接超时
        greetingTimeout: 5000, // 5秒问候超时
        socketTimeout: 10000, // 10秒Socket超时
        disableFileAccess: true, // 禁用文件访问
        disableUrlAccess: true // 禁用URL访问
    };

    // 如果使用IP地址，需要设置hostname用于TLS验证，并完全禁用DNS查找
    if (smtpIp) {
        transporterConfig.name = smtpHost; // 用于SNI
        transporterConfig.hostname = smtpHost; // 用于TLS证书验证
        // 使用自定义lookup函数，直接返回IP地址，完全避免DNS解析
        transporterConfig.lookup = function(hostname, options, callback) {
            // 直接使用IP地址，不进行任何DNS查找
            console.log(`[自定义lookup] 跳过DNS解析，直接返回IP地址: ${smtpIp} (原始hostname: ${hostname})`);
            // 使用setImmediate确保异步执行
            setImmediate(() => {
                callback(null, smtpIp, 4); // 返回IP地址和IPv4类型
            });
        };
        console.log(`[Transporter配置] 使用IP地址连接: ${smtpIp}，TLS主机名: ${smtpHost}`);
        // 强制使用IP地址，避免任何DNS查找
        transporterConfig.resolveHostname = false;
        // 确保nodemailer不会尝试解析主机名
        transporterConfig.requireTLS = false; // 使用secure时不需要requireTLS
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
            rejectUnauthorized: false, // 在serverless环境中可能需要关闭证书验证
            servername: smtpHost, // 指定服务器名称用于TLS证书验证
            // 如果使用IP地址，确保TLS使用正确的主机名
            ...(smtpIp ? {
                host: smtpHost, // TLS握手时使用域名而不是IP
                checkServerIdentity: () => undefined // 跳过服务器身份检查，避免DNS问题
            } : {})
        };
        console.log(`[TLS配置] 465端口，servername: ${smtpHost}，使用IP: ${smtpIp || '否'}`);
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
            
            // 获取SMTP IP地址（优先使用备用IP，避免DNS解析问题）
            let smtpIp = null;
            
            // 策略1: 优先使用环境变量配置的IP
            if (process.env.SMTP_IP) {
                smtpIp = process.env.SMTP_IP;
                console.log(`使用环境变量配置的IP地址: ${smtpIp}`);
            } 
            // 策略2: 如果是QQ邮箱，直接使用备用IP（避免DNS解析）
            else if (smtpHost === 'smtp.qq.com') {
                // 在serverless环境中，直接使用备用IP，完全跳过DNS解析
                // 根据重试次数选择不同的IP地址
                const ipIndex = Math.min(attempt - 1, QQ_SMTP_IPS.length - 1);
                smtpIp = QQ_SMTP_IPS[ipIndex];
                console.log(`使用QQ邮箱备用IP地址（完全跳过DNS解析）: ${smtpIp} (第${ipIndex + 1}个IP，尝试${attempt}/${maxRetries})`);
            }
            // 策略3: 其他邮箱，尝试DNS解析（带超时）
            else {
                try {
                    // 设置DNS解析超时（3秒）
                    const dnsPromise = resolveHostname(smtpHost);
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('DNS解析超时')), 3000)
                    );
                    smtpIp = await Promise.race([dnsPromise, timeoutPromise]);
                    if (smtpIp) {
                        console.log(`使用DNS解析的IP地址: ${smtpIp}`);
                    } else {
                        console.warn('DNS解析失败，将使用域名连接');
                    }
                } catch (dnsError) {
                    console.warn('DNS解析失败，将使用域名连接:', dnsError.message);
                    // DNS解析失败时，不使用IP，直接使用域名
                    smtpIp = null;
                }
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
            console.log(`[发送邮件] 开始发送邮件到: ${recipientEmail}`);
            console.log(`[发送邮件] 使用SMTP服务器: ${smtpIp ? smtpIp + ' (IP)' : smtpHost + ' (域名)'}:${process.env.SMTP_PORT || '465'}`);
            
            const info = await transporter.sendMail(mailOptions);
            console.log('[发送邮件] ✅ 邮件发送成功!');
            console.log('[发送邮件] MessageId:', info.messageId);
            console.log('[发送邮件] 收件人:', recipientEmail);
            console.log('[发送邮件] 响应:', info.response);
            return true;
            
        } catch (error) {
            lastError = error;
            console.error(`[发送邮件] ❌ 第 ${attempt}/${maxRetries} 次尝试失败`);
            console.error('[错误详情] 错误代码:', error.code || 'N/A');
            console.error('[错误详情] 错误消息:', error.message);
            console.error('[错误详情] 错误堆栈:', error.stack);
            if (error.response) {
                console.error('[错误详情] SMTP响应:', error.response);
            }
            if (error.responseCode) {
                console.error('[错误详情] SMTP响应代码:', error.responseCode);
            }
            if (error.command) {
                console.error('[错误详情] 失败的SMTP命令:', error.command);
            }
            
            // 判断是否是DNS相关错误
            const isDnsError = error.code === 'EBADNAME' || 
                             error.code === 'ENOTFOUND' || 
                             error.code === 'ETIMEDOUT' ||
                             error.message.includes('EBADNAME') || 
                             error.message.includes('ENOTFOUND') ||
                             error.message.includes('queryA') ||
                             error.message.includes('DNS解析失败') ||
                             error.message.includes('getaddrinfo') ||
                             error.message.includes('timed out');
            
            // 如果是DNS错误且还有重试机会
            if (isDnsError && attempt < maxRetries) {
                // 如果是QQ邮箱且还没有使用IP地址，下次尝试使用备用IP
                if (smtpHost === 'smtp.qq.com' && !smtpIp) {
                    console.log('DNS错误，下次尝试将使用备用IP地址');
                    // 下次循环会自动使用备用IP
                }
                
                // 清除IP缓存，强制重新解析
                ipCache = { hostname: null, ip: null, timestamp: 0 };
                const waitTime = attempt * 2000; // 递增等待时间：2s, 4s, 6s
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

