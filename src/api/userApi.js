// 导入全局封装的 Axios 实例
import api from '@/utils/request'

// 登录接口
export const loginApi = (loginForm) => {
  // 是浏览器内置的对象
  const params = new URLSearchParams()
  params.append('username', loginForm.username)
  params.append('password', loginForm.password)
  return api.post('/api/token', params)
}

// 注册接口（JSON 格式传参，适配后端 /api/register）
export const registerApi = (registerForm) => {
  return api.post('/api/register', registerForm)
}
