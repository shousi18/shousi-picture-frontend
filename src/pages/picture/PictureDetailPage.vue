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
              {{ picture?.category?.categoryName ?? '默认' }}
            </a-descriptions-item>
            <a-descriptions-item label="标签">
              <a-tag v-for="tag in picture?.tagList" :key="tag">
                {{ tag.tagName }}
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
          <a-space wrap>
            <a-button :icon="h(EditOutlined)" v-if="canEdit" type="default" @click="doEdit">
              编辑
            </a-button>
            <a-popconfirm
              title="你确认删除该图片吗？"
              ok-text="确认"
              cancel-text="取消"
              @confirm="doDelete"
            >
              <a-button :icon="h(DeleteOutlined)" v-if="canEdit" danger> 删除</a-button>
            </a-popconfirm>
            <a-button type="default" @click="doDownload">
              免费下载
              <template #icon>
                <DownloadOutlined />
              </template>
            </a-button>
            <a-popconfirm
              title="确认审核通过该图片吗？"
              ok-text="确认"
              cancel-text="取消"
              @confirm="handleReview(picture, PIC_REVIEW_STATUS_ENUM.PASS)"
            >
              <a-button
                v-if="
                  picture?.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS &&
                  loginUserStore.loginUser.userRole === ACCESS_ENUM.ADMIN
                "
                type="link"
              >
                通过
              </a-button>
            </a-popconfirm>
            <a-button
              v-if="
                picture?.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT &&
                loginUserStore.loginUser.userRole === ACCESS_ENUM.ADMIN
              "
              danger
              @click="handleReview(picture, PIC_REVIEW_STATUS_ENUM.REJECT)"
            >
              拒绝
            </a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
    <a-modal
      v-model:open="showModal"
      title="拒绝原因"
      @ok="handleReject"
      @cancel="
        () => {
          showModal = false
          rejectReason = ''
        }
      "
    >
      <a-textarea
        v-model:value="rejectReason"
        placeholder="请输入拒绝原因"
        :row="2"
        show-count
        :maxlength="50"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import {
  deletePictureUsingPost,
  getPictureVoByIdUsingGet,
  pictureReviewUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { downloadImage, formatFileSize } from '../../utils'
import { useRouter } from 'vue-router' // 定义数据
import { DownloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { PIC_REVIEW_STATUS_ENUM } from '@/constant/picture.ts'
import ACCESS_ENUM from '@/access/accessEnum.ts'

interface Props {
  id: number | string
}

const props = defineProps<Props>()
const picture = ref<API.PictureVO>()
const router = useRouter()

const currentRecord = ref<API.Picture | null>(null)
const showModal = ref<boolean>(false)
const rejectReason = ref<any>()

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
    path: '/add_picture',
    query: {
      id: picture.value?.id,
      spaceId: picture.value?.spaceId,
    },
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

/**
 * 处理审核
 * @param record
 * @param reviewStatus
 */
const handleReview = async (record: API.PictureVO, reviewStatus: number) => {
  if (reviewStatus === PIC_REVIEW_STATUS_ENUM.REJECT) {
    currentRecord.value = record
    showModal.value = true
    return
  }
  const res = await pictureReviewUsingPost({
    id: record.id,
    reviewStatus,
    reviewMessage: '管理员操作通过',
  })
  if (res.data.code === 0) {
    message.success('审核成功')
    // 重新获取列表
    fetchPictureDetail()
  } else {
    message.error('审核失败', res.data.message)
  }
}

/**
 * 处理模态框
 */
const handleReject = async () => {
  if (!currentRecord.value) return
  // 校验拒绝原因
  if (!rejectReason.value.trim()) {
    message.warning('请输入拒绝原因')
    return
  }
  try {
    const res = await pictureReviewUsingPost({
      id: currentRecord.value.id,
      reviewStatus: PIC_REVIEW_STATUS_ENUM.REJECT,
      reviewMessage: rejectReason.value,
    })
    if (res.data.code === 0) {
      message.success('已拒绝审核')
      showModal.value = false
      // 清空输入
      rejectReason.value = ''
      // 清空记录
      currentRecord.value = null
      // 刷新列表
      fetchPictureDetail()
    }
  } catch (e) {
    message.error('操作失败')
  } finally {
    showModal.value = false
  }
}
</script>

<style scoped></style>
