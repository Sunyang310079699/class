# 后端文档

本目录包含声乐教学管理系统的后端相关文档。

## 文档列表

### [API.md](./API.md) - API 接口文档
详细的 RESTful API 接口设计文档，包括：
- 身份验证接口
- 学生管理接口
- 课时包管理接口
- 课程管理接口
- 收益统计接口
- 数据导出接口

### [DATABASE.md](./DATABASE.md) - 数据库设计文档
MongoDB 数据库设计文档，包括：
- 数据库架构
- 集合设计（5个核心集合）
- 索引设计
- 查询示例
- 数据备份策略
- 性能优化建议

### [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署文档
完整的后端部署指南，包括：
- 服务器配置要求
- 环境安装（Node.js、MongoDB、Nginx、PM2）
- SSL 证书配置
- 后端服务部署
- 微信公众号配置
- 监控和日志
- 备份策略
- 安全加固

## 技术栈

- **Node.js** - JavaScript 运行环境
- **Express** - Web 应用框架
- **MongoDB** - NoSQL 数据库
- **Mongoose** - MongoDB ODM
- **JWT** - 身份验证
- **PM2** - 进程管理
- **Nginx** - 反向代理

## 开发说明

当前前端项目使用 Mock 数据独立开发，暂不需要后端服务。

后端开发将在前端完成后进行，届时可参考这些文档进行开发。

## 快速链接

- 返回主文档：[../README.md](../../README.md)
- 产品需求文档：[../PRD.md](../PRD.md)
- 前端开发文档：[../FRONTEND.md](../FRONTEND.md)
- Mock 数据说明：[../MOCK_DATA.md](../MOCK_DATA.md)

---

**文档版本**：v1.0.0  
**最后更新**：2025-10-21

