# 声乐教学管理系统 Electron 桌面端

该目录是桌面端项目，复用现有 `vocal-class-frontend` 页面，并直接调用线上 API 服务。

## 实现方式

- Electron 主进程只负责窗口生命周期，不再启动本地后端服务。
- 构建脚本会以桌面端配置重新构建 H5 前端，并复制到 `vocal-class-desktop/renderer`。
- Electron 窗口加载本地前端静态资源，前端 API 默认指向 `https://www.sydyy.top/vocal-class/api`。

## 目录结构

```text
vocal-class-desktop/
├── src/
│   └── main/
│       ├── main.js       # Electron 主进程，负责窗口生命周期
│       └── preload.js    # 安全暴露桌面端运行信息
├── scripts/
│   └── build-renderer.mjs # 构建并复制 H5 前端产物
├── package.json          # Electron 启动和打包配置
└── README.md
```

## 使用说明

先安装桌面端依赖：

```bash
npm install
```

启动桌面端：

```bash
npm start
```

生成 Windows 安装包：

```bash
npm run dist
```

## 配置线上 API

默认线上 API 地址为：

```text
https://www.sydyy.top/vocal-class/api
```

如需临时切换地址，可在构建前设置环境变量 `VOCAL_CLASS_ONLINE_API_URL`。

## 注意事项

- 桌面端不再内置后端，也不再读取 `vocal-class-backend/.env`。
- 用户需要能访问线上 API，离线状态下无法使用服务端数据。
