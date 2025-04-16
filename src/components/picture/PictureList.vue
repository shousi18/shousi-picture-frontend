<template>
  <div class="pictureList">
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <!-- 单张图片 -->
          <a-card hoverable @click="doClickPicture(picture)">
            <template #cover>
              <img
                :alt="picture.name"
                :src="picture.thumbnailUrl ?? picture.url"
                style="height: 180px; object-fit: cover"
              />
            </template>
            <a-card-meta :title="picture.name">
              <template #description>
                <a-flex>
                  <a-tag color="green">
                    {{ picture.category.categoryName ?? '默认' }}
                  </a-tag>
                  <a-tag v-for="tag in picture.tagList" :key="tag">
                    {{ tag.tagName }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>
            <template v-if="showOp" #actions>
              <a-space @click="(e) => doShare(picture, e)">
                <share-alt-outlined />
                分享
              </a-space>
              <a-space @click="(e) => doSearch(picture, e)">
                <search-outlined />
                搜索
              </a-space>
              <a-space v-if="canEdit" @click="(e) => doEdit(picture, e)">
                <edit-outlined />
                编辑
              </a-space>
              <a-space v-if="canDelete" @click="(e) => doDelete(picture, e)">
                <delete-outlined />
                删除
              </a-space>
            </template>

            <!-- 新增状态显示区域 -->
            <div v-if="userId" class="status-info">
              <a-space v-if="picture.reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS">
                <check-circle-outlined style="color: #10b981; font-size: 16px" />
                <span class="status-pass">已通过</span>
              </a-space>
              <a-space v-else-if="picture.reviewStatus === PIC_REVIEW_STATUS_ENUM.REJECT">
                <close-circle-outlined style="color: #ef4444; font-size: 16px" />
                <span class="status-reject">已拒绝：{{ picture?.reviewMessage}}</span>
              </a-space>
              <a-space v-else-if="picture.reviewStatus === PIC_REVIEW_STATUS_ENUM.REVIEWING">
                <clock-circle-outlined style="color: #64748b; font-size: 16px" />
                <span class="status-pending">待审核</span>
              </a-space>
            </div>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
    <ShareModal ref="shareModalRef" :link="shareLink" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  ShareAltOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons-vue'
import { deletePicture } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import ShareModal from '@/components/ShareModal.vue'
import { ref } from 'vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { PIC_REVIEW_STATUS_ENUM } from '@/constant/picture.ts'

interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  showOp?: boolean
  onReload?: () => void
  onSpaceReload?: () => void
  canDelete?: boolean
  canEdit?: boolean
  userId: number
}

const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOp: false,
  canEdit: false,
  canDelete: false,
  userId: undefined,
})

const loginUserStore = useLoginUserStore()
const loginUser = loginUserStore.loginUser

const router = useRouter()
// 弹窗实例
const shareModalRef = ref()
// 分享链接
const shareLink = ref<string>()

const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

const doShare = (picture, e) => {
  e.stopPropagation()
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.id}`
  if (shareModalRef.value) {
    shareModalRef.value.openModal()
  }
}

/**
 * 搜索
 */
const doSearch = (picture, e) => {
  e.stopPropagation()
  router.push(`/search_picture_so?pictureId=${picture.id}`)
}

/**
 * 编辑按钮
 */
const doEdit = (picture, e) => {
  // 防止事件冒泡
  e.stopPropagation()
  router.push({
    path: '/add_picture',
    query: {
      id: picture?.id,
      spaceId: picture.spaceId,
    },
  })
}

/**
 * 删除按钮
 */
const doDelete = (picture, e) => {
  // 防止事件冒泡
  e.stopPropagation()
  if (picture?.id) {
    deletePicture({ id: picture?.id }).then((res) => {
      if (res.data.code === 0) {
        message.success('删除成功')
        props?.onReload?.()
        props?.onSpaceReload?.()
      } else {
        message.error('删除失败，' + res.data.message)
      }
    })
  }
}
</script>

<style scoped>
.pictureList {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

/* 列表项间距优化 */
.pictureList .ant-list-item {
  padding: 8px !important;
}

/* 卡片基础样式 */
.pictureList .ant-card {
  border-radius: 12px !important;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.pictureList .ant-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

/* 封面图样式 */
.pictureList .ant-card-cover {
  padding: 12px;
  background: #f8fafc;
}

.pictureList .ant-card-cover img {
  border-radius: 8px;
  aspect-ratio: 4/3;
  transition: transform 0.3s ease;
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.pictureList .ant-card-cover:hover img {
  transform: scale(1.02);
}

/* 卡片内容区域 */
.pictureList .ant-card-meta {
  padding: 2px 0;
}

.pictureList .ant-card-meta-title {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  margin: 12px 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 标签样式 */
.pictureList .ant-tag {
  margin: 4px !important;
  background: rgba(99, 102, 241, 0.08) !important;
  border: 1px solid rgba(99, 102, 241, 0.15) !important;
  color: #6366f1 !important;
  border-radius: 6px !important;
  padding: 0 8px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pictureList .ant-tag-green {
  background: rgba(16, 185, 129, 0.08) !important;
  border-color: rgba(16, 185, 129, 0.15) !important;
  color: #10b981 !important;
}

/* 操作按钮区域 */
.pictureList .ant-card-actions {
  background: #fff !important;
  border-top: 1px solid rgba(0, 0, 0, 0.04) !important;
  padding: 8px 0;
}

.pictureList .ant-card-actions li {
  margin: 0;
  padding: 8px;
  width: auto;
  flex: 1;
}

.pictureList .ant-card-actions .ant-space {
  width: 100%;
  justify-content: center;
  color: #64748b;
  transition: all 0.2s ease;
}

.pictureList .ant-card-actions .ant-space:hover {
  color: #6366f1;
  transform: translateY(-1px);
}

.pictureList .ant-card-actions .ant-space:hover .anticon {
  filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.2));
}

.pictureList .ant-card-actions .anticon {
  font-size: 16px;
  transition: all 0.2s ease;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .pictureList {
    padding: 12px;
  }

  .pictureList .ant-card-cover img {
    height: 160px;
  }
}

/* 新增状态样式 */
.status-info {
  border-top: 2px solid rgba(0, 0, 0, 0.04);
}

.status-pass {
  color: #10b981;
  font-weight: 500;
}

.status-reject {
  color: #ef4444;
  font-weight: 500;
}

.status-pending {
  color: #64748b;
  font-weight: 500;
}
</style>
