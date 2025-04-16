<template>
  <div id="pictureDetailPage">
    <a-row :gutter="[16, 16]">
      <!-- 图片展示区 -->
      <a-col :sm="24" :md="16" :xl="18">
        <a-card class="preview-picture-card">
          <div class="image-container">
            <a-image style="max-height: 600px; object-fit: contain" :src="picture?.url" />
          </div>
        </a-card>
      </a-col>
      <!-- 图片信息区 -->
      <a-col :sm="24" :md="8" :xl="6">
        <a-card title="图片信息">
          <a-descriptions :column="1" class="info-descriptions">
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
            <a-descriptions-item label="主色调">
              <a-space>
                {{ picture?.picColor ?? '-' }}
                <div
                  v-if="picture?.picColor"
                  :style="{
                    backgroundColor: toHexColor(picture?.picColor),
                    width: '16px',
                    height: '16px',
                  }"
                />
              </a-space>
            </a-descriptions-item>
          </a-descriptions>
          <div class="custom-actions">
            <a-space wrap align="start">
              <a-button v-if="canEdit" type="primary" @click="doEdit" class="action-btn edit-btn">
                <EditOutlined />
              </a-button>
              <a-popconfirm
                title="你确认删除该图片吗？"
                ok-text="确认"
                cancel-text="取消"
                @confirm="doDelete"
              >
                <a-button type="primary" v-if="canDelete" danger class="action-btn delete-btn">
                  <DeleteOutlined />
                </a-button>
              </a-popconfirm>
              <a-button type="primary" @click="doDownload" class="action-btn download-btn">
                <DownloadOutlined />
              </a-button>
              <a-button type="primary" ghost @click="doShare" class="action-btn share-btn">
                <share-alt-outlined />
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
          </div>
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
    <ShareModal ref="shareModalRef" :link="shareLink" />
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import {
  deletePicture,
  getPictureVoById,
  pictureReview,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { downloadImage, formatFileSize, toHexColor } from '../../utils'
import { useRouter } from 'vue-router' // 定义数据
import {
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
} from '@ant-design/icons-vue'
import { PIC_REVIEW_STATUS_ENUM } from '@/constant/picture.ts'
import ACCESS_ENUM from '@/access/accessEnum.ts'
import ShareModal from '@/components/ShareModal.vue'
import { SPACE_PERMISSION_ENUM } from '@/constant/space.ts'

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

const shareLink = ref<string>()
const shareModalRef = ref()

// 通用权限检查函数
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (picture.value?.permissionList ?? []).includes(permission)
  })
}

// 定义权限检查
const canEdit = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDelete = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)
/**
 * 获取图片详细
 */
const fetchPictureDetail = async () => {
  const res = await getPictureVoById({ id: props.id })
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
 * 分享按钮
 * @param picture
 * @param e
 */
const doShare = () => {
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.value?.id}`
  if (shareModalRef.value) {
    shareModalRef.value.openModal()
  }
}

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
    deletePicture({ id: picture.value?.id }).then((res) => {
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
  const res = await pictureReview({
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
    const res = await pictureReview({
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

<style scoped>
/* 预览卡片样式优化 */
.preview-picture-card {
  background: #f9f9f9;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
}

/* 图片容器样式优化 */
.image-container {
  position: relative;
  min-height: 400px;
  max-height: 660px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  padding: 16px;
  transition: all 0.3s ease;
}

/* 信息面板优化 */
.ant-card[title='图片信息'] {
  border-radius: 12px !important;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06) !important;

  :deep(.ant-card-head) {
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 24px;
    font-size: 18px;
    color: #2d3748;
  }

  :deep(.ant-card-body) {
    padding: 24px !important;
  }
}

/* 标签容器样式 */
.info-descriptions :deep(.ant-descriptions-item-content) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 0;
  flex: 1;
  font-size: 14px;
}

.info-descriptions :deep(.ant-descriptions-item-container) {
  display: flex;
}

.info-descriptions :deep(.ant-descriptions-item-label) {
  width: 60px;
  font-size: 13px;
  color: #666;
  flex-shrink: 0;
}

.info-descriptions :deep(.ant-descriptions-item-label) {
  padding: 4px;
}

/* 按钮基础样式 */
.custom-actions {
  display: flex;
  padding: 4px 0;
}

.custom-actions :deep(.ant-space) {
  width: 100%;
  gap: 8px !important;
  justify-content: flex-start;
}

.custom-actions :deep(.action-btn.ant-btn) {
  width: 40px;
  height: 40px;
  padding: 0;
  border: none !important;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: white !important;
}

/* 下载按钮 - 蓝紫渐变 */
.custom-actions :deep(.download-btn.ant-btn-primary) {
  background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
}

/* 分享按钮 - 蓝橙渐变 */
.custom-actions :deep(.share-btn.ant-btn-primary) {
  background: linear-gradient(135deg, #0ea5e9, #f59e0b) !important;
  box-shadow: 0 4px 15px rgba(14, 165, 233, 0.35);
}

/* 编辑按钮 - 绿色渐变 */
.custom-actions :deep(.edit-btn.ant-btn-primary) {
  background: linear-gradient(135deg, #10b981, #059669) !important;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35);
}

/* 删除按钮 - 红色渐变 */
.custom-actions :deep(.delete-btn.ant-btn-primary) {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.35);
}

/* 图标样式 */
.custom-actions :deep(.action-btn .anticon) {
  font-size: 18px;
  color: white !important;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  transition: all 0.3s ease;
}

/* 按钮悬停效果 */
.custom-actions :deep(.action-btn:hover) {
  transform: translateY(-2px);
  filter: brightness(1.1) saturate(1.1);
}

.custom-actions :deep(.action-btn:hover .anticon) {
  transform: scale(1.1);
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
}

/* 点击效果 */
.custom-actions :deep(.action-btn:active) {
  transform: scale(0.95);
  filter: brightness(0.95);
}

/* 按钮发光效果 */
.custom-actions :deep(.action-btn)::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shine 2s infinite;
}
</style>
