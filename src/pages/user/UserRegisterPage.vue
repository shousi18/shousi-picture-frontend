<template>
  <div id="userRegisterPage">
    <h2 class="title">寿司云图库 - 用户注册</h2>
    <div class="desc">企业级智能协同云图库</div>
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <a-form-item
        name="email"
        :rules="[
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
        ]"
      >
        <a-input
          v-model:value="formState.email"
          placeholder="请输入邮箱"
          size="large"
          :prefix="h(MailOutlined)"
        />
      </a-form-item>
      <!-- 邮箱验证码 -->
      <a-form-item
        name="code"
        :rules="[{ required: true, message: '请输入验证码', trigger: 'blur' }]"
      >
        <div class="verify-code-container">
          <a-input
            v-model:value="formState.code"
            placeholder="请输入验证码"
            size="large"
            :prefix="h(SafetyCertificateOutlined)"
          />
          <a-button
            class="send-code-btn"
            :disabled="!!countdown || !formState.email"
            @click="sendEmailCode"
            size="large"
          >
            {{ countdown ? `${countdown}s后重试` : '获取验证码' }}
          </a-button>
        </div>
      </a-form-item>
      <a-form-item
        name="userPassword"
        :rules="[
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 8, message: '密码长度不能小于 8 位', trigger: 'blur' },
        ]"
      >
        <a-input-password
          v-model:value="formState.userPassword"
          placeholder="请输入密码"
          size="large"
          :prefix="h(LockOutlined)"
        />
      </a-form-item>
      <a-form-item
        name="checkPassword"
        :rules="[
          { required: true, message: '请输入确认密码', trigger: 'blur' },
          { min: 8, message: '确认密码长度不能小于 8 位', trigger: 'blur' },
        ]"
      >
        <a-input-password
          v-model:value="formState.checkPassword"
          placeholder="请输入确认密码"
          size="large"
          :prefix="h(CheckCircleOutlined)"
        />
      </a-form-item>
      <div class="tips">
        已有账号？
        <RouterLink to="/user/login">去登录</RouterLink>
      </div>
      <a-form-item>
        <a-button class="register-button" type="primary" html-type="submit" style="width: 100%"
          >注册
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { h, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { getEmailCode, userRegister } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import {
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons-vue' // 用于接受表单输入的值

// 用于接受表单输入的值
const formState = reactive<API.UserRegisterRequest>({
  email: '',
  userPassword: '',
  checkPassword: '',
  code: '',
})

const loginUserStore = useLoginUserStore()

const router = useRouter()
/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  // 校验两次输入的密码是否一致
  if (values.userPassword !== values.checkPassword) {
    message.error('两次输入的密码不一致')
    return
  }
  const res = await userRegister(values)
  // 注册成功，跳转到登录页面
  if (res.data.code === 0 && res.data.data) {
    message.success('注册成功')
    router.push({
      path: '/user/login',
      replace: true,
    })
  } else {
    message.error('注册失败，' + res.data.message)
  }
}

// 倒计时
const countdown = ref<number>(0)
let timer: NodeJS.Timeout | null = null

// 修改发送验证码逻辑
const sendEmailCode = async () => {
  try {
    const res = await getEmailCode({
      email: formState.email,
      type: 'register',
    })

    if (res.data.code === 0 && res.data.data) {
      message.success('验证码已发送')
      // 记录过期时间戳（当前时间 + 剩余秒数）
      countdown.value = res.data.data
      const expireTimestamp = Math.floor(Date.now() / 1000) + Number(res.data.data)
      localStorage.setItem('codeEmail', formState.email)
      localStorage.setItem('codeExpire', expireTimestamp)
      startCountdown()
    } else {
      message.error('验证码发送失败，' + res.data.message)
    }
  } catch (error: any) {
    message.error('验证码发送失败：' + error.message)
  }
}

// 修改恢复倒计时逻辑
onMounted(() => {
  const savedEmail = localStorage.getItem('codeEmail')
  const savedExpire = localStorage.getItem('codeExpire')

  if (savedEmail && savedExpire) {
    const expireTime = savedExpire
    const currentTime = Math.floor(Date.now() / 1000)
    const remainTime = expireTime - currentTime

    if (remainTime > 0) {
      formState.email = savedEmail
      countdown.value = remainTime
      startCountdown()
    } else {
      clearLocalStorage()
    }
  }
})

// 修改倒计时逻辑
const startCountdown = () => {
  if (timer) clearInterval(timer)

  timer = setInterval(() => {
    const savedExpire = localStorage.getItem('codeExpire')
    if (!savedExpire) {
      clearInterval(timer!)
      return
    }

    const currentTime = Math.floor(Date.now() / 1000)
    console.log(currentTime)
    const remainTime = savedExpire - currentTime
    console.log(remainTime)

    if (remainTime > 0) {
      countdown.value = remainTime
    } else {
      clearLocalStorage()
      clearInterval(timer!)
      timer = null
      countdown.value = 0
    }
  }, 1000)
}

// 清理本地存储
const clearLocalStorage = () => {
  localStorage.removeItem('codeEmail')
  localStorage.removeItem('codeExpire')
}

// 清除定时器
onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  // 只在倒计时结束时清理存储
  if (countdown.value <= 0) {
    clearLocalStorage()
  }
})
</script>

<style scoped>
#userRegisterPage {
  max-width: 360px;
  margin: 60px auto;
}

.title {
  text-align: center;
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: bold;
}

.desc {
  text-align: center;
  color: #bbb;
  margin-bottom: 16px;
}

.tips {
  color: #bbb;
  text-align: right;
  font-size: 13px;
  margin-bottom: 16px;
}

.verify-code-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.register-button {
  width: 100%;
  height: 36px;
  border-radius: 12px;
  background: linear-gradient(to right, #f6d365 0%, #fda085 100%);
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: linear-gradient(to right, #f6d365 0%, #fda085 100%);
  }

  &:active {
    background: linear-gradient(to right, #f6d365 0%, #fda085 100%);
  }
}
</style>
