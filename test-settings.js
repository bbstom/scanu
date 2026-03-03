// 测试设置是否保存到数据库
// 在服务器上运行: node test-settings.js

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://root:Ubuntu123!@172.16.254.100:27017/crypto-wallet-explorer?authSource=admin';

async function testSettings() {
  try {
    console.log('连接 MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 连接成功');

    // 查询所有设置
    const Settings = mongoose.model('Settings', new mongoose.Schema({
      key: String,
      value: String,
      description: String,
      updatedAt: Date,
    }));

    console.log('\n查询所有设置:');
    const settings = await Settings.find({});
    
    if (settings.length === 0) {
      console.log('❌ 数据库中没有任何设置');
    } else {
      console.log(`✅ 找到 ${settings.length} 个设置:\n`);
      settings.forEach(s => {
        console.log(`  ${s.key}: ${s.value}`);
        if (s.description) console.log(`    描述: ${s.description}`);
        console.log('');
      });
    }

    // 查询特定设置
    console.log('\n查询网站名称设置:');
    const siteName = await Settings.findOne({ key: 'SITE_NAME' });
    if (siteName) {
      console.log(`✅ SITE_NAME = "${siteName.value}"`);
    } else {
      console.log('❌ 未找到 SITE_NAME 设置');
    }

    const logoText = await Settings.findOne({ key: 'SITE_LOGO_TEXT' });
    if (logoText) {
      console.log(`✅ SITE_LOGO_TEXT = "${logoText.value}"`);
    } else {
      console.log('❌ 未找到 SITE_LOGO_TEXT 设置');
    }

    await mongoose.disconnect();
    console.log('\n✅ 测试完成');
  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

testSettings();
