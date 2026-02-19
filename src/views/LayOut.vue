<template>
  <div class="content">
    <div class="iner-left">
      <div class="warp">
        <div class="chart" ref="chartRef2" style="width: 350px; height: 230px; margin-top: 10px;"></div>
        <div class="chart" ref="chartRef6" style="width: 350px; height: 230px; margin-top: 10px;"></div>
        <div class="chart" ref="chartRef8" style="width: 350px; height: 230px; margin-top: 10px;"></div>
      </div>
    </div>
    <div class="iner-mid">
      <div class="warp">
        <div class="chart" ref="chartRef3" style="width: 800px; height: 760px; margin: 0 auto;"></div>
      </div>
    </div>
    <div class="iner-right">
      <div class="right-content">
        <div class="chart" ref="chartRef4" style="width: 350px; height: 240px; margin-top: 10px;"></div>
        <div class="chart" ref="chartRef5" style="width: 350px; height: 240px; margin-top: 10px;"></div>
        <div class="chart" ref="chartRef7" style="width: 350px; height: 240px; margin-top: 10px;"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import chinaGeoJSON from '@/assets/map/china.json'
import api from '../utils/request'

// ===================== 1. 常量定义 =====================
const COLORS = {
  primary: '#26C6DA',
  primaryLight: '#4DD0E1',
  primaryDark: '#00838F',
  text: '#FFFFFF',
  textLight: '#E0F7FA',
  pie: ['#EC4899', '#00AEEC', '#10B981', '#FFC107', '#F72585', '#7B2CBF'],
  barGradient: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
    { offset: 0, color: '#4DD0E1' },
    { offset: 1, color: '#0A1929' }
  ])
}

// ===================== 2. 【核心修改】补全所有图表默认数据 =====================
const DEFAULT_DATA = {
  // 1. 产品销量柱状图（原有）
  productSales: {
    products: ['小米 17', 'iPhone 17', 'vivo x300', 'OPPO Find X9', 'Samsung Galaxy S24'],
    sales: [1200, 1850, 2000, 1500, 1900]
  },
  // 2. 年龄占比饼图（原有）
  ageData: {
    age_ranges: ['18-25', '26-35', '36-45', '45+'],
    counts: [320, 580, 240, 120]
  },
  // 3. 性别占比饼图（原有）
  genderData: {
    gender_ranges: ['男', '女'],
    counts: [650, 610]
  },
  // 4. 运输方式饼图（原有）
  transportData: {
    transports: ['陆运', '空运', '水运'],
    counts: [450, 280, 150]
  },
  // 5. 【新增】全国地图默认数据（必须给，否则空白）
  shippingData: {
    shipping_data: [
      { name: '北京市', value: 320 },
      { name: '上海省', value: 480 },
      { name: '广东省', value: 650 },
      { name: '浙江省', value: 420 },
      { name: '江苏省', value: 380 },
      { name: '四川省', value: 250 },
      { name: '湖北省', value: 220 },
      { name: '山东省', value: 300 }
    ]
  },
  // 6. 【新增】销量折线图默认数据（x轴+series）
  salesTrend: {
    dates: ['1日', '2日', '3日', '4日', '5日', '6日', '7日', '8日'],
    sales: [120, 150, 180, 160, 200, 220, 190, 250]
  },
  // 7. 【新增】好评率面积图默认数据（80-100区间）
  rateTrend: {
    dates: ['1日', '2日', '3日', '4日', '5日', '6日'],
    rates: [92, 93, 91, 95, 94, 96]
  }
}

// ===================== 3. 响应式数据 & 引用管理 =====================
const chartRef2 = ref(null) // 产品销量柱状图
const chartRef3 = ref(null) // 中国地图
const chartRef4 = ref(null) // 年龄占比饼图
const chartRef5 = ref(null) // 销量折线图
const chartRef6 = ref(null) // 好评率面积图
const chartRef7 = ref(null) // 运输方式饼图
const chartRef8 = ref(null) // 性别占比饼图

const chartInstances = {
  chart2: null, chart3: null, chart4: null,
  chart5: null, chart6: null, chart7: null, chart8: null
}

const fetchTimer = ref(null)
const currentGoodsName = ref('')

// ===================== 4. 通用工具函数 =====================
const initEChart = (domRef, chartKey, option = {}) => {
  if (!domRef.value) return null
  if (chartInstances[chartKey]) chartInstances[chartKey].dispose()
  const instance = echarts.init(domRef.value)
  chartInstances[chartKey] = instance
  instance.setOption(option, { lazyUpdate: false, notMerge: true })
  window.addEventListener('resize', () => instance.resize())
  return instance
}

const updateEChartOption = (chartKey, option) => {
  const instance = chartInstances[chartKey]
  if (instance) instance.setOption(option, { lazyUpdate: false, notMerge: false })
}

