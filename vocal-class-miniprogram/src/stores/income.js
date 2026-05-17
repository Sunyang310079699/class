import { defineStore } from 'pinia'
import { getIncomeOverview, getIncomeList, createIncome, getIncomeTrend } from '@/api/income'

export const useIncomeStore = defineStore('income', {
  state: () => ({
    records: [],
    overview: {
      today: 0,
      week: 0,
      month: 0,
      year: 0,
      total: 0
    },
    trend: {
      labels: [],
      values: []
    },
    loading: false
  }),
  actions: {
    async fetchOverview() {
      this.loading = true
      try {
        const data = await getIncomeOverview()
        this.overview = data || this.overview
        return data
      } finally {
        this.loading = false
      }
    },
    async fetchRecords(params = {}) {
      this.loading = true
      try {
        const data = await getIncomeList(params)
        const list = (data.records || []).map(item => ({
          ...item,
          id: item.id || item._id,
          studentName: item.student?.name || item.studentName || '其他',
          studentId: item.student?.id || item.studentId
        }))
        this.records = list
        return { ...data, records: list }
      } finally {
        this.loading = false
      }
    },
    async addIncome(payload) {
      const data = await createIncome(payload)
      const record = {
        ...data,
        id: data.id || data._id,
        studentName: data.student?.name || data.studentName || '其他',
        studentId: data.student?.id || data.studentId || payload.studentId
      }
      this.records.unshift(record)
      return record
    },
    async fetchTrend(params = {}) {
      const data = await getIncomeTrend(params)
      this.trend = data || this.trend
      return data
    }
  }
})


