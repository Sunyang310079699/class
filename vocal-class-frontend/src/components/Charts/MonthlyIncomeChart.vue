<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3>{{ title }}</h3>
      <div class="header-actions">
        <van-button size="small" type="primary" plain @click="handleMonthChange">
          {{ currentMonth }}月
        </van-button>
        <van-button size="small" type="primary" plain @click="handleYearChange">
          {{ currentYear }}年
        </van-button>
      </div>
    </div>
    
    <!-- 视图切换 -->
    <div class="view-switch">
      <van-button 
        size="small" 
        :type="viewMode === 'month' ? 'primary' : 'default'"
        @click="viewMode = 'month'"
      >
        月度统计
      </van-button>
      <van-button 
        size="small" 
        :type="viewMode === 'week' ? 'primary' : 'default'"
        @click="viewMode = 'week'"
      >
        周统计
      </van-button>
    </div>
    <div ref="chartRef" class="chart" :style="{ height: height }"></div>
    
    <!-- 年份选择器 -->
    <van-popup v-model:show="showYearPicker" position="bottom">
      <van-picker
        :columns="yearColumns"
        @confirm="onYearConfirm"
        @cancel="showYearPicker = false"
      />
    </van-popup>
    
    <!-- 月份选择器 -->
    <van-popup v-model:show="showMonthPicker" position="bottom">
      <van-picker
        :columns="monthColumns"
        @confirm="onMonthConfirm"
        @cancel="showMonthPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: '月度收入统计'
  },
  height: {
    type: String,
    default: '300px'
  }
})

const chartRef = ref(null)
let chartInstance = null
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const viewMode = ref('month') // 'month' 或 'week'
const showYearPicker = ref(false)
const showMonthPicker = ref(false)

// 生成年份列表（最近5年）
const yearColumns = ref(
  Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i
    return { text: `${year}年`, value: year }
  })
)

// 生成月份列表
const monthColumns = ref(
  Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    return { text: `${month}月`, value: month }
  })
)

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  // 确保容器有宽度后再初始化
  chartInstance = echarts.init(chartRef.value)
  updateChart()
  // 初始化后立即调整大小，确保图表占满容器
  setTimeout(() => {
    if (chartInstance) {
      chartInstance.resize()
    }
  }, 100)
}

// 获取指定日期所在周的周数（从月初开始计算）
const getWeekOfMonth = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const firstDayOfWeek = firstDay.getDay() // 0=周日, 1=周一, ..., 6=周六
  
  // 计算该日期是本月第几周（从1开始）
  const dayOfMonth = date.getDate()
  const weekNumber = Math.ceil((dayOfMonth + firstDayOfWeek) / 7)
  
  return weekNumber
}

// 更新图表
const updateChart = () => {
  if (!chartInstance) return
  
  let option
  
  if (viewMode.value === 'month') {
    // 月度统计模式
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    const monthlyData = new Array(12).fill(0)
    
    // 填充实际数据
    props.data.forEach(item => {
      const date = new Date(item.date)
      if (date.getFullYear() === currentYear.value) {
        const month = date.getMonth()
        monthlyData[month] += item.amount
      }
    })
    
    option = {
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params) => {
          const item = params[0]
          return `${item.name}<br/>收入: ¥${item.value}`
        }
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: {
          lineStyle: {
            color: '#ccc'
          }
        },
        axisLabel: {
          color: '#666'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#666',
          formatter: (value) => {
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'k'
            }
            return value
          }
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0'
          }
        }
      },
      series: [
        {
          name: '收入',
          type: 'bar',
          data: monthlyData,
          barWidth: '50%',
          itemStyle: {
            borderRadius: [8, 8, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#A17FFF' },
              { offset: 1, color: '#8B5FFF' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#B18FFF' },
                { offset: 1, color: '#9B6FFF' }
              ])
            }
          }
        }
      ]
    }
  } else {
    // 周统计模式（显示选中月份每周的数据）
    const weeklyData = []
    const weekLabels = []
    
    // 获取选中月份的第一天和最后一天
    const year = currentYear.value
    const month = currentMonth.value - 1 // 0-11
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // 计算该月有多少周
    const firstDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    const totalWeeks = Math.ceil((daysInMonth + firstDayOfWeek) / 7)
    
    // 初始化每周数据为0
    for (let i = 1; i <= totalWeeks; i++) {
      weeklyData.push(0)
      weekLabels.push(`第${i}周`)
    }
    
    // 填充实际数据
    props.data.forEach(item => {
      const date = new Date(item.date)
      if (date.getFullYear() === year && date.getMonth() === month) {
        const weekNumber = getWeekOfMonth(date)
        if (weekNumber <= totalWeeks) {
          weeklyData[weekNumber - 1] += item.amount
        }
      }
    })
    
    option = {
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params) => {
          const item = params[0]
          return `${item.name}<br/>收入: ¥${item.value}`
        }
      },
      xAxis: {
        type: 'category',
        data: weekLabels,
        axisLine: {
          lineStyle: {
            color: '#ccc'
          }
        },
        axisLabel: {
          color: '#666'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#666',
          formatter: (value) => {
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'k'
            }
            return value
          }
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0'
          }
        }
      },
      series: [
        {
          name: '收入',
          type: 'bar',
          data: weeklyData,
          barWidth: '50%',
          itemStyle: {
            borderRadius: [8, 8, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#A17FFF' },
              { offset: 1, color: '#8B5FFF' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#B18FFF' },
                { offset: 1, color: '#9B6FFF' }
              ])
            }
          }
        }
      ]
    }
  }
  
  chartInstance.setOption(option)
}

// 年份切换
const handleYearChange = () => {
  showYearPicker.value = true
}

const onYearConfirm = ({ selectedOptions }) => {
  currentYear.value = selectedOptions[0].value
  showYearPicker.value = false
  updateChart()
}

// 月份切换
const handleMonthChange = () => {
  showMonthPicker.value = true
}

const onMonthConfirm = ({ selectedOptions }) => {
  currentMonth.value = selectedOptions[0].value
  showMonthPicker.value = false
  updateChart()
}

// 响应式处理
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 监听数据变化
watch(() => props.data, () => {
  updateChart()
}, { deep: true })

// 监听视图模式变化
watch(() => viewMode.value, () => {
  updateChart()
})

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.chart-container {
  background: white;
  border-radius: $border-radius-lg;
  padding: $padding-lg;
  margin-bottom: $padding-lg;
  box-shadow: $box-shadow-sm;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $padding-md;
  
  h3 {
    font-size: $font-size-lg;
    font-weight: bold;
    color: $text-color;
    margin: 0;
  }
  
  .header-actions {
    display: flex;
    gap: $padding-xs;
  }
}

.view-switch {
  display: flex;
  gap: $padding-xs;
  margin-bottom: $padding-md;
  justify-content: center;
}

.chart {
  width: 100%;
  min-width: 0;
  overflow: hidden;
}
</style>