const safeMap = (sourceArr, mapper) => {
  if (!Array.isArray(sourceArr)) return []
  return sourceArr.map(mapper).filter(Boolean)
}

// ===================== 5. 图表配置（全部使用默认数据兜底） =====================
// 5.1 产品销量柱状图
const getProductsOption = (data = {}, goodsName = '') => {
  const productData = { ...DEFAULT_DATA.productSales, ...data }
  return {
    backgroundColor: 'transparent',
    title: { text: goodsName ? `${goodsName}销量` : '10日产品销量', left: 'center', textStyle: { color: COLORS.text, fontSize: 16 } },
    tooltip: { trigger: 'axis', formatter: '{b}：{c}单' },
    grid: { left: '10%', right: '10%', top: '20%', bottom: '10%' },
    xAxis: { type: 'category', data: productData.products, axisLabel: { color: COLORS.text } },
    yAxis: { type: 'value', axisLabel: { color: COLORS.text } },
    series: [{
      type: 'bar', data: productData.sales,
      itemStyle: { color: COLORS.barGradient, borderRadius: 4 },
      label: { show: true, position: 'top', color: COLORS.text }
    }]
  }
}

// 5.2 中国地图（使用默认数据兜底）
const getChinaMapOption = (data = {}) => {
  const shippingData = { ...DEFAULT_DATA.shippingData, ...data }
  return {

    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}：{c}单' },
    visualMap: { min: 0, max: 1000, left: 'left', bottom: '10%', textStyle: { color: COLORS.text } },
    series: [{
      type: 'map', map: 'china', roam: false,
      label: { show: true, color: COLORS.text },
      data: shippingData.shipping_data // 有默认数据，不会空白
    }]
  }
}

// 5.3 销量折线图（使用默认数据兜底）
const getSalesLineOption = (data = {}, goodsName = '') => {
  const salesData = { ...DEFAULT_DATA.salesTrend, ...data }
  return {
    backgroundColor: 'transparent',
    title: { text: goodsName ? `${goodsName}销量趋势` : '10日销量趋势', left: 'center', textStyle: { color: COLORS.text } },
    tooltip: { trigger: 'axis', formatter: '{b}：{c}单' },
    xAxis: { type: 'category', data: salesData.dates, axisLabel: { color: COLORS.text } },
    yAxis: { type: 'value', axisLabel: { color: COLORS.text } },
    series: [{
      type: 'line', data: salesData.sales,
      lineStyle: { width: 2, color: COLORS.primary },
      symbol: 'circle', symbolSize: 6,
      label: { show: true, position: 'top', color: COLORS.text }
    }]
  }
}

// 5.4 好评率面积图（使用默认数据兜底）
const getRateAreaOption = (data = {}, goodsName = '') => {
  const rateData = { ...DEFAULT_DATA.rateTrend, ...data }
  return {
    backgroundColor: 'transparent',
    title: { text: goodsName ? `${goodsName}好评率` : '好评率趋势', left: 'center', textStyle: { color: COLORS.text } },
    tooltip: { trigger: 'axis', formatter: '{b}：{c}%' },
    xAxis: { type: 'category', data: rateData.dates, axisLabel: { color: COLORS.text } },
    yAxis: { type: 'value', min: 80, max: 100, axisLabel: { formatter: '{value}%', color: COLORS.text } },
    series: [{
      type: 'line', data: rateData.rates, smooth: true,
      lineStyle: { width: 3, color: COLORS.primary },
      areaStyle: { color: 'rgba(38, 198, 218, 0.3)' },
      label: { show: true, position: 'top', formatter: '{c}%', color: COLORS.text }
    }]
  }
}

// 5.5 年龄占比饼图
const getAgeOption = (data = {}, goodsName = '') => {
  const ageData = { ...DEFAULT_DATA.ageData, ...data }
  const pieData = safeMap(ageData.age_ranges, (r, i) => ({ name: r, value: ageData.counts[i] }))
  return {
    backgroundColor: 'transparent',
    title: { text: goodsName ? `${goodsName}年龄占比` : '买家年龄占比', left: 'center', textStyle: { color: COLORS.text } },
    tooltip: { trigger: 'item', formatter: '{b}：{c}人 ({d}%)' },
    series: [{ type: 'pie', radius: ['40%', '70%'], data: pieData }]
  }
}

// 5.6 运输方式饼图
const getTransportOption = (data = {}, goodsName = '') => {
  const transportData = { ...DEFAULT_DATA.transportData, ...data }
  const pieData = safeMap(transportData.transports, (r, i) => ({ name: r, value: transportData.counts[i] }))
  return {
    title: { text: goodsName ? `${goodsName}运输方式占比` : '运输方式占比', left: 'center', textStyle: { color: COLORS.text } },
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}：{c}单 ({d}%)' },
    series: [{ type: 'pie', radius: ['40%', '70%'], data: pieData }]
  }
}

