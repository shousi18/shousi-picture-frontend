<template>
  <div id="homePage">
    <!-- 搜索框 -->
    <div class="search-bar">
      <a-input-search
        v-model:value="searchParams.searchText"
        placeholder="从海量图片中搜索"
        enter-button="搜索"
        size="large"
        @search="doSearch"
      />
    </div>
    <!-- 分类和标签筛选 -->
    <!-- 修改分类标签部分 -->
    <div class="category-show">
      <a-tabs v-model:active-key="selectedCategory" @change="doSearch">
        <a-tab-pane key="0">
          <template #tab>
          <span class="category-tab">
            <home-outlined />
            全部
          </span>
          </template>
        </a-tab-pane>
        <a-tab-pane
          v-for="category in categoryList"
          :key="category.id"
        >
          <template #tab>
          <span class="category-tab">
            <picture-outlined />
            {{ category.categoryName }}
          </span>
          </template>
        </a-tab-pane>
      </a-tabs>
    </div>
    <div class="tag-bar">
      <span class="tag-bar-label">标签：</span>
      <a-space :size="[0, 8]" wrap>
        <a-checkable-tag
          v-for="(tag, index) in tagList"
          :key="tag.id"
          v-model:checked="selectedTagList[index]"
          @change="doSearch"
          class="custom-tag"
        >
          <template #icon><tags-outlined /></template>
          {{ tag.tagName }}
        </a-checkable-tag>
      </a-space>
    </div>
    <!-- 图片列表 -->
    <PictureList :dataList="dataList" :loading="loading" />
    <a-pagination
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      style="text-align: right"
      @change="onPageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { listPictureVoByPageUsingPost } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { listHotTagsUsingGet } from '@/api/tagController.ts'
import { listHotCategoriesUsingGet } from '@/api/categoryController.ts'
import PictureList from '@/components/picture/PictureList.vue'
import { HomeOutlined, PictureOutlined, TagsOutlined } from '@ant-design/icons-vue'

const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)

// 标签和分类列表
const categoryList = ref<API.CategoryVO[]>([])
const selectedCategory = ref<number | string>('0')
const tagList = ref<API.TagVO[]>([])
const selectedTagList = ref<boolean[]>([])

// 搜索
const doSearch = () => {
  // 重置搜索条件
  searchParams.current = 1
  fetchData()
}

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 20,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const params = {
    ...searchParams,
    tagIds: [] as number[],
  }
  if (selectedCategory.value !== '0') {
    params.categoryId = selectedCategory.value
  }
  // [true, false, false] => ['java']
  selectedTagList.value.forEach((useTag, index) => {
    // 元素为true，则添加到参数当中
    if (useTag) {
      params.tagIds.push(tagList.value[index].id)
    }
  })
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
 * 获取标签和分类选项
 * @param values
 */
const getTagCategoryOptions = async () => {
  try {
    const [tagRes, categoryRes] = await Promise.all([
      listHotTagsUsingGet(),
      listHotCategoriesUsingGet(),
    ])
    if (tagRes.data.code === 0 && tagRes.data.data) {
      tagList.value = tagRes.data.data
    }
    if (categoryRes.data.code === 0 && categoryRes.data.data) {
      categoryList.value = categoryRes.data.data
    }
  } catch (error) {
    message.error('获取分类/标签失败')
  }
}

const onPageChange = (page, pageSize) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}

onMounted(() => {
  fetchData()
  getTagCategoryOptions()
})
</script>

<style scoped>
#homePage {
  margin-bottom: 16px;
}

#homePage .search-bar {
  max-width: 480px;
  margin: 0 auto 16px;
}

#homePage .tag-bar {
  margin-bottom: 16px;
}

/* 分类标签容器 */
.category-show {
  margin: 24px 0;
}

/* 居中标签栏 */
:deep(.ant-tabs-nav) {
  display: flex;
  justify-content: center;
  margin: 0;
}

/* 单个标签样式 */
.category-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  transition: all 0.3s ease;
}

/* 选中状态 */
:deep(.ant-tabs-tab-active) .category-tab {
  color: #6366f1;

  .anticon {
    color: #6366f1;
    filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.2));
  }
}

/* 悬停效果 */
:deep(.ant-tabs-tab:hover) .category-tab {
  color: #6366f1;
  transform: translateY(-1px);

  .anticon {
    color: #8b5cf6;
  }
}

/* 图标基础样式 */
:deep(.ant-tabs-tab .anticon) {
  font-size: 16px;
  color: #64748b;
  transition: all 0.3s ease;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .category-tab {
    padding: 8px 12px;
    font-size: 14px;
  }

  :deep(.ant-tabs-nav) {
    flex-wrap: wrap;
    row-gap: 8px;
  }
}

/* 标签容器整体样式 */
.tag-bar {
  margin: 24px 0;
  padding: 0 24px;
}

.tag-bar-label {
  font-weight: 500;
  color: #64748b;
  margin-right: 12px;
}

/* 自定义标签样式 */
:deep(.custom-tag) {
  border-radius: 6px !important;
  padding: 6px 12px !important;
  border: 1px solid #e2e8f0 !important;
  background: #f8fafc !important;
  color: #475569 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;

  /* 图标样式 */
  .anticon {
    font-size: 14px;
    margin-right: 6px;
    color: #94a3b8;
    transition: inherit;
  }
}

/* 修正后 */
:deep(.ant-tag-checkable-checked) {
  background: rgba(245, 158, 11, 0.08) !important;
  border-color: rgba(245, 158, 11, 0.3) !important;
  color: #d97706 !important;
  box-shadow: 0 2px 8px -2px rgba(245, 158, 11, 0.15);

  .anticon {
    color: #d97706 !important;
    filter: drop-shadow(0 1px 2px rgba(245, 158, 11, 0.2));
  }
}

/* 悬停状态 - 保持品牌色 */
:deep(.custom-tag):hover {
  border-color: #6366f1 !important;
  box-shadow: 0 4px 12px -2px rgba(99, 102, 241, 0.15);
}

/* 选中状态悬停 - 橙色加深 */
:deep(.custom-tag-checked:hover) {
  border-color: #ea580c !important;
  color: #ea580c !important;

  .anticon {
    color: #ea580c !important;
  }
}
</style>
