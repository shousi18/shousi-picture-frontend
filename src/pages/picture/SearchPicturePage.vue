<template>
  <div id="searchPicturePage">
    <h2 style="margin-bottom: 16px">以图搜图</h2>
    <a-divider />
    <h3 style="margin: 16px 0">原图：</h3>
    <a-card style="width: 240px">
      <template #cover>
        <img
          style="height: 180px; object-fit: cover"
          :alt="picture.name"
          :src="picture.thumbnailUrl ?? picture.url"
        />
      </template>
    </a-card>
    <a-divider />
    <a-space style="margin-bottom: 16px">
      <a-typography-title :level="4">识图结果：</a-typography-title>
      <a-button type="primary" @click="fetchData">
        换一批
      </a-button>
    </a-space>
    <!-- 图片列表 -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item }">
        <a-list-item style="padding: 0">
          <a :href="item.thumbUrl" target="_blank">
            <a-card>
              <template #cover>
                <img style="height: 180px; object-fit: cover" :src="item.thumbUrl" />
              </template>
            </a-card>
          </a>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getPictureVoById, searchPictureByPicture } from '@/api/pictureController'
import { message } from 'ant-design-vue'


const route = useRoute()
// 图片 id
const pictureId = computed(() => {
  return route.query?.pictureId
})
const picture = ref<API.PictureVO>({})
const dataList = ref<API.ImageSearchResult[]>([])
const loading = ref<boolean>(false)

// 获取搜图结果
const fetchData = async () => {
  loading.value = true
  const res = await searchPictureByPicture({
    pictureId: pictureId.value,
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data ?? []
    loading.value = false
  } else {
    message.error('获取数据失败，' + res.data.message)
    loading.value = false
  }
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})

// 获取老数据
const getOldPicture = async () => {
  // 获取数据
  const id = route.query?.pictureId
  if (id) {
    const res = await getPictureVoById({
      id: id,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      picture.value = data
    }
  }
}

onMounted(() => {
  getOldPicture()
})
</script>
