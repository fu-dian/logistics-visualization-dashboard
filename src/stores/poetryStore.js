// stores/poetryStore.js
import { defineStore } from 'pinia'
import {
  getGlobalKeywords,
  getPoetKeywords,
  getPoetCompare,
  getPoetList,
  getPoetPoem,
} from '../api/poetryApi'
import { ElMessage } from 'element-plus'

// 缓存已请求过的诗人数据（避免重复请求）
const poetDataCache = new Map()

export const usePoetryStore = defineStore('poetry', {
  state: () => ({
    poetPoemList: [], // 诗词列表（响应式）
    currentPoet: '', // 当前选中诗人（响应式）
    loading: false, // 请求加载状态（响应式）
    poetlist: [],
    pagination: {
      page: 1,
      pageSize: 20,
      total: 0,
    },
  }),
  actions: {
    /**
     * 即时获取诗人诗词（核心方法）
     * @param {string} poetName 诗人名（空字符串=全唐诗）
     * @param {boolean} forceRefresh 是否强制刷新（忽略缓存）
     */
    async fetchPoetPoem(poetName, forceRefresh = false) {
      // 1. 即时更新状态：标记加载中 + 记录当前诗人
      this.loading = true
      this.currentPoet = poetName

      // 2. 缓存命中且不强制刷新：直接使用缓存数据（无延迟）
      const cacheKey = `${poetName}_page${this.pagination.page}_size${this.pagination.pageSize}`
      if (poetDataCache.has(cacheKey) && !forceRefresh) {
        const cacheData = poetDataCache.get(cacheKey)
        this.poetPoemList = cacheData.list
        this.pagination.total = cacheData.total
        this.loading = false
        ElMessage.success(`已加载${poetName || '全唐诗'}缓存数据`)
        return
      }

      try {
        // 3. 即时发起请求（无延迟）
        const res = await getPoetPoem({
          poet: poetName,
          limit: this.pagination.pageSize,
          page: this.pagination.page,
        })

        // 4. 请求成功后即时更新状态（响应式，页面立刻渲染）
        if (res.code === 200) {
          this.poetPoemList = res.data
          // 提取总条数（适配后端返回的msg："找到120条符合条件的诗词"）
          this.pagination.total = res.msg ? parseInt(res.msg.match(/找到(\d+)条/)?.[1] || 0) : 0
          // 存入缓存
          poetDataCache.set(cacheKey, {
            list: res.data,
            total: this.pagination.total,
          })
        } else {
          this.poetPoemList = []
          this.pagination.total = 0
          ElMessage.warning(res.msg || '暂无诗词数据')
        }
      } catch (err) {
        this.poetPoemList = []
        this.pagination.total = 0
        ElMessage.error(`获取数据失败：${err.msg || '网络异常'}`)
      } finally {
        // 5. 即时结束加载状态
        this.loading = false
      }
    },

    /**
     * 手动触发刷新（比如用户点击刷新按钮）
     */
    refreshPoetPoem() {
      if (!this.currentPoet) {
        ElMessage.warning('请先选择诗人')
        return
      }
      // 强制刷新（忽略缓存）
      this.fetchPoetPoem(this.currentPoet, true)
    },

    /**
     * 分页切换即时更新
     */
    async changePage(page) {
      this.pagination.page = page
      // 切换分页后即时请求对应页数据
      await this.fetchPoetPoem(this.currentPoet)
    },
    setCurrentPoet(poet) {
      this.currentPoet = poet
    },
    async Getglobalkeywords() {
      try {
        const res = await getGlobalKeywords()
        // 2. 前置校验：确保res和res.data是合法的（避免res.data为undefined/null）
        if (!res || !Array.isArray(res.data)) {
          ElMessage.warning('全局关键词数据格式异常')
          return []
        }
        const arr = []
        for (let i = 0; i < res.data.length; i++) {
          // 3. 可选链+空值校验：避免某条数据无「全局关键词」字段导致报错
          const keyword = res.data[i]?.['全局关键词']
          if (keyword) {
            // 只存储非空的关键词（过滤空字符串/undefined/null）
            arr.push(keyword)
          }
        }
        // 4. 赋值给响应式变量，供模板/其他逻辑使用
        return arr // 可选：返回数据供其他函数调用
      } catch (err) {
        ElMessage.error(`获取数据失败：${err.msg || err.message || '网络异常'}`)
        console.error('获取全局关键词失败：', err)
        return []
      }
    },
    async Getglobalkeynumber() {
      try {
        const res = await getGlobalKeywords()
        console.log(res)
        // 2. 前置校验：确保res和res.data是合法的（避免res.data为undefined/null）
        if (!res || !Array.isArray(res.data)) {
          ElMessage.warning('全局关键词数据格式异常')
          return []
        }
        const arr = []
        for (let i = 0; i < res.data.length; i++) {
          // 3. 可选链+空值校验：避免某条数据无「全局关键词」字段导致报错
          const keyword = res.data[i]?.['出现次数']
          if (keyword) {
            // 只存储非空的关键词（过滤空字符串/undefined/null）
            arr.push(keyword)
          }
        }
        // 4. 赋值给响应式变量，供模板/其他逻辑使用
        return arr // 可选：返回数据供其他函数调用
      } catch (err) {
        ElMessage.error(`获取数据失败：${err.msg || err.message || '网络异常'}`)
        console.error('获取全局关键词数量失败：', err)
        return []
      }
    },
    async GetPoetKeywords(poetName) {
      try {
        const res = await getPoetKeywords(poetName)
        this.poetlist = res.data[0].关键词
        // 2. 前置校验：确保res和res.data是合法的（避免res.data为undefined/null）
        if (!res || !Array.isArray(res.data)) {
          ElMessage.warning('诗人关键词数据格式异常')
          return []
        }
        const arr = []
        for (let i = 0; i < 20; i++) {
          // 3. 可选链+空值校验：避免某条数据无「全局关键词」字段导致报错
          const keyword = res.data[i]?.['关键词']
          if (keyword) {
            // 只存储非空的关键词（过滤空字符串/undefined/null）
            arr.push(keyword)
          }
        }
        // 4. 赋值给响应式变量，供模板/其他逻辑使用
        return arr // 可选：返回数据供其他函数调用
      } catch (err) {
        ElMessage.error(`获取数据失败：${err.msg || err.message || '网络异常'}`)
        console.error('获取诗人关键词失败：', err)
        return []
      }
    },
    async GetPoetKenumber(poetName) {
      try {
        const res = await getPoetKeywords(poetName)
        // 2. 前置校验：确保res和res.data是合法的（避免res.data为undefined/null）
        if (!res || !Array.isArray(res.data)) {
          ElMessage.warning('诗人关键词数据格式异常')
          return []
        }
        const arr = []
        for (let i = 0; i < res.data.length; i++) {
          // 3. 可选链+空值校验：避免某条数据无「全局关键词」字段导致报错
          const keyword = res.data[i]?.['出现次数']
          if (keyword) {
            // 只存储非空的关键词（过滤空字符串/undefined/null）
            arr.push(keyword)
          }
        }
        console.log('关键词次数', arr)
        return arr
      } catch (err) {
        ElMessage.error(`获取数据失败：${err.msg || err.message || '网络异常'}`)
        console.error('获取诗人关键词数量失败：', err)
        return []
      }
    },

    /**
     * 清空缓存（可选：比如全局刷新时调用）
     */
    clearCache() {
      poetDataCache.clear()
      ElMessage.success('缓存已清空，下次将加载最新数据')
    },
  },
})
