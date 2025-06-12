<!-- src/components/user/EditProfileModal.vue -->
<template>
  <a-modal
    v-model:visible="visible"
    title="编辑资料"
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
      name="edit_userinfo_form"
    >
      <a-form-item label="用户名" name="userName">
        <a-input v-model:value="formState.userName" placeholder="请输入用户名" />
      </a-form-item>
      <a-form-item label="个人简介" name="userProfile">
        <a-textarea
          v-model:value="formState.userProfile"
          placeholder="请输入个人简介"
          :rows="4"
          :maxlength="200"
          show-count
        />
      </a-form-item>
      <a-form-item label="头像" name="userAvatar">
        <div class="avatar-upload">
          <a-upload
            v-model:file-list="fileList"
            name="file"
            list-type="picture-card"
            class="avatar-uploader"
            :show-upload-list="false"
            :before-upload="beforeUpload"
            @change="handleChange"
          >
            <img v-if="imageUrl" :src="imageUrl" alt="avatar" style="width: 100%" />
            <div v-else>
              <loading-outlined v-if="loading"></loading-outlined>
              <plus-outlined v-else></plus-outlined>
              <div class="ant-upload-text">上传</div>
            </div>
          </a-upload>
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance, UploadChangeParam, UploadProps } from 'ant-design-vue'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { updateUser } from '@/api/userController'

const props = defineProps<{
  userInfo: API.UserVO
  onSuccess?: (newUserInfo: API.UserVO) => void
}>()

const visible = ref(false)
const confirmLoading = ref(false)
const formRef = ref<FormInstance>()
const loading = ref<boolean>(false)
const imageUrl = ref<string>(props.userInfo.userAvatar || '')
const fileList = ref([])

const formState = reactive<API.UserUpdateRequest>({
  id: props.userInfo.id,
  userName: props.userInfo.userName,
  userProfile: props.userInfo.userProfile,
  userAvatar: props.userInfo.userAvatar,
})

const rules = {
  userName: [
    { required: true, message: '请输入用户名' },
    { min: 2, max: 16, message: '用户名长度在2-16个字符之间' },
  ],
  userProfile: [{ max: 200, message: '个人简介不能超过200个字符' }],
}

const beforeUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 格式的图片!')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
  }
  return isJpgOrPng && isLt2M
}

const getBase64 = (img: File, callback: (base64Url: string) => void) => {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result as string))
  reader.readAsDataURL(img)
}

const handleChange = (info: UploadChangeParam) => {
  if (info.file.status === 'uploading') {
    loading.value = true
    return
  }
  if (info.file.status === 'done') {
    getBase64(info.file.originFileObj as File, (url) => {
      loading.value = false
      imageUrl.value = url
      formState.userAvatar = url
    })
  }
  if (info.file.status === 'error') {
    loading.value = false
    message.error('上传失败')
  }
}

const handleOk = async () => {
  try {
    await formRef.value?.validate()
    confirmLoading.value = true
    const res = await updateUser(formState)
    if (res.data.code === 0) {
      message.success('修改成功')
      props.onSuccess?.(res.data.data)
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
  imageUrl.value = props.userInfo.userAvatar || ''
}

const openModal = () => {
  visible.value = true
}

defineExpose({
  openModal,
})
</script>

<style scoped>
.avatar-uploader {
  :deep(.ant-upload) {
    width: 128px;
    height: 128px;
  }
}

.ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
