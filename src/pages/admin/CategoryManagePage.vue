<template>
  <div class="category-manage-page">
    <a-card title="分类管理" :bordered="false">
      <!-- 操作按钮区域 -->
      <div class="operation-area">
        <a-button type="primary" @click="showAddModal">
          <template #icon><plus-outlined /></template>
          新增分类
        </a-button>
      </div>

      <!-- 分类列表 -->
      <a-table
        :columns="columns"
        :data-source="categoryList"
        :loading="loading"
        :pagination="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="handleDelete(record)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新增分类弹窗 -->
    <a-modal
      v-model:visible="addModalVisible"
      title="新增分类"
      @ok="handleAdd"
      @cancel="handleCancel"
    >
      <a-form :model="formState" :rules="rules" ref="formRef">
        <a-form-item label="分类名称" name="categoryName">
          <a-input
            v-model:value="formState.categoryName"
            placeholder="请输入分类名称"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { addCategory, listCategories } from '@/api/categoryController'
import type { CategoryVO } from '@/api/typings'

// 表格列定义
const columns = [
  {
    title: '分类ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: '分类名称',
    dataIndex: 'categoryName',
    key: 'categoryName',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 数据状态
const loading = ref(false)
const categoryList = ref<CategoryVO[]>([])
const addModalVisible = ref(false)
const formRef = ref()

// 表单状态
const formState = ref({
  categoryName: '',
})

// 表单验证规则
const rules = {
  categoryName: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
  ],
}

// 获取分类列表
const fetchCategoryList = async () => {
  loading.value = true
  try {
    const res = await listCategories()
    if (res.code === 0) {
      categoryList.value = res.data || []
    } else {
      message.error('获取分类列表失败')
    }
  } catch (error) {
    message.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

// 显示新增弹窗
const showAddModal = () => {
  addModalVisible.value = true
  formState.value.categoryName = ''
}

// 处理新增
const handleAdd = async () => {
  try {
    await formRef.value.validate()
    const res = await addCategory({
      categoryName: formState.value.categoryName,
    })
    if (res.code === 0) {
      message.success('添加成功')
      addModalVisible.value = false
      fetchCategoryList()
    } else {
      message.error(res.message || '添加失败')
    }
  } catch (error) {
    console.error('添加失败:', error)
  }
}

// 处理取消
const handleCancel = () => {
  addModalVisible.value = false
  formRef.value?.resetFields()
}

// 处理删除
const handleDelete = (record: CategoryVO) => {
  // TODO: 实现删除功能
  message.info('删除功能待实现')
}

// 页面加载时获取数据
onMounted(() => {
  fetchCategoryList()
})
</script>

<style scoped>
.category-manage-page {
  padding: 24px;
}

.operation-area {
  margin-bottom: 16px;
}
</style> 