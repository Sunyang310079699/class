import { defineStore } from 'pinia'
import { getIncomeList, getIncomeStats, createIncome } from '@/api/income'

export const useIncomeStore = defineStore('income', {
  state: () => ({
    incomeList: [],
    stats: {
      today: 0,
      week: 0,
      month: 0,
      year: 0,
      total: 0,
      packageIncome: {
        today: 0,
        week: 0,
        month: 0,
        year: 0,
        total: 0
      },
      courseIncome: {
        today: 0,
        week: 0,
        month: 0,
        year: 0,
        total: 0
      }
    },
    loading: false
  }),
  
  getters: {
    // 本月收入列表
    monthIncomeList: (state) => {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      return state.incomeList.filter(item => {
        const date = new Date(item.date)
        return date.getFullYear() === year && date.getMonth() + 1 === month
      })
    }
  },
  
  actions: {
    // 获取收入列表
    async fetchIncomeList(params = {}) {
      this.loading = true
      try {
        const data = await getIncomeList(params)
        console.log('incomeStore.fetchIncomeList 返回数据:', data)
        
        // 处理收入数据，添加 studentName 字段以便兼容视图
        const records = (data.records || []).map(record => ({
          ...record,
          studentName: record.student?.name || record.studentName || '其他',
          studentId: record.studentId || record.student?.id
        }))
        
        this.incomeList = records
        console.log('incomeStore 处理后的记录数:', records.length)
        return data
      } catch (error) {
        console.error('获取收入列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取收入统计
    async fetchIncomeStats() {
      this.loading = true
      try {
        const data = await getIncomeStats()
        this.stats = data
        return data
      } catch (error) {
        console.error('获取收入统计失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 创建收入记录
    async addIncome(incomeData) {
      try {
        const data = await createIncome(incomeData)
        // 处理收入数据，添加 studentName 字段以便兼容视图
        const record = {
          ...data,
          studentName: data.student?.name || data.studentName || '其他',
          studentId: data.student?.id || data.studentId || incomeData.studentId
        }
        this.incomeList.unshift(record)
        return record
      } catch (error) {
        console.error('创建收入记录失败:', error)
        throw error
      }
    }
  }
})

