// 修复教师账号密码脚本（直接操作数据库，绕过模型中间件）
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const connectDB = require('../src/config/database');

const TEACHER_ACCOUNT = '16602435950';
const TEACHER_PASSWORD = 'dyy16602435950';

async function fixPassword() {
  try {
    // 连接数据库
    console.log('正在连接数据库...');
    await connectDB();
    console.log('✓ 数据库连接成功\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // 查找用户
    const user = await usersCollection.findOne({ account: TEACHER_ACCOUNT });
    
    if (!user) {
      console.log('❌ 账号不存在');
      return;
    }

    console.log('='.repeat(60));
    console.log('当前账号信息');
    console.log('='.repeat(60));
    console.log(`账号: ${user.account}`);
    console.log(`角色: ${user.role}`);
    console.log(`密码字段存在: ${user.password ? '是' : '否'}`);
    console.log(`密码长度: ${user.password ? user.password.length : 0}`);
    if (user.password) {
      console.log(`密码前缀: ${user.password.substring(0, 20)}...`);
    }
    console.log('='.repeat(60));

    // 加密密码（直接加密，不通过模型）
    console.log('\n正在加密密码...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(TEACHER_PASSWORD, salt);
    console.log(`加密后密码长度: ${hashedPassword.length}`);
    console.log(`加密后密码前缀: ${hashedPassword.substring(0, 20)}...`);

    // 验证加密后的密码
    console.log('\n验证加密后的密码...');
    const isValid = await bcrypt.compare(TEACHER_PASSWORD, hashedPassword);
    console.log(`验证结果: ${isValid ? '✓ 成功' : '❌ 失败'}`);

    if (!isValid) {
      console.log('❌ 密码加密验证失败，请检查bcrypt库');
      return;
    }

    // 直接更新数据库（绕过模型中间件）
    console.log('\n正在更新数据库中的密码...');
    await usersCollection.updateOne(
      { account: TEACHER_ACCOUNT },
      {
        $set: {
          password: hashedPassword,
          loginAttempts: 0,
          lockUntil: null,
          updatedAt: new Date()
        }
      }
    );
    console.log('✓ 密码已更新');

    // 再次验证
    console.log('\n验证更新后的密码...');
    const updatedUser = await usersCollection.findOne({ account: TEACHER_ACCOUNT });
    const isValidAfter = await bcrypt.compare(TEACHER_PASSWORD, updatedUser.password);
    
    console.log('='.repeat(60));
    if (isValidAfter) {
      console.log('✓ 密码验证成功！');
      console.log('='.repeat(60));
      console.log('\n账号信息:');
      console.log(`账号: ${TEACHER_ACCOUNT}`);
      console.log(`密码: ${TEACHER_PASSWORD}`);
      console.log(`角色: teacher`);
      console.log('='.repeat(60));
      console.log('\n✓ 现在可以使用该账号登录了！');
    } else {
      console.log('❌ 密码验证仍然失败');
      console.log('='.repeat(60));
    }

  } catch (error) {
    console.error('\n❌ 修复失败:', error.message);
    console.error(error.stack);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n数据库连接已关闭');
  }
}

fixPassword()
  .then(() => {
    console.log('\n✓ 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ 脚本执行失败:', error);
    process.exit(1);
  });

