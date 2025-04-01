<template>
  <div id="spaceDetailPage">
    <!-- 空间信息 -->
    <a-flex justify="space-between">
      <h2>{{ space?.spaceName }}（私有空间）</h2>
      <a-space size="middle">
        <a-button type="primary" :href="`/add_picture?spaceId=${id}`"> + 创建图片 </a-button>
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
    <!-- 图片列表 -->
    <PictureList
      :dataList="dataList"
      :loading="loading"
      :show-op="true"
      :on-reload="fetchData"
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { listPictureVoByPageUsingPost } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { formatFileSize } from '../../utils'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController.ts'
import PictureList from '@/components/PictureList.vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

interface Props {
  id: number | string
}

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

const props = defineProps<Props>()
const loginUserStore = useLoginUserStore();

const space = ref<API.SpaceVO>()

const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)

/**
 * 获取图片详细
 */
const fetchSpaceDetail = async () => {
  if (loginUserStore.loginUser !== space.value?.userId) {
    message.error('您无权限访问别人的空间')
    return
  }
  const res = await getSpaceVoByIdUsingGet({ id: props.id })
  if (res.data.code === 0 && res.data.data) {
    space.value = res.data.data
    message.success('获取空间详细成功')
  } else {
    message.error('获取空间详细失败，' + res.data.message)
  }
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const params = {
    spaceId: props.id,
    ...searchParams,
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

onMounted(() => {
  fetchSpaceDetail()
  fetchData()
})

const onPageChange = (page, pageSize) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}
</script>

<style scoped></style>
