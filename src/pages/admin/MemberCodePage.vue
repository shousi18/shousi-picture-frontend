<template>
  <div class="member-code-container">
    <a-card title="会员码管理" :bordered="false">
      <template #extra>
        <a-button type="primary" @click="handleGenerateCode" :loading="generateLoading">
          生成会员码
        </a-button>
      </template>

      <!-- 新生成的会员码展示区域 -->
      <div v-if="newCodes.length > 0" style="margin-bottom: 24px">
        <a-alert
          message="请保存好以下新生成的会员码，刷新页面后将无法查看相同的会员码"
          type="warning"
          show-icon
          style="margin-bottom: 16px"
        />
        <a-list :bordered="true" :data-source="newCodes">
          <template #renderItem="{ item }">
            <a-list-item>
              <a-tag color="blue">{{ item }}</a-tag>
              <template #actions>
                <a @click="copyCode(item)">复制</a>
              </template>
            </a-list-item>
          </template>
        </a-list>
      </div>

      <!-- 会员码查询区域 -->
      <a-form layout="inline" :model="searchForm" style="margin-bottom: 16px">
        <a-form-item label="会员码">
          <a-input v-model:value="searchForm.vipCode" placeholder="请输入会员码" allow-clear />
        </a-form-item>
        <a-form-item label="使用状态">
          <a-select
            v-model:value="searchForm.userId"
            style="width: 120px"
            placeholder="请选择状态"
            allow-clear
          >
            <a-select-option :value='0'>未使用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch"> 查询 </a-button>
        </a-form-item>
      </a-form>

      <!-- 会员码列表 -->
      <a-table
        :columns="columns"
        :data-source="memberList"
        :pagination="pagination"
        :loading="tableLoading"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'userId'">
            <a-tag :color="record.userId === '0' ? 'green' : 'blue'">
              {{ record.userId === '0' ? '未使用' : '已兑换' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a @click="copyCode(record.vipCode)">复制</a>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { createVipCode, listVipCode } from '@/api/memberController'
import type { TablePaginationConfig } from 'ant-design-vue'

const columns = [
  {
    title: '会员码',
    dataIndex: 'vipCode',
    key: 'vipCode',
  },
  {
    title: '用户id',
    dataIndex: 'userId',
    key: 'userId',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
  },
  {
    title: '使用时间',
    dataIndex: 'useTime',
    key: 'useTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 新生成的会员码列表
const newCodes = ref<string[]>([])
const generateLoading = ref(false)

// 查询表单数据
const searchForm = reactive({
  vipCode: '',
  userId: 0,
  current: 1,
  pageSize: 10,
})

// 表格数据
const memberList = ref<API.Member[]>([])
const tableLoading = ref(false)
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`,
})

// 生成会员码
const handleGenerateCode = async () => {
  generateLoading.value = true
  try {
    const res = await createVipCode()
    if (res.data) {
      newCodes.value = res.data
      message.success('会员码生成成功')
      // 刷新列表
      fetchMemberList()
    }
  } catch (error: any) {
    message.error('生成失败：' + error.message)
  } finally {
    generateLoading.value = false
  }
}

// 复制会员码
const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    message.success('复制成功')
  } catch (error) {
    message.error('复制失败，请手动复制')
  }
}

// 查询会员码列表
const fetchMemberList = async () => {
  tableLoading.value = true
  try {
    const res = await listVipCode({
      vipCode: searchForm.vipCode,
      status: searchForm.status,
      current: pagination.current,
      pageSize: pagination.pageSize,
    })
    if (res.data.data) {
      memberList.value = res.data.data.records || []
      pagination.total = res.data.data.total || 0
    }
  } catch (error: any) {
    message.error('查询失败：' + error.message)
  } finally {
    tableLoading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchMemberList()
}

// 表格变化事件
const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current || 1
  pagination.pageSize = pag.pageSize || 10
  fetchMemberList()
}

// 页面加载时获取列表
onMounted(() => {
  fetchMemberList()
})
</script>

<style scoped>
.member-code-container {
  padding: 24px;
}
</style>
