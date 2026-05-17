import { cpSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const desktopRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const workspaceRoot = resolve(desktopRoot, '..');
const frontendRoot = resolve(workspaceRoot, 'vocal-class-frontend');
const frontendDist = resolve(frontendRoot, 'dist');
const desktopRenderer = resolve(desktopRoot, 'renderer');
const onlineApiBaseUrl = process.env.VOCAL_CLASS_ONLINE_API_URL || 'https://www.sydyy.top/vocal-class/api';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const buildResult = spawnSync(npmCommand, ['run', 'build'], {
  cwd: frontendRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: {
    ...process.env,
    VITE_BASE_PATH: './',
    VITE_API_BASE_URL: onlineApiBaseUrl,
    VITE_APP_TITLE: '声乐教学管理系统'
  }
});

if (buildResult.error) {
  console.error('前端构建命令执行失败:', buildResult.error.message);
  process.exit(1);
}

if (buildResult.status !== 0) {
  console.error(`前端构建失败，退出码: ${buildResult.status}`);
  process.exit(buildResult.status || 1);
}

if (!existsSync(frontendDist)) {
  console.error(`前端构建产物不存在: ${frontendDist}`);
  process.exit(1);
}

rmSync(desktopRenderer, { recursive: true, force: true });
cpSync(frontendDist, desktopRenderer, { recursive: true });

console.log(`已复制前端构建产物到 ${desktopRenderer}`);
console.log(`桌面端 API 地址: ${onlineApiBaseUrl}`);
