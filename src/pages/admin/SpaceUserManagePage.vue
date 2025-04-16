<template>
  <div id="userManagePage">
    <h2>空间成员管理</h2>
    <a-flex gap="large">
      <a-form layout="inline" :model="formData" @finish="handleSubmit">
        <a-form-item label="用户 id" name="userId">
          <a-input v-model:value="formData.userId" placeholder="请输入用户 id" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">邀请用户</a-button>
        </a-form-item>
      </a-form>
      <a-form layout="inline" :model="selectFormData" @finish="handleSelectSubmit">
        <a-form-item name="inviteStatus" label="用户受邀状态">
          <a-select
            allow-clear
            v-model:value="selectFormData.inviteStatus"
            :options="SPACE_USER_STATUS_OPTIONS"
            placeholder="请查看邀请的用户状态"
            style="min-width: 210px"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">搜索</a-button>
        </a-form-item>
      </a-form>
    </a-flex>
    <div style="margin-bottom: 16px" />
    <!-- 表格 -->
    <a-table :columns="columns" :data-source="dataList">
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userInfo'">
          <a-space>
            <a-avatar :src="record.user?.userAvatar" />
            {{ record.user?.userName }}
          </a-space>
        </template>
        <template v-if="column.dataIndex === 'spaceRole'">
          <a-select
            v-model:value="record.spaceRole"
            :options="SPACE_ROLE_OPTIONS"
            @change="(value) => editSpaceRole(value, record)"
          />
        </template>
        <template v-if="column.dataIndex === 'inviteStatus'">
          {{ SPACE_USER_STATUS_MAP[record.inviteStatus] }}
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space wrap>
            <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  SPACE_ROLE_OPTIONS,
  SPACE_USER_STATUS_ENUM,
  SPACE_USER_STATUS_MAP,
  SPACE_USER_STATUS_OPTIONS,
} from '@/constant/space.ts'
import {
  addSpaceUser,
  deleteSpaceUser,
  editSpaceUser,
  listSpaceUser,
} from '@/api/spaceUserController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'

// 表格列
const columns = [
  {
    title: '用户',
    dataIndex: 'userInfo',
  },
  {
    title: '角色',
    dataIndex: 'spaceRole',
  },
  {
    title: '邀请状态',
    dataIndex: 'inviteStatus',
  },
  {
    title: '邀请时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

interface Props {
  id: string
}

const props = defineProps<Props>()
// 数据
const dataList = ref([])

// 邀请用户
const formData = reactive<API.SpaceUserAddRequest>({})
const loginUserStore = useLoginUserStore()
const selectFormData = reactive<API.SpaceUserQueryRequest>({})
/**
 * 提交表单
 */
const handleSubmit = async () => {
  const spaceId = props.id
  if (!spaceId) {
    return
  }
  const res = await addSpaceUser({
    spaceId,
    createUserId: loginUserStore.loginUser.id,
    ...formData,
  })
  if (res.data.code === 0) {
    message.success('邀请成功')
    // 刷新数据
    fetchData()
  } else {
    message.error('邀请失败，' + res.data.message)
  }
}

// 获取数据
const fetchData = async () => {
  const spaceId = props.id
  if (!spaceId) {
    return
  }
  const res = await listSpaceUser({
    spaceId,
    inviteStatus: SPACE_USER_STATUS_ENUM.AGREE,
  })
  if (res.data.data) {
    dataList.value = res.data.data ?? []
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

const handleSelectSubmit = async () => {
  const spaceId = props.id
  if (!spaceId) {
    return
  }
  const params = {
    spaceId,
    inviteStatus: selectFormData.inviteStatus,
  }
  console.log(params)
  const res = await listSpaceUser(params)
  if (res.data.data) {
    dataList.value = res.data.data ?? []
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

/**
 * 选择成员角色
 */
const editSpaceRole = async (value, record) => {
  const res = await editSpaceUser({
    id: record.id,
    spaceRole: value,
  })
  if (res.data.code === 0) {
    message.success('修改成功')
  } else {
    message.error('修改失败，' + res.data.message)
  }
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})

const doDelete = async (id: number) => {
  if (id == null) {
    message.error('id 为空')
    return
  }
  const deleteResponse = await deleteSpaceUser({ id })
  if (deleteResponse.data.data && deleteResponse.data.code === 0) {
    message.success('删除成功')
    fetchData()
  } else {
    message.error('删除失败')
  }
}
</script>

<style scoped>
.picture-upload :deep(.ant-upload) {
  width: 100% !important;
  height: 100% !important;
  min-height: 152px;
  min-width: 152px;
}

.picture-upload img {
  max-width: 100%;
  max-height: 480px;
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
