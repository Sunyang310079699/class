import { defineStore } from 'pinia'
import { getDashboardStats, getWarnings } from '@/api/statistics'

export const useStatisticsStore = defineStore('statistics', {
  state: () => ({
    dashboard: null,
    warnings: [],
    loading: false
  }),
  actions: {
    async fetchDashboard() {
      this.loading = true
      try {
        const data = await getDashboardStats()
        this.dashboard = data
        return data
      } finally {
        this.loading = false
      }
    },
    async fetchWarnings(params = {}) {
      const data = await getWarnings(params)
      this.warnings = data || []
      return data
    }
  }
})


