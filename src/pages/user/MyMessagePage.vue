<template>
  <div class="message-page">
    <a-page-header title="我的受邀消息" />

    <a-list :data-source="invitations" :loading="loading" item-layout="horizontal">
      <template #renderItem="{ item }">
        <a-list-item>
          <template #actions>
            <a-space>
              <a-button
                type="primary"
                @click="handleInvitation(item, SPACE_USER_STATUS_ENUM.AGREE)"
                :loading="handleLoading"
              >
                同意
              </a-button>
              <a-button
                danger
                @click="handleInvitation(item, SPACE_USER_STATUS_ENUM.REJECT)"
                :loading="handleLoading"
              >
                拒绝
              </a-button>
            </a-space>
          </template>

          <a-list-item-meta>
            <template #title>
              <span style="font-size: 16px">
                {{ item.user.userName }} 邀请您加入空间
                <a-typography-text strong>{{ item.space.spaceName }}</a-typography-text>
              </span>
            </template>
            <template #description>
              <span style="color: rgba(0, 0, 0, 0.45)">
                邀请时间：{{ formatTime(item.createTime) }}
              </span>
            </template>
          </a-list-item-meta>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  getPendingInvitationsUsingGet,
  handleInvitationUsingPost,
} from '@/api/spaceUserController.ts'
import { SPACE_TYPE_ENUM, SPACE_USER_STATUS_ENUM } from '@/constant/space.ts'

const loading = ref(false)
const invitations = ref<API.SpaceUserVO[]>([])

const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

const loadData = async () => {
  try {
    loading.value = true
    const res = await getPendingInvitationsUsingGet()
    if (res.data.data && res.data.code === 0) {
      invitations.value = res.data.data
    }
  } catch (e) {
    message.error('加载邀请消息失败')
  } finally {
    loading.value = false
  }
}

const handleLoading = ref<boolean>(false)
const handleInvitation = async (item: API.SpaceUserVO, status: number) => {
  try {
    handleLoading.value = true
    const res = await handleInvitationUsingPost({
      id: item.id,
      status: status,
    })
    if (res.data.code === 0 && res.data.data) {
      message.success(status === 1 ? '同意邀请成功' : '拒绝邀请成功')
      // 刷新数据
      loadData()
    } else {
      message.error(status === 1 ? '同意邀请失败' : '拒绝邀请失败' + res.data.message)
    }
  } catch (e) {
    message.error(status === 1 ? '同意邀请失败' : '拒绝邀请失败')
  } finally {
    handleLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.message-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

:deep(.ant-list-item) {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
}
</style>
