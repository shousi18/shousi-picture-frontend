<template>
  <div id="pictureDetailPage">
    <a-row :gutter="[16, 16]">
      <!-- 图片展示区 -->
      <a-col :sm="24" :md="16" :xl="18">
        <a-card title="图片预览">
          <a-image style="max-height: 600px; object-fit: contain" :src="picture?.url" />
        </a-card>
      </a-col>
      <!-- 图片信息区 -->
      <a-col :sm="24" :md="8" :xl="6">
        <a-card title="图片信息">
          <a-descriptions :column="1">
            <a-descriptions-item label="作者">
              <a-space>
                <a-avatar :size="24" :src="picture?.user?.userAvatar" />
                <div>{{ picture?.user?.userName }}</div>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="名称">
              {{ picture?.name ?? '未命名' }}
            </a-descriptions-item>
            <a-descriptions-item label="简介">
              {{ picture?.introduction ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="分类">
              {{ picture?.category ?? '默认' }}
            </a-descriptions-item>
            <a-descriptions-item label="标签">
              <a-tag v-for="tag in picture?.tags" :key="tag">
                {{ tag }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="格式">
              {{ picture?.picFormat ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽度">
              {{ picture?.picWidth ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="高度">
              {{ picture?.picHeight ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽高比">
              {{ picture?.picScale ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="大小">
              {{ formatFileSize(picture?.picSize) }}
            </a-descriptions-item>
          </a-descriptions>
          <a-space>
            <a-button :icon="h(EditOutlined)" v-if="canEdit" type="default" @click="doEdit"> 编辑</a-button>
            <a-button :icon="h(DeleteOutlined)" v-if="canEdit" danger @click="doDelete"> 删除</a-button>
            <a-button type="default" @click="doDownload">
              免费下载
              <template #icon>
                <DownloadOutlined />
              </template>
            </a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { deletePictureUsingPost, getPictureVoByIdUsingGet } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { downloadImage, formatFileSize } from '../utils'
import { useRouter } from 'vue-router' // 定义数据
import { DownloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'

interface Props {
  id: number | string
}

const props = defineProps<Props>()
const picture = ref<API.PictureVO>()
const router = useRouter()

const loginUserStore = useLoginUserStore()

const canEdit = computed(() => {
  const loginUser = loginUserStore.loginUser
  if (!loginUser.id) {
    return
  }
  return loginUser.id === picture.value?.userId || loginUser.userRole === 'admin'
})
/**
 * 获取图片详细
 */
const fetchPictureDetail = async () => {
  const res = await getPictureVoByIdUsingGet({ id: props.id })
  if (res.data.code === 0 && res.data.data) {
    picture.value = res.data.data
    message.success('获取图片数据成功')
  } else {
    message.error('获取图片数据失败，' + res.data.message)
  }
}

onMounted(() => {
  fetchPictureDetail()
})

/**
 * 下载按钮
 */
const doDownload = () => {
  if (picture.value?.url) {
    downloadImage(picture.value?.url, picture.value?.name ?? 'picture')
  }
}

/**
 * 编辑按钮
 */
const doEdit = () => {
  router.push({
    path: `add_picture?id=${picture.value?.id}`,
  })
}

/**
 * 删除按钮
 */
const doDelete = () => {
  if (picture.value?.id) {
    deletePictureUsingPost({ id: picture.value?.id }).then((res) => {
      if (res.data.code === 0) {
        message.success('删除成功')
        router.push({
          path: '/',
        })
      } else {
        message.error('删除失败，' + res.data.message)
      }
    })
  }
}
</script>

<style scoped></style>
