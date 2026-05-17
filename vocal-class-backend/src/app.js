require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// 连接数据库
connectDB();

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志（开发环境）
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// API 路由
app.use('/api', routes);

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: '声乐课程管理系统 API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      students: '/api/students',
      courses: '/api/courses',
      income: '/api/income',
      statistics: '/api/statistics',
      settings: '/api/settings'
    }
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    data: null
  });
});

// 全局错误处理
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 服务器启动成功！`);
  console.log(`📍 运行环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  console.log(`📚 API 文档: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(50));
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM 信号接收，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT 信号接收，正在关闭服务器...');
  process.exit(0);
});

module.exports = app;

