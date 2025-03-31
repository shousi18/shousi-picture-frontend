<template>
  <div id="userManagePage">
    <a-flex justify="space-between">
      <h2>图片管理</h2>
      <a-space>
        <a-button type="primary" href="/add_picture">+ 创建图片</a-button>
        <a-button type="primary" href="/add_picture/batch">+ 创建批量图片</a-button>
      </a-space>
    </a-flex>
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="关键词" name="searchText">
        <a-input
          v-model:value="searchParams.searchText"
          placeholder="从名称和简介搜索"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="类型" name="category">
        <a-input v-model:value="searchParams.categoryId" placeholder="请输入类型" allow-clear />
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select
          v-model:value="searchParams.tagIds"
          mode="tags"
          placeholder="请输入标签"
          style="min-width: 180px"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="审核状态" name="reviewStatus">
        <a-select
          v-model:value="searchParams.reviewStatus"
          :options="PIC_REVIEW_STATUS_OPTIONS"
          placeholder="请输入审核状态"
          style="min-width: 180px"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>
    <div style="margin-bottom: 16px" />
    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'url'">
          <a-image :src="record.url" :width="120" />
        </template>
        <!-- 标签 -->
        <template v-if="column.dataIndex === 'category'">
          {{ record.category?.categoryName }}
        </template>
        <template v-if="column.dataIndex === 'tagList'">
          <a-space wrap>
            <a-tag v-for="tag in record.tagList" :key="tag">{{
              tag?.tagName
            }}</a-tag>
          </a-space>
        </template>
        <!-- 图片信息 -->
        <template v-if="column.dataIndex === 'picInfo'">
          <div>格式：{{ record.picFormat }}</div>
          <div>宽度：{{ record.picWidth }}</div>
          <div>高度：{{ record.picHeight }}</div>
          <div>宽高比：{{ record.picScale }}</div>
          <div>大小：{{ (record.picSize / 1024).toFixed(2) }}KB</div>
        </template>
        <!-- 审核信息 -->
        <template v-if="column.dataIndex === 'reviewMessage'">
          <div>审核状态：{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}</div>
          <div>审核信息：{{ record.reviewMessage }}</div>
          <div>审核人：{{ record.reviewerId }}</div>
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.dataIndex === 'editTime'">
          {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space wrap>
            <a-popconfirm
              title="确认审核通过该图片吗？"
              ok-text="确认"
              cancel-text="取消"
              @confirm="handleReview(record, PIC_REVIEW_STATUS_ENUM.PASS)"
            >
              <a-button v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS" type="link">
                通过
              </a-button>
            </a-popconfirm>
            <a-button
              v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT"
              danger
              @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.REJECT)"
            >
              拒绝
            </a-button>
            <a-button type="link" :href="`/add_picture?id=${record.id}`">编辑</a-button>
            <a-popconfirm
              title="确认删除该图片吗？"
              ok-text="确认"
              cancel-text="取消"
              @confirm="doDelete(record.id)"
            >
              <a-button type="link" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
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

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  deletePictureUsingPost,
  listPictureByPageUsingPost,
  pictureReviewUsingPost,
} from '@/api/pictureController.ts'
import {
  PIC_REVIEW_STATUS_ENUM,
  PIC_REVIEW_STATUS_MAP,
  PIC_REVIEW_STATUS_OPTIONS,
} from '../../constant/picture.ts'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '图片',
    dataIndex: 'url',
  },
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'category',
  },
  {
    title: '标签',
    dataIndex: 'tagList',
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
    width: 80,
  },
  {
    title: '审核信息',
    dataIndex: 'reviewMessage',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 数据
const dataList = ref<any>([])
const total = ref(0)
const currentRecord = ref<API.PictureVO | null>(null)
const showModal = ref<boolean>(false)
const rejectReason = ref<any>()
// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
  }
})

// 获取数据
const fetchData = async () => {
  const res = await listPictureByPageUsingPost({
    ...searchParams,
  })
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})

// 获取数据
const doSearch = () => {
  // 重置搜索条件
  searchParams.current = 1
  fetchData()
}

// 表格变化处理
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

const doDelete = async (id: number) => {
  if (id == null) {
    message.error('id 为空')
    return
  }
  const deleteResponse = await deletePictureUsingPost({ id })
  if (deleteResponse.data.data && deleteResponse.data.code === 0) {
    await fetchData()
    message.success('删除成功')
  } else {
    message.error('删除失败')
  }
}

/**
 * 处理审核
 * @param record
 * @param reviewStatus
 */
const handleReview = async (record: API.Picture, reviewStatus: number) => {
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
    fetchData()
  } else {
    message.error(`审核失败`, res.data.message)
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
      fetchData()
    }
  } catch (e) {
    message.error('操作失败')
  } finally {
    showModal.value = false
  }
}
</script>

<style scoped>
.picture-upload :deep(.ant-upload) {
  width: 100% !important;
  height: 100% !important;
  min-height: 152px;
  min-width: 152px;
}

.picture-upload img {
  max-width: 100%;
  max-height: 480px;
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
