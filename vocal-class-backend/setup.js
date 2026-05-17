// 初始化脚本：创建 .env 文件
const fs = require('fs');
const path = require('path');

const envContent = `# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
MONGODB_URI=mongodb://root:147258@39.106.63.161:27017/vocal-class

# JWT 配置
JWT_SECRET=vocal_class_secret_key_2025
JWT_EXPIRES_IN=7d

# 微信配置
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret

# CORS 配置
CORS_ORIGIN=http://localhost:5173
`;

const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('.env 文件已存在');
} else {
  fs.writeFileSync(envPath, envContent);
  console.log('✓ .env 文件创建成功');
}

console.log('\n后端项目初始化完成！');
console.log('请运行以下命令启动服务：');
console.log('  npm run dev  (开发模式)');
console.log('  npm start    (生产模式)');

