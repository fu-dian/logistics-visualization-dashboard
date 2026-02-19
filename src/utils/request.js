import axios from 'axios'

const baseURL = 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL,
  timeout: 10000,
})

// 请求拦截
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截（只做最基础，不跳转、不乱处理）
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error(error)
    return Promise.reject(error)
  },
)
export default api
