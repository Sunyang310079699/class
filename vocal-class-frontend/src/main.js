import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'

// 引入全局样式
import './assets/styles/index.scss'

// 引入 Vant 样式
import 'vant/lib/index.css'

// Mock 数据已移除，现在使用真实后端 API
// 如需启用 Mock 数据，请设置环境变量 VITE_USE_MOCK=true
// if (import.meta.env.VITE_USE_MOCK === 'true') {
//   import('./api/mock')
// }

// 创建应用实例
const app = createApp(App)

// 使用插件
app.use(router)
app.use(pinia)

// 挂载应用
app.mount('#app')
