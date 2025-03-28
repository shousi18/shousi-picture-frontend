<template>
  <div id="addPicturePage">
    <h2 style="margin-bottom: 16px">
      {{ route.query?.id ? '编辑图片' : '添加图片'}}
    </h2>
    <PictureUpload :picture="picture" :on-success="onSuccess" />
    <a-form v-if="picture" layout="vertical" :model="pictureForm" @finish="handleSubmit">
      <a-form-item name="name" label="名称">
        <a-input v-model:value="pictureForm.name" placeholder="请输入图片名称" allow-clear />
      </a-form-item>
      <a-form-item name="introduction" label="简介">
        <a-textarea
          v-model:value="pictureForm.introduction"
          placeholder="请输入简介"
          :auto-size="{ minRows: 2, maxRows: 5 }"
          allow-clear
        />
      </a-form-item>
      <a-form-item name="category" label="分类">
        <a-auto-complete
          v-model:value="pictureForm.category"
          placeholder="请输入分类"
          allow-clear
          :options="categoryOptions"
        />
      </a-form-item>
      <a-form-item name="tags" label="标签">
        <a-select
          v-model:value="pictureForm.tags"
          mode="tags"
          placeholder="请输入标签"
          allow-clear
          :options="tagOptions"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">
          {{ picture?.id ? '更新' : '添加' }}
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import PictureUpload from '@/components/PictureUpload.vue'
import { onMounted, reactive, ref } from 'vue'
import {
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'

const picture = ref<API.PictureVO>()
const categoryOptions = ref<string[]>([])
const tagOptions = ref<string[]>([])
const pictureForm = reactive<API.PictureEditRequest>({})

const router = useRouter()
const route = useRoute()

/**
 * 图片上传成功
 * @param newPicture
 */
const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
}

/**
 * 提交表单
 * @param values 表单内容
 */
const handleSubmit = async (values: API.PictureEditRequest) => {
  const pictureId = picture.value?.id
  if (!pictureId) {
    return
  }
  const res = await editPictureUsingPost({
    id: pictureId,
    ...values,
  })
  // 操作成功
  if (res.data.code === 0 && res.data.data) {
    message.success('创建成功')
    // 跳转详情页
    router.push({
      path: `/picture/${pictureId}`,
      replace: false,
    })
  } else {
    message.error('创建失败，' + res.data.message)
  }
}

/**
 * 获取标签分类选项
 * @param values
 */
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  // 操作成功
  if (res.data.code === 0 && res.data.data) {
    tagOptions.value = (res.data.data.tagList ?? []).map((item: string) => {
      return {
        value: item,
        label: item,
      }
    })
    categoryOptions.value = (res.data.data.categoryList ?? []).map((item: string) => {
      return {
        value: item,
        label: item,
      }
    })
  } else {
    message.error('创建失败，' + res.data.message)
  }
}

// 获取旧的数据
const getOldPicture = async () => {
  const id = route.query?.id
  if(id) {
    const res = await getPictureVoByIdUsingGet({ id })
    if(res.data.code === 0 && res.data.data) {
      const data = res.data.data
      picture.value = data
      pictureForm.name = data.name
      pictureForm.introduction = data.introduction
      pictureForm.category = data.category
      pictureForm.tags = data.tags
    }
  }
}

onMounted(() => {
  getTagCategoryOptions()
  getOldPicture()
})
</script>

<style scoped>
#addPicturePage {
  width: 720px;
  margin: 0 auto;
}
</style>
