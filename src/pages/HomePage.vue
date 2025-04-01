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
    <a-tabs v-model:active-key="selectedCategory" @change="doSearch">
      <a-tab-pane key="0" tab="全部" />
      <a-tab-pane
        v-for="category in categoryList"
        :tab="category.categoryName"
        :key="category.id"
      />
    </a-tabs>
    <div class="tag-bar">
      <span style="margin-right: 8px">标签：</span>
      <a-space :size="[0, 8]" wrap>
        <a-checkable-tag
          v-for="(tag, index) in tagList"
          :key="tag.id"
          v-model:checked="selectedTagList[index]"
          @change="doSearch"
        >
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
import PictureList from '@/components/PictureList.vue'

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
  pageSize: 12,
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
</style>
