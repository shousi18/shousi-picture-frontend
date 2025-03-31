<template>
  <div id="addPictureBatchPage">
    <a-tabs v-model:active-key="activeKey">
      <a-tab-pane key="common" tab="批量创建缩略图片">
        <a-form layout="vertical" :model="formData" @finish="handleSubmit">
          <a-form-item label="关键词" name="searchText">
            <a-input v-model:value="formData.searchText" placeholder="请输入关键词" />
          </a-form-item>
          <a-form-item label="抓取数量" name="count">
            <a-input-number
              v-model:value="formData.count"
              placeholder="请输入数量"
              style="min-width: 180px"
              :min="1"
              :max="30"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="偏移量" name="count">
            <a-input-number
              v-model:value="formData.first"
              placeholder="请输入偏移量"
              style="min-width: 180px"
              :min="0"
              :max="9999"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="名称前缀" name="namePrefix">
            <a-input v-model:value="formData.namePrefix" placeholder="请输入名称前缀，会自动补充序号" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading">
              执行任务
            </a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="distinct" tab="批量创建高清图片">
        <a-form layout="vertical" :model="formData" @finish="handleDistinctSubmit">
          <a-form-item label="关键词" name="searchText">
            <a-input v-model:value="formData.searchText" placeholder="请输入关键词" />
          </a-form-item>
          <a-form-item label="抓取数量（高清图片体积大，建议少量创建）" name="count">
            <a-input-number
              v-model:value="formData.count"
              placeholder="请输入数量"
              style="min-width: 180px"
              :min="1"
              :max="30"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="偏移量" name="count">
            <a-input-number
              v-model:value="formData.first"
              placeholder="请输入偏移量"
              style="min-width: 180px"
              :min="0"
              :max="9999"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="名称前缀" name="namePrefix">
            <a-input v-model:value="formData.namePrefix" placeholder="请输入名称前缀，会自动补充序号" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading">
              执行任务
            </a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { uploadDistinctPictureByBatchUsingPost, uploadPictureByBatchUsingPost } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'

const formData = reactive<API.PictureUploadByBatchRequest>({
  searchText: '',
  count: 10,
  namePrefix: '',
  first: 0,
})
const loading = ref<boolean>(false)

const router = useRouter()
const activeKey = ref<string>('common')

/**
 * 提交表单
 * @param values 表单内容
 */
const handleSubmit = async (values: API.PictureUploadByBatchRequest) => {
  loading.value = true
  const res = await uploadPictureByBatchUsingPost({
    ...formData,
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('批量创建成功')
    router.push({
      path: '/admin/pictureManage',
    })
  } else {
    message.error('创建失败，' + res.data.message)
  }
  loading.value = false
}

const handleDistinctSubmit = async (values: API.PictureUploadByBatchRequest) => {
  loading.value = true
  const res = await uploadDistinctPictureByBatchUsingPost({
    ...formData,
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('批量创建成功')
    router.push({
      path: '/admin/pictureManage',
    })
  } else {
    message.error('创建失败，' + res.data.message)
  }
  loading.value = false
}
</script>

<style scoped>
#addPicturePage {
  width: 720px;
  margin: 0 auto;
}
</style>