// 5.7 性别占比饼图
const getGenderOption = (data = {}, goodsName = '') => {
  const genderData = { ...DEFAULT_DATA.genderData, ...data }
  const pieData = safeMap(genderData.gender_ranges, (r, i) => ({ name: r, value: genderData.counts[i] }))
  return {
    backgroundColor: 'transparent',
    title: { text: goodsName ? `${goodsName}性别占比` : '买家性别占比', left: 'center', textStyle: { color: COLORS.text } },
    tooltip: { trigger: 'item', formatter: '{b}：{c} ({d}%)' },
    series: [{ type: 'pie', radius: ['40%', '70%'], data: pieData }]

  }
}

// ===================== 6. 数据请求 =====================
// 6.1 获取产品销量（5秒更新）
const fetchProductSales = async () => {
  try {
    const res = await api.get('/api/products_sales')
    updateEChartOption('chart2', getProductsOption(res.data))
  } catch (err) {
    console.error('获取销量失败', err)
    updateEChartOption('chart2', getProductsOption()) // 失败用默认数据
  }
}

// 6.2 点击柱状图获取详情（含地图/折线）
const fetchGoodsDetail = async (goodsName) => {
  chartInstances.chart2?.showLoading()
  try {
    const [rateRes, salesRes, ageRes, genderRes, mapRes, transRes] = await Promise.all([
      api.get(`/api/goods_rate?name=${goodsName}`),
      api.get(`/api/goods_sales?name=${goodsName}`),
      api.get(`/api/age_distribution?name=${goodsName}`),
      api.get(`/api/gender_distribution?name=${goodsName}`),
      api.get(`/api/shipping_data?name=${goodsName}`),
      api.get(`/api/transport?name=${goodsName}`)
    ])
    updateEChartOption('chart4', getAgeOption(ageRes.data, goodsName))
    updateEChartOption('chart6', getRateAreaOption(rateRes.data, goodsName))
    updateEChartOption('chart5', getSalesLineOption(salesRes.data, goodsName))
    updateEChartOption('chart8', getGenderOption(genderRes.data, goodsName))
    updateEChartOption('chart3', getChinaMapOption(mapRes.data, goodsName))
    updateEChartOption('chart7', getTransportOption(transRes.data, goodsName))
    currentGoodsName.value = goodsName
  } catch (err) {
    console.error('获取详情失败', err)
    // 失败时用默认数据兜底，不空白
    updateEChartOption('chart4', getAgeOption({}, goodsName))
    updateEChartOption('chart6', getRateAreaOption({}, goodsName))
    updateEChartOption('chart5', getSalesLineOption({}, goodsName))
    updateEChartOption('chart8', getGenderOption({}, goodsName))
    updateEChartOption('chart3', getChinaMapOption({}, goodsName))
    updateEChartOption('chart7', getTransportOption({}, goodsName))
  } finally {
    chartInstances.chart2?.hideLoading()
  }
}

// ===================== 7. 生命周期 =====================
onMounted(async () => {
  await nextTick()
  echarts.registerMap('china', chinaGeoJSON)

  // 初始化所有图表（全部用默认数据）
  initEChart(chartRef2, 'chart2', getProductsOption())
  initEChart(chartRef3, 'chart3', getChinaMapOption())
  initEChart(chartRef4, 'chart4', getAgeOption())
  initEChart(chartRef5, 'chart5', getSalesLineOption())
  initEChart(chartRef6, 'chart6', getRateAreaOption())
  initEChart(chartRef7, 'chart7', getTransportOption())
  initEChart(chartRef8, 'chart8', getGenderOption())

  // 绑定点击
  chartInstances.chart2?.on('click', (params) => fetchGoodsDetail(params.name))

  // 5秒更新
  fetchTimer.value = setInterval(fetchProductSales, 1000)
})

onUnmounted(() => {
  clearInterval(fetchTimer.value)
  Object.values(chartInstances).forEach(inst => inst?.dispose())
})
</script>

<style scoped>
/* 样式完全不变，和你之前一致 */
.content {
  display: flex;
  gap: 5px;
  background: #080824;
  min-height: 100vh;
}

.iner-left,
.iner-mid,
.iner-right {
  border-radius: 16px;
  border: 3px solid rgba(38, 198, 218, 0.2);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 15px rgba(0, 172, 193, 0.1);
}

.iner-left {
  width: 450px;
  padding: 10px;
}

.iner-mid {
  flex: 1;
  padding: 10px;
}

.iner-right {
  width: 450px;
  padding: 10px;
}

.warp {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart {
  border-radius: 16px;
  border: 3px solid rgba(38, 198, 218, 0.2);
  backdrop-filter: blur(8px);
  margin-bottom: 10px;
}
</style>
