import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  // H5 部署使用 /vocal-class/，Electron 本地文件加载时通过环境变量切换为 ./
  base: process.env.VITE_BASE_PATH || '/vocal-class/',
  plugins: [
    vue(),
    // Vant 按需引入
    Components({
      resolvers: [VantResolver()],
    }),
    // API 自动引入
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    host: true,
    open: true,
    proxy: {
      '/api': {
        // target: 'http://localhost:3000',
        target: 'https://www.sydyy.top/vocal-class/',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'vant': ['vant'],
          'echarts': ['echarts']
        }
      }
    }
  }
})
