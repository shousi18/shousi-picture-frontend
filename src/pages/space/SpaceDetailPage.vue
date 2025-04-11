<template>
  <div id="spaceDetailPage">
    <!-- 空间信息 -->
    <a-flex justify="space-between">
      <h2>{{ space?.spaceName }}（{{ SPACE_TYPE_MAP[space?.spaceType] }}）</h2>
      <a-space size="middle">
        <a-button v-if="canUploadPicture" type="primary" :href="`/add_picture?spaceId=${id}`"> + 创建图片</a-button>
        <a-button v-if="canEditPicture" type="primary" :icon="h(EditOutlined)" @click="doBatchEdit"> 批量编辑</a-button>
        <a-button v-if="canManageSpaceUser && space?.spaceType === SPACE_TYPE_ENUM.TEAM" type="primary" ghost :icon="h(TeamOutlined)" :href="`/spaceUserManage/${id}`">
          成员管理
        </a-button>
        <a-button
          type="primary"
          ghost
          :icon="h(BarChartOutlined)"
          :href="`/space_analyze?spaceId=${id}`"
          v-if="canManageSpaceUser"
        >
          空间分析
        </a-button>
        <a-tooltip
          :title="`占用空间 ${formatFileSize(space?.totalSize)} / ${formatFileSize(space?.maxSize)}`"
        >
          <a-progress
            type="circle"
            :percent="((space?.totalSize * 100) / space?.maxSize).toFixed(1)"
            :size="42"
          />
        </a-tooltip>
      </a-space>
    </a-flex>
    <PictureSearchForm :on-search="onSearch" />
    <!-- 按颜色搜索 -->
    <a-form-item label="按颜色搜索" style="margin-top: 16px">
      <color-picker format="hex" @pureColorChange="onColorChange" />
    </a-form-item>
    <!-- 图片列表 -->
    <PictureList
      :dataList="dataList"
      :loading="loading"
      :show-op="true"
      :on-reload="fetchData"
      :canEdit="canEditPicture"
      :canDelete="canDeletePicture"
      :on-space-reload="fetchSpaceDetail"
    />
    <a-pagination
      style="text-align: right"
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      :show-total="() => `图片总数 ${total} / ${space?.maxCount}`"
      @change="onPageChange"
    />
    <BatchEditPictureModal
      ref="batchEditPictureModalRef"
      :spaceId="id as number"
      :pictureList="dataList"
      :onSuccess="onBatchEditPictureSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref, watch } from 'vue'
import {
  listPictureVoByPageUsingPost,
  searchPictureByColorUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { formatFileSize } from '../../utils'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController.ts'
import PictureList from '@/components/picture/PictureList.vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import PictureSearchForm from '@/components/picture/PictureSearchForm.vue'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'
import BatchEditPictureModal from '@/components/picture/edit/BatchEditPictureModal.vue'
import { EditOutlined, BarChartOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { SPACE_PERMISSION_ENUM, SPACE_TYPE_ENUM, SPACE_TYPE_MAP } from '../../constant/space.ts'

interface Props {
  id: number | string
}

// 搜索条件
const searchParams = ref<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})
// 弹窗组件实例
const batchEditPictureModalRef = ref()

/**
 * 按照图片主色调搜索
 * @param color
 */
const onColorChange = async (color: string) => {
  const res = await searchPictureByColorUsingPost({
    picColor: color,
    spaceId: props.id,
  })
  if (res.data.code === 0 && res.data.data) {
    const data = res.data.data ?? []
    dataList.value = data
    total.value = data.length
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

const props = defineProps<Props>()
const loginUserStore = useLoginUserStore()

const space = ref<API.SpaceVO>()

const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)

// 通用权限检查函数
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (space.value?.permissionList ?? []).includes(permission)
  })
}

// 定义权限检查
const canManageSpaceUser = createPermissionChecker(SPACE_PERMISSION_ENUM.SPACE_USER_MANAGE)
const canUploadPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_UPLOAD)
const canEditPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDeletePicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)

/**
 * 获取图片详细
 */
const fetchSpaceDetail = async () => {
  if (!props.id) {
    return
  }
  const res = await getSpaceVoByIdUsingGet({ id: props.id })
  if (res.data.code === 0 && res.data.data) {
    space.value = res.data.data
  } else {
    message.error('获取空间详细失败，' + res.data.message)
  }
}

/**
 * 获取数据
 */
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const params = {
    spaceId: props.id,
    ...searchParams.value,
  }
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

/**
 * 批量编辑成功后，刷新数据
 */
const onBatchEditPictureSuccess = () => {
  fetchData()
}

onMounted(() => {
  fetchData()
  fetchSpaceDetail()
})

watch(
  () => props.id,
  (newSpaceId) => {
    fetchData()
    fetchSpaceDetail()
  },
)

/**
 * 打开批量编辑弹窗
 */
const doBatchEdit = () => {
  if (batchEditPictureModalRef.value) {
    batchEditPictureModalRef.value.openModal()
  }
}

const onPageChange = (page, pageSize) => {
  searchParams.value.current = page
  searchParams.value.pageSize = pageSize
  fetchData()
}

const onSearch = (newSearchParams: API.PictureQueryRequest) => {
  searchParams.value = {
    ...searchParams.value,
    ...newSearchParams,
    current: 1,
  }
  fetchData()
}
</script>

<style scoped></style>
