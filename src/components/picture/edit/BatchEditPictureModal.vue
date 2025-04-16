<template>
  <a-modal v-model:visible="visible" title="批量编辑图片" :footer="false" @cancel="closeModal">
    <a-typography-paragraph type="secondary">* 只对当前页面的图片生效</a-typography-paragraph>
    <!-- 表单项 -->
    <a-form layout="vertical" :model="formData" @finish="handleSubmit">
      <a-form-item label="分类" name="categoryId">
        <a-select
          v-model:value="formData.categoryId"
          :options="categoryOptions"
          placeholder="请输入分类"
          allowClear
        />
      </a-form-item>
      <a-form-item label="标签" name="tagIds">
        <a-select
          v-model:value="formData.tagIds"
          mode="multiple"
          placeholder="至少选择一个标签"
          allow-clear
        >
          <a-select-option
            v-for="tag in tagOptions"
            :key="tag.id"
            :value="tag.id"
            :disabled="formData?.tagIds?.length >= 5 && !formData?.tagIds?.includes(tag.id)"
          >
            {{ tag.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="命名规则" name="nameRule">
        <a-input
          v-model:value="formData.nameRule"
          placeholder="请输入命名规则，输入 {序号} 可动态生成"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">提交</a-button>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { defineProps, ref, withDefaults, defineExpose, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { listHotTags, listTags } from '@/api/tagController.ts'
import { listCategories, listHotCategories } from '@/api/categoryController.ts'
import { editPictureByBatch } from '@/api/pictureController.ts'

// 定义组件属性类型
interface Props {
  pictureList: API.PictureVO[]
  spaceId: number
  onSuccess: () => void
}

// 给组件指定初始值
const props = withDefaults(defineProps<Props>(), {})
// 控制弹窗可见性
const visible = ref(false)
// 初始化表单数据
const formData = reactive<API.PictureEditByBatchRequest>({})
const categoryOptions = ref<API.CategoryVO[]>([])
const tagOptions = ref<API.TagVO[]>([])

// 打开弹窗
const openModal = () => {
  visible.value = true
}

// 关闭弹窗
const closeModal = () => {
  Object.keys(formData).map((key) => {
    formData[key] = undefined
  })
  visible.value = false
}

// 暴露函数给父组件
defineExpose({
  openModal,
})

/**
 * 获取标签分类选项
 * @param values
 */
const getTagCategoryOptions = async () => {
  try {
    const [tagRes, categoryRes] = await Promise.all([
      listTags(),
      listCategories(),
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
 * 提交表单时处理
 */
const handleSubmit = async (values: any) => {
  if (!props.pictureList) {
    return
  }
  const res = await editPictureByBatch({
    pictureIdList: props.pictureList.map((picture) => picture.id),
    spaceId: props.spaceId,
    ...values,
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('操作成功')
    closeModal()
    props.onSuccess?.()
  } else {
    message.error('操作失败，' + res.data.message)
  }
}


onMounted(() => {
  getTagCategoryOptions()
})
</script>
