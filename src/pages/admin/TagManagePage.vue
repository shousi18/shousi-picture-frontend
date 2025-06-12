<template>
  <div class="tag-manage-page">
    <a-card title="标签管理" :bordered="false">
      <!-- 操作按钮区域 -->
      <div class="operation-area">
        <a-button type="primary" @click="showAddModal">
          <template #icon><plus-outlined /></template>
          新增标签
        </a-button>
      </div>

      <!-- 标签列表 -->
      <a-table
        :columns="columns"
        :data-source="tagList"
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

    <!-- 新增标签弹窗 -->
    <a-modal
      v-model:visible="addModalVisible"
      title="新增标签"
      @ok="handleAdd"
      @cancel="handleCancel"
    >
      <a-form :model="formState" :rules="rules" ref="formRef">
        <a-form-item label="标签名称" name="tagName">
          <a-input
            v-model:value="formState.tagName"
            placeholder="请输入标签名称"
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
import { addTag, listTags } from '@/api/tagController'
import type { TagVO } from '@/api/typings'

// 表格列定义
const columns = [
  {
    title: '标签ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: '标签名称',
    dataIndex: 'tagName',
    key: 'tagName',
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
const tagList = ref<TagVO[]>([])
const addModalVisible = ref(false)
const formRef = ref()

// 表单状态
const formState = ref({
  tagName: '',
})

// 表单验证规则
const rules = {
  tagName: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
  ],
}

// 获取标签列表
const fetchTagList = async () => {
  loading.value = true
  try {
    const res = await listTags()
    if (res.code === 0) {
      tagList.value = res.data || []
    } else {
      message.error('获取标签列表失败')
    }
  } catch (error) {
    message.error('获取标签列表失败')
  } finally {
    loading.value = false
  }
}

// 显示新增弹窗
const showAddModal = () => {
  addModalVisible.value = true
  formState.value.tagName = ''
}

// 处理新增
const handleAdd = async () => {
  try {
    await formRef.value.validate()
    const res = await addTag({
      tagName: formState.value.tagName,
    })
    if (res.code === 0) {
      message.success('添加成功')
      addModalVisible.value = false
      fetchTagList()
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
const handleDelete = (record: TagVO) => {
  // TODO: 实现删除功能
  message.info('删除功能待实现')
}

// 页面加载时获取数据
onMounted(() => {
  fetchTagList()
})
</script>

<style scoped>
.tag-manage-page {
  padding: 24px;
}

.operation-area {
  margin-bottom: 16px;
}
</style> 