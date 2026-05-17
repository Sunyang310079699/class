/**
 * 快速创建教师账号脚本
 * 使用方法: node scripts/create-teacher-now.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const connectDB = require('../src/config/database');

async function createTeacher() {
  try {
    // 连接数据库
    await connectDB();
    
    const account = '16602435950';
    const password = 'dyy16602435950';
    const name = '教师';
    
    console.log('='.repeat(50));
    console.log('正在创建教师账号...');
    console.log('='.repeat(50));
    
    // 检查账号是否已存在
    const existingUser = await User.findOne({ account });
    if (existingUser) {
      console.log('⚠️  该账号已存在！');
      console.log('账号信息:');
      console.log(`  账号: ${existingUser.account}`);
      console.log(`  角色: ${existingUser.role}`);
      console.log(`  姓名: ${existingUser.name}`);
      process.exit(0);
    }
    
    // 创建教师账号
    const user = await User.create({
      account,
      password,
      role: 'teacher',
      phone: account,
      name: name,
      isActive: true
    });
    
    console.log('\n✅ 教师账号创建成功！');
    console.log('账号信息:');
    console.log(`  账号: ${user.account}`);
    console.log(`  密码: ${password}`);
    console.log(`  角色: ${user.role}`);
    console.log(`  姓名: ${user.name}`);
    console.log('\n请妥善保管账号密码！');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 创建失败:', error.message);
    process.exit(1);
  }
}

createTeacher();

