require('dotenv').config();

// 邮件配置
const emailConfig = {
    // SMTP服务器配置
    host: process.env.SMTP_HOST || 'smtp.qq.com', // 默认使用QQ邮箱SMTP
    port: parseInt(process.env.SMTP_PORT || '587'), // 587为TLS端口，465为SSL端口
    secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
    
    // 认证信息
    auth: {
        user: process.env.SMTP_USER || '', // 发送邮件的邮箱地址
        pass: process.env.SMTP_PASS || ''  // 邮箱授权码（不是登录密码）
    },
    
    // 默认发件人信息
    from: process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@example.com',
    
    // 默认收件人（用于接收通知）
    to: process.env.EMAIL_TO || process.env.SMTP_USER || '',
    
    // 邮件服务商配置提示
    // QQ邮箱: smtp.qq.com, port: 587, secure: false
    // 163邮箱: smtp.163.com, port: 465, secure: true
    // Gmail: smtp.gmail.com, port: 587, secure: false
    // Outlook: smtp-mail.outlook.com, port: 587, secure: false
};

// 验证配置是否完整
function validateConfig() {
    const required = ['SMTP_USER', 'SMTP_PASS'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.warn(`⚠️  邮件配置不完整，缺少环境变量: ${missing.join(', ')}`);
        console.warn('   请在 .env 文件中配置以下变量:');
        console.warn('   SMTP_HOST=smtp.qq.com');
        console.warn('   SMTP_PORT=587');
        console.warn('   SMTP_SECURE=false');
        console.warn('   SMTP_USER=your-email@qq.com');
        console.warn('   SMTP_PASS=your-email-auth-code');
        console.warn('   EMAIL_FROM=your-email@qq.com (可选，默认使用SMTP_USER)');
        console.warn('   EMAIL_TO=recipient@example.com (可选，默认使用SMTP_USER)');
        return false;
    }
    return true;
}

module.exports = {
    emailConfig,
    validateConfig
};

