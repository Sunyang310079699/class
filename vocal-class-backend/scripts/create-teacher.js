/**
 * 创建教师账号脚本
 * 使用方法: node scripts/create-teacher.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const connectDB = require('../src/config/database');

async function createTeacher() {
  try {
    // 连接数据库
    await connectDB();
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const question = (query) => new Promise(resolve => rl.question(query, resolve));
    
    console.log('='.repeat(50));
    console.log('创建教师账号');
    console.log('='.repeat(50));
    
    const account = await question('请输入手机号（作为账号）: ');
    const password = await question('请输入密码（至少6位）: ');
    const name = await question('请输入姓名（可选，直接回车跳过）: ');
    
    if (!account || !password) {
      console.error('账号和密码不能为空');
      rl.close();
      process.exit(1);
    }
    
    if (password.length < 6) {
      console.error('密码长度至少6位');
      rl.close();
      process.exit(1);
    }
    
    // 检查账号是否已存在
    const existingUser = await User.findOne({ account });
    if (existingUser) {
      console.error('该账号已存在');
      rl.close();
      process.exit(1);
    }
    
    // 创建教师账号
    const user = await User.create({
      account,
      password,
      role: 'teacher',
      phone: account,
      name: name || '教师',
      isActive: true
    });
    
    console.log('\n✅ 教师账号创建成功！');
    console.log('账号信息:');
    console.log(`  账号: ${user.account}`);
    console.log(`  角色: ${user.role}`);
    console.log(`  姓名: ${user.name}`);
    console.log('\n请妥善保管账号密码！');
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('创建失败:', error.message);
    process.exit(1);
  }
}

createTeacher();

