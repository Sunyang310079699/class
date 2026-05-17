require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // 检查环境变量是否加载
    if (!process.env.MONGODB_URI) {
      console.error('错误: MONGODB_URI 环境变量未设置');
      console.error('请确保 .env 文件存在且包含 MONGODB_URI 配置');
      console.error('当前工作目录:', process.cwd());
      console.error('.env 文件路径:', require('path').resolve(__dirname, '../../.env'));
      process.exit(1);
    }

    console.log('正在连接 MongoDB...');
    console.log(`连接地址: ${process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`); // 隐藏密码显示
    
    // 确保连接字符串包含 authSource 参数（如果使用 root 用户）
    let mongoUri = process.env.MONGODB_URI;
    if (mongoUri.includes('root') && !mongoUri.includes('authSource')) {
      // 如果使用 root 用户且没有指定 authSource，添加 authSource=admin
      mongoUri = mongoUri.includes('?') 
        ? `${mongoUri}&authSource=admin` 
        : `${mongoUri}?authSource=admin`;
      console.log('已自动添加 authSource=admin 参数');
    }
    
    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB 连接成功: ${conn.connection.host}`);
    console.log(`数据库名称: ${conn.connection.name}`);

    // 监听连接事件
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB 连接错误:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB 连接断开');
    });

    return conn;
  } catch (error) {
    console.error('MongoDB 连接失败:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

