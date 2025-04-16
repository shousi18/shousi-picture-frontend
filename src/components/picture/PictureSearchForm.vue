<template>
  <div class="picture-search-form">
    <!-- 搜索表单 -->
    <a-form class="searchForm" layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="关键词" name="searchText">
        <a-input
          v-model:value="searchParams.searchText"
          placeholder="从名称和简介搜索"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="分类" name="categoryId">
        <a-select
          v-model:value="searchParams.categoryId"
          style="min-width: 120px"
          :options="categoryOptions"
          placeholder="请输入分类"
          allowClear
        />
      </a-form-item>
      <a-form-item label="标签" name="tagIds">
        <a-select
          v-model:value="searchParams.tagIds"
          style="min-width: 180px"
          :options="tagOptions"
          mode="tags"
          placeholder="请输入标签"
          allowClear
        />
      </a-form-item>
      <a-form-item label="日期" name="dateRange">
        <a-range-picker
          style="width: 400px"
          show-time
          v-model:value="dateRange"
          :placeholder="['编辑开始日期', '编辑结束时间']"
          format="YYYY-MM-DD HH:mm:ss"
          :presets="rangePresets"
          @change="onRangeChange"
        />
      </a-form-item>
      <a-form-item v-if="userId" label="审核状态" name="reviewStatus">
        <a-select
          v-model:value="searchParams.reviewStatus"
          style="min-width: 120px"
          :options="PIC_REVIEW_STATUS_OPTIONS"
          placeholder="请选择审核状态"
          allowClear
        />
      </a-form-item>
      <a-collapse v-model:activeKey="activeKey" :bordered="false">
        <a-collapse-panel key="1" header="更多搜索条件">
          <a-form-item label="名称" name="name">
            <a-input v-model:value="searchParams.name" placeholder="请输入名称" allow-clear />
          </a-form-item>
          <a-form-item label="简介" name="introduction">
            <a-input v-model:value="searchParams.introduction" placeholder="请输入简介" allow-clear />
          </a-form-item>
          <a-form-item label="宽度" name="picWidth">
            <a-input-number v-model:value="searchParams.picWidth" />
          </a-form-item>
          <a-form-item label="高度" name="picHeight">
            <a-input-number v-model:value="searchParams.picHeight" />
          </a-form-item>
          <a-form-item label="格式" name="picFormat">
            <a-input v-model:value="searchParams.picFormat" placeholder="请输入格式" allow-clear />
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>
      <a-form-item>
        <a-space>
          <a-button type="primary" html-type="submit" style="width: 96px">搜索</a-button>
          <a-button html-type="reset" @click="doClear">重置</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { listHotTags } from '@/api/tagController.ts'
import { listHotCategories } from '@/api/categoryController.ts'
import { message } from 'ant-design-vue'
import { PIC_REVIEW_STATUS_OPTIONS } from '@/constant/picture.ts'

interface Props {
  onSearch?: (searchParams: API.PictureQueryRequest) => void
  userId?: number
}

const props = defineProps<Props>()
const dateRange = ref<Date[]>([])
const searchParams = reactive<API.PictureQueryRequest>({})
const tagOptions = ref<API.TagVO[]>([])
const categoryOptions = ref<API.CategoryVO[]>([])

const activeKey = ref<string[]>(['']);

const rangePresets = ref([
  {
    label: '最近一周',
    value: [dayjs().add(-7, 'd'), dayjs()],
  },
  {
    label: '最近一月',
    value: [dayjs().add(-30, 'd'), dayjs()],
  },
  {
    label: '最近三个月',
    value: [dayjs().add(-90, 'd'), dayjs()],
  },
  {
    label: '最近半年',
    value: [dayjs().add(-180, 'd'), dayjs()],
  },
])

/**
 * 日期范围更改时触发
 */
const onRangeChange = (dates: any[], dateStrings: string[]) => {
  if (dates?.length >= 2) {
    searchParams.startEditTime = dateStrings[0]
    searchParams.endEditTime = dateStrings[1]
  } else {
    searchParams.startEditTime = undefined
    searchParams.endEditTime = undefined
  }
}

/**
 * 获取标签分类选项
 * @param values
 */
const getTagCategoryOptions = async () => {
  try {
    const [tagRes, categoryRes] = await Promise.all([
      listHotTags(),
      listHotCategories(),
    ])

    if (tagRes.data.code === 0 && tagRes.data.data) {
      tagOptions.value = tagRes.data.data.map((tag) => ({
        value: tag.id,
        label: tag.tagName,
        id: tag.id,
      }))
    }

    if (categoryRes.data.code === 0 && categoryRes.data.data) {
      categoryOptions.value = categoryRes.data.data.map((category) => ({
        value: category.id,
        label: category.categoryName,
        id: category.id,
      }))
    }
  } catch (error) {
    message.error('获取分类/标签失败')
  }
}

/**
 * 清空搜索条件
 */
const doClear = () => {
  Object.keys(searchParams).forEach((key) => {
    searchParams[key] = undefined
  })
  // 日期格式设置位undefined时不能清空，所以需要手动设置
  dateRange.value = []
  props.onSearch?.(searchParams)
}

/**
 * 获取数据
 */
const doSearch = () => {
  props.onSearch?.(searchParams)
}

onMounted(() => {
  getTagCategoryOptions()
})
</script>

<style scoped>
.picture-search-form .ant-form-item {
  margin-top: 16px;
}

.searchForm {
  margin-bottom: 16px;
}

:deep(.ant-collapse) {
  background: #fff;
  border: none;
  margin: 12px 0;
}

:deep(.ant-collapse-header) {
  height: 5px;
  color: #1890ff !important;
  transition: all 0.3s;
}

:deep(.ant-collapse-content-box) {
  padding: 16px 0 !important;
  display: flex;
  flex-wrap: wrap;
  gap: 24px; /* 控制表单项间距 */
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 12px;
}

</style>
