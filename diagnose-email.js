// 邮件发送诊断工具
require('dotenv').config();
const { sendTreeholeEmail } = require('./backend/utils/emailService');

async function diagnoseEmail() {
    console.log('=== 邮件发送诊断工具 ===\n');
    
    // 1. 检查环境变量
    console.log('1. 检查环境变量:');
    console.log('   SMTP_HOST:', process.env.SMTP_HOST || '未设置（将使用默认值: smtp.qq.com）');
    console.log('   SMTP_PORT:', process.env.SMTP_PORT || '未设置（将使用默认值: 465）');
    console.log('   SMTP_USER:', process.env.SMTP_USER || '❌ 未设置');
    console.log('   SMTP_PASS:', process.env.SMTP_PASS ? '✅ 已设置（长度: ' + process.env.SMTP_PASS.length + '）' : '❌ 未设置');
    console.log('   RECIPIENT_EMAIL:', process.env.RECIPIENT_EMAIL || '❌ 未设置');
    console.log('   SMTP_IP:', process.env.SMTP_IP || '未设置（将使用备用IP）');
    console.log('');
    
    // 2. 检查必要的环境变量
    const missingVars = [];
    if (!process.env.SMTP_USER) missingVars.push('SMTP_USER');
    if (!process.env.SMTP_PASS) missingVars.push('SMTP_PASS');
    if (!process.env.RECIPIENT_EMAIL) missingVars.push('RECIPIENT_EMAIL');
    
    if (missingVars.length > 0) {
        console.log('❌ 缺少必要的环境变量:', missingVars.join(', '));
        console.log('请检查 .env 文件或Vercel环境变量配置\n');
        return;
    }
    
    // 3. 测试发送邮件
    console.log('2. 测试发送邮件:');
    console.log('   发送测试邮件到:', process.env.RECIPIENT_EMAIL);
    console.log('');
    
    try {
        const testContent = '这是一封测试邮件，用于诊断邮件发送功能。发送时间: ' + new Date().toLocaleString('zh-CN');
        console.log('   邮件内容:', testContent);
        console.log('');
        console.log('   正在发送...');
        
        const result = await sendTreeholeEmail(testContent);
        
        if (result) {
            console.log('   ✅ 邮件发送成功！');
            console.log('   请检查邮箱:', process.env.RECIPIENT_EMAIL);
        } else {
            console.log('   ❌ 邮件发送失败（返回false）');
        }
    } catch (error) {
        console.log('   ❌ 邮件发送失败:');
        console.log('   错误代码:', error.code || 'N/A');
        console.log('   错误消息:', error.message);
        console.log('   错误堆栈:', error.stack);
        console.log('');
        
        // 详细错误分析
        console.log('3. 错误分析:');
        if (error.code === 'EAUTH') {
            console.log('   ⚠️  认证失败:');
            console.log('      - 请检查SMTP_USER是否正确');
            console.log('      - 请检查SMTP_PASS（授权码）是否正确');
            console.log('      - 授权码不是QQ登录密码，需要在QQ邮箱设置中生成');
        } else if (error.code === 'ECONNECTION') {
            console.log('   ⚠️  连接失败:');
            console.log('      - 请检查SMTP_HOST和SMTP_PORT配置');
            console.log('      - 可能是DNS解析问题或网络问题');
            console.log('      - 尝试使用SMTP_IP环境变量直接指定IP地址');
        } else if (error.code === 'ETIMEDOUT') {
            console.log('   ⚠️  连接超时:');
            console.log('      - 网络连接可能有问题');
            console.log('      - 服务器可能无法访问SMTP服务器');
        } else if (error.message.includes('DNS') || error.message.includes('DNS解析')) {
            console.log('   ⚠️  DNS解析失败:');
            console.log('      - 这是Vercel serverless环境的DNS限制');
            console.log('      - 代码已配置使用备用IP地址，应该能自动处理');
            console.log('      - 如果仍然失败，请检查备用IP地址是否正确');
        } else {
            console.log('   ⚠️  未知错误:');
            console.log('      - 请查看上面的错误消息和堆栈');
            console.log('      - 检查所有环境变量是否正确配置');
        }
    }
    
    console.log('\n=== 诊断完成 ===');
}

diagnoseEmail().catch(console.error);

