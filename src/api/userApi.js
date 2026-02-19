// 导入全局封装的 Axios 实例
import api from '@/utils/request'

// 登录接口（适配后端 OAuth2 表单格式）
export const loginApi = (loginForm) => {
  // 是浏览器内置的对象（也兼容 Node.js），专门用于处理「URL 查询字符串」或「表单格式参数」；
  const params = new URLSearchParams()
  params.append('username', loginForm.username)
  params.append('password', loginForm.password)
  return api.post('/api/token', params)
}

// 新增：注册接口（JSON 格式传参，适配后端 /api/register）
export const registerApi = (registerForm) => {
  return api.post('/api/register', registerForm)
}
