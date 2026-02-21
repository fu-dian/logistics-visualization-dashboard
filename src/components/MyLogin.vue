<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 登录表单 -->
      <h2 class="login-title">物流可视化大屏</h2>
      <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="User" size="large" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" prefix-icon="Lock" size="large" />
        </el-form-item>
        <div class="btn-group">
          <!-- 注册按钮，点击打开弹窗 -->
          <el-button type="text" class="register-btn" @click="openRegisterDialog"> 注册账号 </el-button>
          <el-button class="login-btn" :loading="loading" size="large" @click="handleLogin" type="primary">
            登录
          </el-button>
        </div>
      </el-form>
    </div>
    <!--注册弹窗 -->
    <el-dialog v-model="registerDialogVisible" title="用户注册" width="400px" center :close-on-click-modal="false">
      <el-form ref="registerRef" :model="registerForm" :rules="registerRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入3-16位用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入6-20位密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="registerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRegister" :loading="registerLoading">注册</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
// 导入登录/注册接口
import { loginApi, registerApi } from '@/api/userApi'

const router = useRouter()
const route = useRoute()

const loginRef = ref(null)
const loginForm = ref({ username: '', password: '' })
const loading = ref(false)
const loginRules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 16, message: '用户名长度在 3 到 16 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
})

const handleLogin = async () => {
  try {
    if (loading.value) return
    const validateResult = await loginRef.value.validate()
    if (!validateResult) return

    loading.value = true
    const res = await loginApi(loginForm.value)
    if (res.access_token) {
      ElMessage.success('登录成功')
      localStorage.setItem('token', res.access_token)
      localStorage.setItem('username', loginForm.value.username)
      const redirect = route.query.redirect || '/LayOut'
      router.push(redirect)
    } else {
      ElMessage.error('登录失败，未获取到 Token')
    }
  } catch (err) {
    loading.value = false
    if (err.response) {
      const { status, data } = err.response
      const errMsg = data.detail || data.msg || '账号或密码错误'
      switch (status) {
        case 400:
          ElMessage.error(`请求参数错误：${errMsg}`)
          break
        case 401:
          localStorage.removeItem('token')
          ElMessage.error('账号或密码错误')
          break
        case 500:
          ElMessage.error('服务器内部错误，请稍后重试')
          break
        default:
          ElMessage.error(`登录失败（${status}）：${errMsg}`)
      }
    } else {
      ElMessage.error('网络异常，请检查连接')
    }
  } finally {
    loading.value = false
  }
}

// ========== 新增：注册相关逻辑 ==========
// 注册弹窗显隐
const registerDialogVisible = ref(false)
// 注册表单引用
const registerRef = ref(null)
// 注册加载状态
const registerLoading = ref(false)
// 注册表单数据
const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: ''
})
// 注册表单校验规则
const registerRules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 16, message: '用户名长度在 3 到 16 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名仅支持字母、数字、下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 打开注册弹窗（清空表单）
const openRegisterDialog = () => {
  registerDialogVisible.value = true
  // 重置注册表单
  registerRef.value?.resetFields()
  registerForm.value = { username: '', password: '', confirmPassword: '' }
}

// 处理注册提交
const handleRegister = async () => {
  try {
    if (registerLoading.value) return
    // 1. 表单前置校验
    const validateResult = await registerRef.value.validate()
    if (!validateResult) return

    registerLoading.value = true
    // 2. 调用注册接口
    const res = await registerApi({
      username: registerForm.value.username,
      password: registerForm.value.password
    })
    // 3. 注册成功处理
    if (res.code === 200) {
      ElMessage.success(res.msg || '注册成功，请登录')
      registerDialogVisible.value = false
      // 自动填充用户名到登录框
      loginForm.value.username = registerForm.value.username
    }
  } catch (err) {
    registerLoading.value = false
    // 4. 注册失败处理
    if (err.response) {
      const { status, data } = err.response
      const errMsg = data.detail || data.msg || '注册失败'
      switch (status) {
        case 400:
          ElMessage.error(errMsg) // 用户名已存在/参数错误
          break
        case 500:
          ElMessage.error('服务器内部错误，请稍后重试')
          break
        default:
          ElMessage.error(`注册失败（${status}）：${errMsg}`)
      }
    } else {
      ElMessage.error('网络异常，请检查后端服务是否启动')
    }
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  margin: 0;
  padding: 0;
}

.login-card {
  width: 400px;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  background-color: white;
  box-sizing: border-box;
}

.login-title {
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #00aeec;
  margin-bottom: 30px;
  margin-top: 0;
}

.login-form {
  width: 100%;
}

.btn-group {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

}

.register-btn {
  width: 180px;
  color: #00aeec;
  font-size: 14px;
}

.login-btn {
  width: 180px;
  background-color: #00aeec;
  border: none;
}

:deep(.el-button--primary:disabled) {
  background-color: #a0cfff;
  border-color: #a0cfff;
}

:deep(.el-input__wrapper) {
  --el-input-border-radius: 8px;
  --el-input-hover-border-color: #00aeec;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
