/**
 * 邮件发送测试脚本
 * 用于测试QQ邮箱SMTP配置是否正确
 * 
 * 使用方法：
 * 1. 确保已创建 .env 文件并配置了邮箱信息
 * 2. 运行: node test-email.js
 */

require('dotenv').config();
const { sendTreeholeEmail } = require('./backend/utils/emailService');

async function testEmail() {
    console.log('开始测试邮件发送...\n');
    
    // 检查环境变量
    console.log('检查环境变量配置:');
    console.log('SMTP_HOST:', process.env.SMTP_HOST || '未设置');
    console.log('SMTP_PORT:', process.env.SMTP_PORT || '未设置');
    console.log('SMTP_USER:', process.env.SMTP_USER || '未设置');
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***已设置***' : '未设置');
    console.log('RECIPIENT_EMAIL:', process.env.RECIPIENT_EMAIL || '未设置');
    console.log('');

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.RECIPIENT_EMAIL) {
        console.error('❌ 错误: 邮件配置不完整！');
        console.log('\n请创建 .env 文件并配置以下变量:');
        console.log('SMTP_HOST=smtp.qq.com');
        console.log('SMTP_PORT=465');
        console.log('SMTP_USER=你的QQ邮箱');
        console.log('SMTP_PASS=你的授权码');
        console.log('RECIPIENT_EMAIL=收件人邮箱');
        process.exit(1);
    }

    const testContent = `这是一封测试邮件。

如果你收到这封邮件，说明QQ邮箱SMTP配置成功！

测试时间: ${new Date().toLocaleString('zh-CN')}

树洞功能现在可以正常工作了！💕`;

    try {
        console.log('正在发送测试邮件...');
        await sendTreeholeEmail(testContent);
        console.log('✅ 邮件发送成功！');
        console.log(`请检查邮箱 ${process.env.RECIPIENT_EMAIL} 的收件箱（包括垃圾邮件）`);
    } catch (error) {
        console.error('❌ 邮件发送失败:');
        console.error('错误信息:', error.message);
        
        if (error.response) {
            console.error('服务器响应:', error.response);
        }
        
        if (error.code === 'EAUTH') {
            console.error('\n可能的原因:');
            console.error('1. 授权码错误（注意：不是QQ登录密码）');
            console.error('2. 授权码已过期，需要重新生成');
            console.error('3. QQ邮箱未开启SMTP服务');
        }
        
        if (error.code === 'ECONNECTION') {
            console.error('\n可能的原因:');
            console.error('1. 网络连接问题');
            console.error('2. SMTP服务器地址或端口配置错误');
        }
        
        process.exit(1);
    }
}

// 运行测试
testEmail();

