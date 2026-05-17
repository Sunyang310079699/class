// 小程序端后端接口地址配置
// 与 docs/backend/API.md 中的 Base URL 保持一致

const ENV = process.env.NODE_ENV || 'development'

const configMap = {
  development: {
    API_BASE_URL: 'http://localhost:3000/api'
  },
  production: {
    API_BASE_URL: 'https://yourdomain.com/api'
  }
}

export const API_BASE_URL = configMap[ENV].API_BASE_URL


