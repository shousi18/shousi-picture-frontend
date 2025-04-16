<template>
  <div id="spaceDetailPage">
    <!-- 空间信息 -->
    <h2>我发布的图片</h2>
    <PictureSearchForm :on-search="onSearch" :userId="loginUser.id" />
    <!-- 图片列表 -->
    <PictureList
      :dataList="dataList"
      :loading="loading"
      :show-op="true"
      :on-reload="fetchData"
      :canEdit="true"
      :canDelete="true"
      :user-id="loginUser.id"
    />
    <a-pagination
      style="text-align: right"
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      :show-total="() => `共 ${total} 条`"
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
import { computed, onMounted, ref, watch } from 'vue'
import { listPictureVoByPage, searchPictureByColor } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import PictureList from '@/components/picture/PictureList.vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import PictureSearchForm from '@/components/picture/PictureSearchForm.vue'
import 'vue3-colorpicker/style.css'
import BatchEditPictureModal from '@/components/picture/edit/BatchEditPictureModal.vue'
import { SPACE_PERMISSION_ENUM } from '../../constant/space.ts'
import { useRouter } from 'vue-router'

interface Props {
  id: number | string
}

// 搜索条件
const searchParams = ref<API.PictureQueryRequest>({
  current: 1,
  pageSize: 20,
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
  const res = await searchPictureByColor({
    picColor: color,
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
const loginUser = computed(() => loginUserStore.loginUser)

const router = useRouter()

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
const canEditPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDeletePicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)

/**
 * 获取数据
 */
const fetchData = async () => {
  if (!loginUser.value.id) {
    router.push({
      path: '/user/login',
    })
    return
  }
  loading.value = true
  // 转换搜索参数
  const params = {
    spaceId: props.id,
    userId: loginUser.value.id,
    ...searchParams.value,
  }
  const res = await listPictureVoByPage(params)
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
})

watch(
  () => props.id,
  (newSpaceId) => {
    fetchData()
  },
)

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
