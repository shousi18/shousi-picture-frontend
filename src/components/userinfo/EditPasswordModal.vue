<!-- src/components/user/EditProfileModal.vue -->
<template>
  <a-modal
    v-model:visible="visible"
    title="修改密码"
    :width="600"
    :destroyOnClose="true"
    @cancel="closeModal"
    class="password-modal"
  >
    <div class="password-form">
      <!-- 编辑表单 -->
      <a-form ref="formRef" :model="formSates" layout="vertical">
        <a-form-item
          label="密码"
          name="oldPassword"
          :rules="[{ required: true, message: '请输入您的旧密码', trigger: 'blur' }]"
        >
          <a-input-password v-model:value="formSates.oldPassword" />
        </a-form-item>

        <a-form-item
          label="新密码"
          name="newPassword"
          :rules="[{ required: true, message: '请输入新密码', trigger: 'blur' }]"
        >
          <a-input-password v-model:value="formSates.newPassword" />
        </a-form-item>
        <a-form-item
          label="确认密码"
          name="checkPassword"
          :rules="[{ required: true, message: '请确认您的新密码', trigger: 'blur' }]"
        >
          <a-input-password v-model:value="formSates.checkPassword" />
        </a-form-item>
      </a-form>
    </div>
    <template #footer>
      <a-button @click="closeModal">取消</a-button>
      <a-button type="primary" @click="handleSubmit">确认修改</a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { message } from 'ant-design-vue'

import { updateUserPassword } from '@/api/userController.ts'

interface Props {
  userInfo: API.UserVO
  onSuccess?: (newUserInfo: API.UserVO) => void
}

const props = defineProps<Props>()

const formSates = reactive({
  oldPassword: '',
  newPassword: '',
  checkPassword: '',
})

const formRef = ref()
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
  } catch (error) {
    if (error.errorFields) {
      message.error('表单填写错误')
    }
    return
  }

  try {
    const params = {
      id: props.userInfo.id,
      ...formSates,
    }
    const res = await updateUserPassword(params)
    if (res.data.code === 0) {
      props?.onSuccess?.(props.userInfo)
      message.success('密码修改成功')
      closeModal()
      clearFormState()
    } else {
      message.error(res.data.message)
    }
  } catch (error) {
    message.error('更新失败')
  }
}
// 表单清空
const clearFormState = () => {
  Object.keys(formSates).map((key) => {
    formSates[key] = ''
  })
}

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
/* 头像上传区域优化 */
.password-form {
  padding: 18px 0;
}
</style>
