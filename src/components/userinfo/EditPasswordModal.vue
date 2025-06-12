<!-- src/components/user/EditProfileModal.vue -->
<template>
  <a-modal
    v-model:visible="visible"
    title="修改密码"
    ok-text="确认"
    cancel-text="取消"
    @ok="handleOk"
    @cancel="handleCancel"
    :confirm-loading="confirmLoading"
  >
    <a-form
      :model="formState"
      :rules="rules"
      ref="formRef"
      layout="vertical"
      name="edit_password_form"
    >
      <a-form-item label="原密码" name="oldPassword">
        <a-input-password v-model:value="formState.oldPassword" placeholder="请输入原密码" />
      </a-form-item>
      <a-form-item label="新密码" name="newPassword">
        <a-input-password v-model:value="formState.newPassword" placeholder="请输入新密码" />
      </a-form-item>
      <a-form-item label="确认密码" name="checkPassword">
        <a-input-password v-model:value="formState.checkPassword" placeholder="请再次输入新密码" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { updateUserPassword } from '@/api/userController'

const props = defineProps<{
  userInfo: API.UserVO
}>()

const visible = ref(false)
const confirmLoading = ref(false)
const formRef = ref<FormInstance>()

const formState = reactive<API.UserUpdatePasswordRequest>({
  id: undefined,
  oldPassword: '',
  newPassword: '',
  checkPassword: '',
})

const rules = {
  oldPassword: [{ required: true, message: '请输入原密码' }],
  newPassword: [
    { required: true, message: '请输入新密码' },
    { min: 8, message: '密码长度不能小于8位' },
  ],
  checkPassword: [
    { required: true, message: '请再次输入新密码' },
    {
      validator: async (_rule: any, value: string) => {
        if (value && value !== formState.newPassword) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
    },
  ],
}

const handleOk = async () => {
  try {
    await formRef.value?.validate()
    confirmLoading.value = true
    formState.id = props.userInfo.id
    const res = await updateUserPassword(formState)
    if (res.data.code === 0) {
      message.success('修改成功')
      handleCancel()
    } else {
      message.error('修改失败：' + res.data.message)
    }
  } catch {
    // 表单验证失败
  } finally {
    confirmLoading.value = false
  }
}

const handleCancel = () => {
  formRef.value?.resetFields()
  visible.value = false
}

const openModal = () => {
  visible.value = true
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
