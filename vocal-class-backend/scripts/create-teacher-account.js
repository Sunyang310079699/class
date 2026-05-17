// 创建教师账号脚本
// 使用说明: node scripts/create-teacher-account.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/models/User');
const connectDB = require('../src/config/database');

const TEACHER_ACCOUNT = '16602435950';
const TEACHER_PASSWORD = 'dyy16602435950';

async function createTeacherAccount() {
  try {
    // 连接数据库
    console.log('正在连接数据库...');
    await connectDB();
    console.log('✓ 数据库连接成功\n');

    // 检查账号是否已存在
    const existingUser = await User.findOne({ account: TEACHER_ACCOUNT }).select('+password');
    if (existingUser) {
      console.log(`⚠️  账号 ${TEACHER_ACCOUNT} 已存在`);
      console.log(`当前角色: ${existingUser.role}`);
      console.log(`是否激活: ${existingUser.isActive}`);
      
      // 自动更新密码和角色
      console.log('\n正在更新账号信息...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(TEACHER_PASSWORD, salt);
      
      // 更新密码和角色
      existingUser.password = hashedPassword;
      existingUser.role = 'teacher';
      existingUser.phone = TEACHER_ACCOUNT;
      existingUser.isActive = true;
      existingUser.loginAttempts = 0;
      existingUser.lockUntil = null;
      await existingUser.save();
      
      console.log('\n' + '='.repeat(50));
      console.log('✓ 账号信息已更新');
      console.log('='.repeat(50));
      console.log(`账号: ${TEACHER_ACCOUNT}`);
      console.log(`密码: ${TEACHER_PASSWORD}`);
      console.log(`角色: teacher`);
      console.log(`手机号: ${TEACHER_ACCOUNT}`);
      console.log(`账号状态: 已激活`);
      console.log('='.repeat(50));
      
      await mongoose.connection.close();
      console.log('\n数据库连接已关闭');
      process.exit(0);
    }

    // 加密密码
    console.log('正在加密密码...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(TEACHER_PASSWORD, salt);
    console.log('✓ 密码加密完成');

    // 创建教师账号
    console.log('\n正在创建教师账号...');
    const teacher = await User.create({
      account: TEACHER_ACCOUNT,
      password: hashedPassword,
      role: 'teacher',
      phone: TEACHER_ACCOUNT,
      isActive: true,
      loginAttempts: 0,
      lockUntil: null
    });

    console.log('\n' + '='.repeat(50));
    console.log('✓ 教师账号创建成功！');
    console.log('='.repeat(50));
    console.log(`账号: ${teacher.account}`);
    console.log(`密码: ${TEACHER_PASSWORD}`);
    console.log(`角色: ${teacher.role}`);
    console.log(`手机号: ${teacher.phone}`);
    console.log(`账号状态: ${teacher.isActive ? '已激活' : '未激活'}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ 创建账号失败:', error.message);
    if (error.code === 11000) {
      console.error('错误: 账号已存在');
    }
    throw error;
  } finally {
    // 关闭数据库连接
    await mongoose.connection.close();
    console.log('\n数据库连接已关闭');
  }
}

// 执行创建
createTeacherAccount()
  .then(() => {
    console.log('\n✓ 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ 脚本执行失败:', error);
    process.exit(1);
  });

