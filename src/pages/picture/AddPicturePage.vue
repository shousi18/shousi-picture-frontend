<template>
  <div id="addPicturePage">
    <h2 style="margin-bottom: 16px">
      {{ route.query?.id ? '编辑图片' : '添加图片' }}
    </h2>
    <a-typography-paragraph v-if="spaceId" type="secondary">
      保存至空间：<a :href="`/space/${spaceId}`" target="_blank">{{ space?.spaceName }}</a>
    </a-typography-paragraph>
    <a-tabs v-model:activeKey="uploadType">
      <a-tab-pane key="file" tab="文件上传">
        <PictureUpload :picture="picture" :spaceId="spaceId" :on-success="onSuccess" />
      </a-tab-pane>
      <a-tab-pane key="url" tab="URL上传">
        <UrlPictureUpload :picture="picture" :spaceId="spaceId" :on-success="onSuccess" />
      </a-tab-pane>
    </a-tabs>
    <!--  图片编辑区域  -->
    <div v-if="picture" class="edit-bar">
      <a-space>
        <a-button :icon="h(EditOutlined)" @click="doEditPicture">编辑图片</a-button>
        <a-button type="primary" :icon="h(FullscreenOutlined)" @click="doImagePainting">
          AI 扩图
        </a-button>
      </a-space>
      <ImageCropper
        ref="imageCropperRef"
        :imageUrl="picture?.url"
        :picture="picture"
        :spaceId="spaceId"
        :space="space"
        :onSuccess="onCropSuccess"
      />
      <ImageOutPainting
        ref="imageOutPaintingRef"
        :picture="picture"
        :spaceId="spaceId"
        :onSuccess="onImageOutPaintingSuccess"
      />
    </div>
    <!--  表单组件  -->
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
      <a-form-item name="categoryId" label="分类">
        <a-select
          v-model:value="pictureForm.categoryId"
          placeholder="至少选择一个分类"
          allow-clear
          :options="categoryOptions"
        />
      </a-form-item>
      <a-form-item name="tagIds" label="标签">
        <a-select
          v-model:value="pictureForm.tagIds"
          mode="multiple"
          placeholder="至少选择一个标签"
          allow-clear
        >
          <a-select-option
            v-for="tag in tagOptions"
            :key="tag.id"
            :value="tag.id"
            :disabled="pictureForm?.tagIds?.length >= 5 && !pictureForm?.tagIds?.includes(tag.id)"
          >
            {{ tag.label }}
          </a-select-option>
        </a-select>
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
import PictureUpload from '@/components/picture/upload/PictureUpload.vue'
import { computed, h, nextTick, onMounted, reactive, ref, watchEffect } from 'vue'
import { editPicture, getPictureVoById } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { listCategories, listHotCategories } from '@/api/categoryController.ts'
import { listHotTags, listTags } from '@/api/tagController.ts'
import UrlPictureUpload from '@/components/picture/upload/UrlPictureUpload.vue'
import { EditOutlined, FullscreenOutlined } from '@ant-design/icons-vue'
import ImageCropper from '@/components/picture/edit/ImageCropper.vue'
import ImageOutPainting from '@/components/picture/ImageOutPainting.vue'
import { getSpaceVoById } from '@/api/spaceController.ts'

const picture = ref<API.PictureVO>()
const categoryOptions = ref<any>([])
const tagOptions = ref<any>([])
const pictureForm = reactive<API.PictureEditRequest>({
  name: '',
  introduction: '',
  categoryId: undefined,
  tagIds: [],
})

const router = useRouter()
const route = useRoute()
const uploadType = ref<'file' | 'url'>('file')

const spaceId = computed(() => {
  return route.query?.spaceId
})

const space = ref<API.SpaceVO>()

// 获取空间信息
const fetchSpace = async () => {
  // 获取数据
  if (spaceId.value) {
    const res = await getSpaceVoById({
      id: spaceId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    }
  }
}

watchEffect(() => {
  fetchSpace()
})

// AI 扩图弹窗容器引用
const imageOutPaintingRef = ref()

/**
 * 打开AI扩图弹窗
 */
const doImagePainting = () => {
  if (imageOutPaintingRef.value) {
    imageOutPaintingRef.value.openModal()
  }
}

/**
 * 扩图成功事件
 * @param newPicture
 */
const onImageOutPaintingSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}

// 图片编辑弹窗容器引用
const imageCropperRef = ref()

/**
 * 打开编辑图片弹窗
 */
const doEditPicture = () => {
  if (imageCropperRef.value) {
    imageCropperRef.value.openModal()
  }
}

/**
 * 编辑成功事件
 * @param newPicture
 */
const onCropSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}

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
  const res = await editPicture({
    id: pictureId,
    spaceId: spaceId.value,
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
  try {
    const [tagRes, categoryRes] = await Promise.all([listTags(), listCategories()])

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
 * 获取旧的数据
 */
const getOldPicture = async () => {
  const id = route.query?.id
  if (!id) return
  try {
    const res = await getPictureVoById({ id })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      picture.value = data
      // 填充表单基础字段
      // 确保选项数据已加载后再设置表单值
      await nextTick()
      pictureForm.name = data.name
      pictureForm.introduction = data.introduction
      pictureForm.categoryId = data.category?.id
      pictureForm.tagIds = data.tagList?.map((tag) => tag.id)
      console.log(data.category)
    }
  } catch (error) {
    message.error('获取图片详情失败')
  }
}

onMounted(async () => {
  await getTagCategoryOptions()
  await getOldPicture()
})
</script>

<style scoped>
#addPicturePage {
  width: 720px;
  margin: 0 auto;
}

#addPicturePage .edit-bar {
  text-align: center;
  margin: 16px 0;
}
</style>
