// 验证教师账号密码脚本
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/models/User');
const connectDB = require('../src/config/database');

const TEACHER_ACCOUNT = '16602435950';
const TEACHER_PASSWORD = 'dyy16602435950';

async function verifyPassword() {
  try {
    // 连接数据库
    console.log('正在连接数据库...');
    await connectDB();
    console.log('✓ 数据库连接成功\n');

    // 查找用户（包含密码字段）
    const user = await User.findOne({ account: TEACHER_ACCOUNT }).select('+password');
    
    if (!user) {
      console.log('❌ 账号不存在');
      return;
    }

    console.log('='.repeat(60));
    console.log('账号信息');
    console.log('='.repeat(60));
    console.log(`账号: ${user.account}`);
    console.log(`角色: ${user.role}`);
    console.log(`手机号: ${user.phone}`);
    console.log(`是否激活: ${user.isActive}`);
    console.log(`登录失败次数: ${user.loginAttempts}`);
    console.log(`账号锁定: ${user.lockUntil ? '是' : '否'}`);
    console.log(`密码字段存在: ${user.password ? '是' : '否'}`);
    console.log(`密码长度: ${user.password ? user.password.length : 0}`);
    console.log(`密码前缀: ${user.password ? user.password.substring(0, 10) : 'N/A'}`);
    console.log('='.repeat(60));

    // 验证密码
    console.log('\n正在验证密码...');
    console.log(`输入密码: ${TEACHER_PASSWORD}`);
    
    if (!user.password) {
      console.log('❌ 密码字段为空，需要重新设置密码');
      
      // 重新加密并保存密码
      console.log('\n正在重新设置密码...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(TEACHER_PASSWORD, salt);
      user.password = hashedPassword;
      await user.save();
      console.log('✓ 密码已重新设置');
    } else {
      const isValid = await bcrypt.compare(TEACHER_PASSWORD, user.password);
      
      if (isValid) {
        console.log('✓ 密码验证成功！');
      } else {
        console.log('❌ 密码验证失败！');
        console.log('\n可能的原因：');
        console.log('1. 密码在创建时未正确加密');
        console.log('2. 密码字段被修改');
        console.log('\n正在重新设置密码...');
        
        // 重新加密并保存密码
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(TEACHER_PASSWORD, salt);
        user.password = hashedPassword;
        await user.save();
        console.log('✓ 密码已重新设置，请重新尝试登录');
        
        // 再次验证
        const isValidAfter = await bcrypt.compare(TEACHER_PASSWORD, user.password);
        console.log(`重新设置后验证: ${isValidAfter ? '✓ 成功' : '❌ 失败'}`);
      }
    }

    // 重置登录失败次数和锁定状态
    if (user.loginAttempts > 0 || user.lockUntil) {
      console.log('\n正在重置登录状态...');
      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();
      console.log('✓ 登录状态已重置');
    }

    console.log('\n' + '='.repeat(60));
    console.log('验证完成');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ 验证失败:', error.message);
    console.error(error.stack);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n数据库连接已关闭');
  }
}

verifyPassword()
  .then(() => {
    console.log('\n✓ 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ 脚本执行失败:', error);
    process.exit(1);
  });

