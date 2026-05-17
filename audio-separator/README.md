# Audio Separator

一个“在线音频 AI 处理”站点（自建开源推理）：支持 **人声/伴奏二分离**、**四轨分离**、**音频升降调**。MVP 阶段 **免费免登录**，通过限流、文件限制、结果过期清理控制成本；架构预留后续扩展到计费/会员与横向扩展。

## 功能

- **分离**
  - 2-stem：vocal / instrumental
  - 4-stem：vocal / drums / bass / other
- **音频工具**
  - 升降调（pitch shift，半音）

## 技术栈

- **前端**：Vue3 + Vant + Pinia + Vite
- **API**：Node.js + Express + SQLite（MVP）+ Redis（任务队列/进度）
- **Worker**：Python + Demucs + FFmpeg（升降调优先 rubberband，若不可用则降级）
- **部署**：docker-compose（Redis + API + Worker + Nginx）

## 项目结构（每次变更需更新）

```
audio-separator/
  frontend/
  api/
  worker/
  infra/
  docs/
  README.md
```

## 快速开始（开发）

> 注意：本仓库不建议在对话中执行 `npm run dev`。你可以在本机终端自行运行。

- 启动 Redis
- 启动 API（Node）
- 启动 Worker（Python）
- 打开前端（Vite）

详细步骤见：
- `docs/LOCAL_DEV.md`

## 免责声明（建议上线前完善）

- 你上传的音频需确保拥有合法权利或授权。
- 处理结果会在一定时间后自动清理。

