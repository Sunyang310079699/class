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
    default: '学生消费占比'
  },
  height: {
    type: String,
    default: '350px'
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
  
  // 按学生统计收入
  const studentIncomeMap = {}
  props.data.forEach(item => {
    if (item.studentId) {
      if (!studentIncomeMap[item.studentId]) {
        studentIncomeMap[item.studentId] = {
          name: item.studentName,
          value: 0
        }
      }
      studentIncomeMap[item.studentId].value += item.amount
    }
  })
  
  // 转换为数组并排序
  const chartData = Object.values(studentIncomeMap)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8) // 只显示前8名
  
  // 生成颜色数组
  const colors = [
    '#A17FFF', '#FF8B7B', '#00D4AA', '#FFB366',
    '#FFA8A8', '#82D43A', '#7FD426', '#FF8585'
  ]
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br/>¥{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: {
        color: '#666'
      },
      formatter: (name) => {
        const item = chartData.find(d => d.name === name)
        return `${name}  ¥${item ? item.value : 0}`
      }
    },
    series: [
      {
        name: '学生消费',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            formatter: (params) => {
              return `${params.name}\n¥${params.value}\n${params.percent}%`
            }
          }
        },
        labelLine: {
          show: false
        },
        data: chartData.map((item, index) => ({
          ...item,
          itemStyle: {
            color: colors[index % colors.length]
          }
        }))
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

