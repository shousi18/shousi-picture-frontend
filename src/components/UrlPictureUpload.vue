<template>
  <div id="urlPictureUpload" class="url-picture-upload">
    <a-input-group compact style="margin-bottom: 16px">
      <a-input
        v-model:value="fileUrl"
        style="width: calc(100% - 120px)"
        placeholder="请输入图片地址"
      />
      <a-button type="primary" :loading="loading" @click="handleUpload" style="width: 120px">
        提交
      </a-button>
      <!-- 独立卡片容器 -->
      <div class="card-container" v-if="picture?.url">
        <a-card hoverable class="card-wrapper">
          <div class="image-container">
            <a-image
              :src="picture?.url"
              :preview="true"
            />
          </div>
        </a-card>
      </div>

    </a-input-group>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons-vue'
import type { UploadProps } from 'ant-design-vue'
import { message } from 'ant-design-vue'
import { uploadPictureByUrlUsingPost, uploadPictureUsingPost } from '@/api/pictureController.ts'
import { CloudUploadOutlined } from '@ant-design/icons-vue'
interface Props {
  picture?: API.PictureVO
  spaceId?: number
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()

function getBase64(img: Blob, callback: (base64Url: string) => void) {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result as string))
  reader.readAsDataURL(img)
}

const loading = ref<boolean>(false)
const fileUrl = ref<string>('')

/**
 * 上传图片
 */
const handleUpload = async ({ file }: any) => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = { fileUrl: fileUrl.value }
    if (props.picture) {
      // 如果是更新则传入id
      params.id = props.picture.id
    }
    params.spaceId = props.spaceId
    const res = await uploadPictureByUrlUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件
      props?.onSuccess?.(res.data.data)
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    console.error('上传图片失败', error)
  } finally {
    loading.value = false
  }
}

/**
 * 上传前的校验
 * @param info
 */
const beforeUpload = (file: UploadProps['fileList'][number]) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('不支持上传该格式的图片')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('上传大小不能超过 2MB！')
  }
  return isJpgOrPng && isLt2M
}
</script>
<style scoped>
.url-picture-upload {
  display: flex;
  flex-direction: column;
  align-items: center; /* 主轴居中 */
}

.card-container {
  width: 100%;
  max-width: 800px; /* 控制最大宽度 */
  padding: 0 20px; /* 添加呼吸空间 */
  margin-top: 24px;
}

.card-wrapper {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-wrapper:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.image-container {
  padding: 16px; /* 添加内边距 */
  display: flex;
  justify-content: center;
  background: #f8f9fa; /* 添加背景色 */
}

/* 深度样式穿透 */
:deep(.ant-image) {
  max-width: 100%;
  max-height: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.ant-image-img) {
  width: auto !important;
  height: auto !important;
  max-width: 100%;
  max-height: 600px;
  object-fit: contain;
}

</style>
