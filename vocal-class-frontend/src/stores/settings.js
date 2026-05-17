import { defineStore } from 'pinia'
import { getSettings, updateSettings as updateSettingsAPI } from '@/api/settings'
import { getStorage, setStorage } from '@/utils/storage'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    // 默认课时长度（小时）
    defaultDuration: getStorage('defaultDuration', 1),
    // 默认课时单价（元）
    defaultPrice: getStorage('defaultPrice', 200),
    // 默认上课地点
    defaultLocation: getStorage('defaultLocation', '音乐工作室'),
    // 课时不足提醒阈值
    lowHoursThreshold: getStorage('lowHoursThreshold', 3),
    loading: false
  }),
  
  getters: {
    // 映射到后端 API 字段格式
    apiFormat: (state) => ({
      defaultCourseDuration: state.defaultDuration,
      defaultHourlyRate: state.defaultPrice,
      defaultLocation: state.defaultLocation,
      warningThreshold: state.lowHoursThreshold
    })
  },
  
  actions: {
    // 从后端 API 字段格式映射到前端格式
    mapFromAPI(apiData) {
      return {
        defaultDuration: apiData.defaultCourseDuration || 1,
        defaultPrice: apiData.defaultHourlyRate || 200,
        defaultLocation: apiData.defaultLocation || '音乐工作室',
        lowHoursThreshold: apiData.warningThreshold || 3
      }
    },
    
    // 获取设置
    async fetchSettings() {
      this.loading = true
      try {
        const data = await getSettings()
        const mapped = this.mapFromAPI(data)
        Object.keys(mapped).forEach(key => {
          this[key] = mapped[key]
          setStorage(key, mapped[key])
        })
        return mapped
      } catch (error) {
        console.error('获取设置失败:', error)
        // 如果 API 失败，使用本地存储的默认值
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 更新设置
    async updateSettings(settings) {
      try {
        // 更新本地状态
        Object.keys(settings).forEach(key => {
          if (this[key] !== undefined) {
            this[key] = settings[key]
            setStorage(key, settings[key])
          }
        })
        
        // 构建 API 请求数据
        const apiData = {
          ...this.apiFormat,
          ...Object.keys(settings).reduce((acc, key) => {
            if (key === 'defaultDuration') acc.defaultCourseDuration = settings[key]
            else if (key === 'defaultPrice') acc.defaultHourlyRate = settings[key]
            else if (key === 'defaultLocation') acc.defaultLocation = settings[key]
            else if (key === 'lowHoursThreshold') acc.warningThreshold = settings[key]
            return acc
          }, {})
        }
        
        // 调用 API
        await updateSettingsAPI(apiData)
      } catch (error) {
        console.error('更新设置失败:', error)
        throw error
      }
    },
    
    // 重置设置
    async resetSettings() {
      const defaultSettings = {
        defaultDuration: 1,
        defaultPrice: 200,
        defaultLocation: '音乐工作室',
        lowHoursThreshold: 3
      }
      await this.updateSettings(defaultSettings)
    }
  }
})

