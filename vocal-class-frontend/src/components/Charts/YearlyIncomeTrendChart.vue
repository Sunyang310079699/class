<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3>{{ title }}</h3>
    </div>
    <div ref="chartRef" class="chart" :style="{ height: height }"></div>
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
    default: '年度收入趋势'
  },
  height: {
    type: String,
    default: '300px'
  }
})

const chartRef = ref(null)
let chartInstance = null

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

// 更新图表
const updateChart = () => {
  if (!chartInstance) return
  
  // 获取最近5年的年份
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i)
  
  // 统计每年的收入
  const yearlyData = years.map(year => {
    return props.data
      .filter(item => new Date(item.date).getFullYear() === year)
      .reduce((sum, item) => sum + item.amount, 0)
  })
  
  const option = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const item = params[0]
        return `${item.name}年<br/>总收入: ¥${item.value}`
      }
    },
    xAxis: {
      type: 'category',
      data: years.map(y => y + '年'),
      boundaryGap: false,
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
        name: '年度收入',
        type: 'line',
        data: yearlyData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#A17FFF' },
            { offset: 1, color: '#8B5FFF' }
          ])
        },
        itemStyle: {
          color: '#8B5FFF',
          borderColor: '#fff',
          borderWidth: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(161, 127, 255, 0.3)' },
            { offset: 1, color: 'rgba(161, 127, 255, 0.05)' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: '#A17FFF',
            shadowBlur: 10,
            shadowColor: 'rgba(161, 127, 255, 0.5)'
          }
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
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
}

.chart {
  width: 100%;
  min-width: 0;
  overflow: hidden;
}
</style>

