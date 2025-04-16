<!-- src/components/user/EditProfileModal.vue -->
<template>
  <a-modal
    v-model:visible="visible"
    title="编辑资料"
    :width="600"
    :destroyOnClose="true"
    @cancel="closeModal"
  >
    <!-- 头像上传区域 -->
    <div class="avatar-upload-container">
      <div class="avatar-wrapper">
        <a-avatar :src="userInfo.userAvatar" :size="80" />
        <div class="upload-icon" @click="showFileUploadDialog">
          <PlusOutlined />
        </div>
      </div>
      <input
        type="file"
        ref="fileInput"
        style="display: none"
        accept="image/*"
        @change="handleAvatarUpload"
      />
    </div>

    <!-- 头像裁剪组件 -->
    <AvatarCropper ref="avatarCropperRef" :imageUrl="tempImageUrl" @success="handleCropperAvatar" />

    <!-- 编辑表单 -->
    <a-form ref="formRef" :model="userInfo" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
      <a-form-item
        label="用户名"
        name="userName"
        :rules="[{ required: true, message: '请输入用户名' }]"
      >
        <a-input v-model:value="userInfo.userName" />
      </a-form-item>

      <a-form-item label="个人简介">
        <a-textarea v-model:value="userInfo.userProfile" :auto-size="{ minRows: 3, maxRows: 5 }" />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button @click="closeModal">取消</a-button>
      <a-button type="primary" @click="handleSubmit">保存修改</a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import AvatarCropper from '@/components/userinfo/AvatarCropper.vue'
import { updateUserAvatar, updateUser } from '@/api/userController.ts'

interface Props {
  userInfo: API.UserVO
  onSuccess?: (newUserInfo: API.UserVO) => void
}

const props = defineProps<Props>()

// 头像相关逻辑
const fileInput = ref<HTMLInputElement | null>(null)
const avatarCropperRef = ref()
const tempImageUrl = ref('')

const showFileUploadDialog = () => {
  fileInput.value?.click()
}

const handleAvatarUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    tempImageUrl.value = URL.createObjectURL(file)
    avatarCropperRef.value?.openModal()
    ;(e.target as HTMLInputElement).value = ''
  }
}

const handleCropperAvatar = async (file: File) => {
  try {
    const res = await updateUserAvatar({ id: props.userInfo.id }, {}, file)
    if (res.data.code === 0) {
      message.success('头像更新成功')
      props.userInfo.userAvatar = res.data.data
      props?.onSuccess?.(props.userInfo)
      closeCropperModal()
    }
  } catch (error) {
    message.error('头像上传失败')
  }
}

const closeCropperModal = () => {
  if (avatarCropperRef.value) {
    avatarCropperRef.value.closeModal()
  }
}

const handleSubmit = async () => {
  try {
    const params = {
      ...props.userInfo,
    }
    const res = await updateUser(params)
    if (res.data.code === 0) {
      props?.onSuccess?.(props.userInfo)
      message.success('资料更新成功')
    }
  } catch (error) {
    message.error('更新失败')
  } finally {
    closeModal()
  }
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
.avatar-wrapper {
  position: relative;
  display: inline-block;
  padding: 4px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  margin: 0;
  align-items: center;
  justify-content: center;
  width: fit-content;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  background: linear-gradient(135deg, rgba(255, 142, 83, 0.1) 0%, rgba(255, 107, 107, 0.1) 100%);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 142, 83, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
}

.avatar-upload-container {
  position: relative;
  text-align: center;
  padding: 16px 0;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-icon {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #ff8e53 0%, #ff6b6b 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  z-index: 2;
  border: 2px solid white;
}
</style>
