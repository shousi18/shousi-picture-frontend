<template>
  <div id="userLoginPage">
    <h2 class="title">寿司云图库 - 用户登录</h2>
    <div class="desc">企业级智能协同云图库</div>
    <a-form ref="formRef" :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <a-form-item
        name="userAccountOrEmail"
        :rules="[{ required: true, message: '请输入账号', trigger: 'blur' }]"
      >
        <a-input
          v-model:value="formState.userAccountOrEmail"
          placeholder="请输入账号或者邮箱"
          size="large"
          :prefix="h(UserOutlined)"
        />
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
          :prefix="h(LockOutlined)"
          placeholder="请输入密码"
          size="large"
        />
      </a-form-item>
      <!-- 验证码 -->
      <a-form-item
        name="verifyCode"
        :rules="[
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { min: 4, message: '验证码长度为 4 位', trigger: 'blur' },
        ]"
      >
        <div class="verify-code-container">
          <a-input
            v-model:value="formState.verifyCode"
            placeholder="请输入验证码"
            size="large"
            :prefix="h(SafetyCertificateOutlined)"
            class="custom-input verify-input"
          />
          <div class="code-image" @click="getVerifyCode">
            <img :src="verifyCodeImg" alt="验证码" />
          </div>
        </div>
      </a-form-item>
      <div class="tips">
        没有账号？
        <RouterLink to="/user/register">去注册</RouterLink>
      </div>
      <a-form-item>
        <a-button class="login-button" type="primary" html-type="submit" style="width: 100%">登录</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import { h, onMounted, reactive, ref } from 'vue'
import { getCaptchaUsingGet, userLoginUsingPost } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { LockOutlined, UserOutlined, SafetyCertificateOutlined } from '@ant-design/icons-vue' // 用于接受表单输入的值

// 用于接受表单输入的值
const formState = reactive<API.UserLoginRequest>({
  userAccountOrEmail: '',
  userPassword: '',
  verifyCode: '',
  verifyCodeId: '',
})
const formRef = ref()
// 验证码图片
const verifyCodeImg = ref('')

const loginUserStore = useLoginUserStore()

const router = useRouter()
/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  // 验证表单规则
  try {
    await formRef.value.validate()
  } catch (error) {
    message.error('格式错误')
    return
  }
  // 获取图形码id
  values.verifyCodeId = formState.verifyCodeId
  const res = await userLoginUsingPost(values)
  // 登录成功，把登录态保存到全局状态中
  if (res.data.code === 0 && res.data.data) {
    await loginUserStore.fetchLoginUser()
    message.success('登录成功')
    router.push({
      path: '/',
      replace: true,
    })
  } else {
    message.error('登录失败，' + res.data.message)
  }
}

/**
 * 获得验证码
 */
const getVerifyCode = async () => {
  const res = await getCaptchaUsingGet()
  if (res.data.code === 0 && res.data.data) {
    verifyCodeImg.value = 'data:image/jpeg;base64,' + res.data.data.base64Captcha
    formState.verifyCodeId = res.data.data.encryptedCaptcha
  }
}

onMounted(() => {
  getVerifyCode()
})
</script>

<style scoped>
#userLoginPage {
  max-width: 360px;
  margin: 80px auto;
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

  .verify-input {
    flex: 1;
  }

  .code-image {
    width: 120px;
    height: 44px;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s ease;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(1px);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 2px;
    }
  }
}

.login-button {
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
