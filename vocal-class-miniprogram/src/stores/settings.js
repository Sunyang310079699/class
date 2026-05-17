import { defineStore } from 'pinia'
import { getSettings, updateSettings as updateSettingsApi } from '@/api/settings'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    defaultDuration: 1,
    defaultPrice: 200,
    defaultLocation: '音乐工作室',
    lowHoursThreshold: 3,
    loading: false
  }),
  getters: {
    apiFormat(state) {
      return {
        defaultCourseDuration: state.defaultDuration,
        defaultHourlyRate: state.defaultPrice,
        defaultLocation: state.defaultLocation,
        warningThreshold: state.lowHoursThreshold
      }
    }
  },
  actions: {
    mapFromApi(apiData) {
      return {
        defaultDuration: apiData.defaultCourseDuration || 1,
        defaultPrice: apiData.defaultHourlyRate || 200,
        defaultLocation: apiData.defaultLocation || '音乐工作室',
        lowHoursThreshold: apiData.warningThreshold || 3
      }
    },
    async fetchSettings() {
      this.loading = true
      try {
        const data = await getSettings()
        const mapped = this.mapFromApi(data)
        Object.assign(this, mapped)
        return mapped
      } finally {
        this.loading = false
      }
    },
    async updateSettings(settings) {
      const merged = {
        defaultDuration: this.defaultDuration,
        defaultPrice: this.defaultPrice,
        defaultLocation: this.defaultLocation,
        lowHoursThreshold: this.lowHoursThreshold,
        ...settings
      }
      Object.assign(this, merged)
      const apiData = {
        ...this.apiFormat,
        ...(settings.defaultDuration !== undefined ? { defaultCourseDuration: settings.defaultDuration } : {}),
        ...(settings.defaultPrice !== undefined ? { defaultHourlyRate: settings.defaultPrice } : {}),
        ...(settings.defaultLocation !== undefined ? { defaultLocation: settings.defaultLocation } : {}),
        ...(settings.lowHoursThreshold !== undefined ? { warningThreshold: settings.lowHoursThreshold } : {})
      }
      await updateSettingsApi(apiData)
    }
  }
})


