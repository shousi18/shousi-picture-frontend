<!-- src/components/user/EditProfileModal.vue -->
<template>
  <a-modal
    v-model:visible="visible"
    title="编辑资料"
    :width="600"
    :destroyOnClose="true"
    @cancel="closeModal"
  >
    <a-form layout="vertical" v-model="formState">
      <a-form-item label="新邮箱">
        <a-input v-model:value="formState.newEmail" />
      </a-form-item>
      <a-form-item label="验证码">
        <div class="verify-code-container">
          <a-input v-model:value="formState.code" placeholder="请输入验证码" maxlength="6" />
          <a-button
            class="verify-code-btn"
            :disabled="!!countdown || !formState.newEmail"
            @click="sendEmailCode"
          >
            {{ countdown ? `${countdown}s后重试` : '获取验证码' }}
          </a-button>
        </div>
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button @click="closeModal">取消</a-button>
      <a-button type="primary" @click="handleSubmit">保存修改</a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { getEmailCode, updateUserEmail } from '@/api/userController.ts'

interface Props {
  userInfo: API.UserVO
  onSuccess?: (newUserInfo: API.UserVO) => void
}

const props = defineProps<Props>()

const formState = ref({
  newEmail: '',
  code: '',
})

const handleSubmit = async () => {
  try {
    const params = {
      id: props.userInfo.id,
      ...formState,
    }
    const res = await updateUserEmail(params)
    if (res.data.code === 0) {
      props.userInfo.email = formState.value.newEmail
      props?.onSuccess?.(props.userInfo)
      message.success('邮箱更新成功')
    }
  } catch (error) {
    message.error('邮箱更新失败')
  } finally {
    closeModal()
  }
}

// 倒计时
const countdown = ref<number>(0)
let timer: NodeJS.Timeout | null = null

/**
 * 发送验证码逻辑
 */
const sendEmailCode = async () => {
  try {
    const res = await getEmailCode({
      email: formState.value.newEmail,
      type: 'changeEmail',
    })

    if (res.data.code === 0 && res.data.data) {
      message.success('验证码已发送')
      // 记录过期时间戳（当前时间 + 剩余秒数）
      countdown.value = res.data.data
      const expireTimestamp = Math.floor(Date.now() / 1000) + Number(res.data.data)
      localStorage.setItem('codeEmail:changeEmail', formState.value.newEmail)
      localStorage.setItem('codeExpire:changeEmail', expireTimestamp)
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
  const savedEmail = localStorage.getItem('codeEmail:changeEmail')
  const savedExpire = localStorage.getItem('codeExpire:changeEmail')

  if (savedEmail && savedExpire) {
    const expireTime = savedExpire
    const currentTime = Math.floor(Date.now() / 1000)
    const remainTime = expireTime - currentTime

    if (remainTime > 0) {
      formState.value.newEmail = savedEmail
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
    const savedExpire = localStorage.getItem('codeExpire:changeEmail')
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
  localStorage.removeItem('codeEmail:changeEmail')
  localStorage.removeItem('codeExpire:changeEmail')
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

// 控制视图
const visible = ref(false)

const openModal = () => {
  visible.value = true
}

const closeModal = () => {
  visible.value = false
}

defineExpose({
  openModal,
})
</script>

<style scoped>
.verify-code-container {
  display: flex;
  align-items: center;
}
.verify-code-container .verify-code-btn {
  margin-left: 10px;
}
</style>
