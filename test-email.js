require('dotenv').config();
const { initTransporter, verifyConnection } = require('./backend/utils/email');

async function testEmail() {
    console.log('正在初始化邮件传输器...');
    const transporter = initTransporter();
    
    if (!transporter) {
        console.log('邮件传输器初始化失败，请检查配置');
        process.exit(1);
    }
    
    console.log('正在验证邮件服务器连接...');
    const result = await verifyConnection();
    
    if (result) {
        console.log('✅ 邮件配置验证成功！');
        process.exit(0);
    } else {
        console.log('❌ 邮件配置验证失败，请检查配置信息');
        process.exit(1);
    }
}

testEmail().catch(err => {
    console.error('❌ 验证出错:', err.message);
    process.exit(1);
});

