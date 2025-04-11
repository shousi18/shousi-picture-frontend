<template>
  <div class="user-info-page">
    <a-row :gutter="24">
      <!-- 左侧信息展示 -->
      <a-col :xl="16" :lg="14" :md="24" :sm="24" :xs="24">
        <a-card title="个人信息" :bordered="false" class="info-card">
          <a-spin :spinning="loading">
            <a-descriptions :column="1">
              <a-descriptions-item label="用户头像">
                <a-avatar :size="64" :src="userInfo.userAvatar" />
              </a-descriptions-item>
              <a-descriptions-item label="用户名">
                <span class="info-value">{{ userInfo.userName }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="邮箱">
                <span class="info-value">{{ userInfo.email }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="个人简介">
                <span class="info-value">{{ userInfo.userProfile || '暂无简介' }}</span>
              </a-descriptions-item>
              <a-descriptions-item label="用户角色">
                <a-tag color="blue">{{ userInfo.userRole }}</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="用户账号">
                {{ userInfo.userAccount }}
              </a-descriptions-item>
              <a-descriptions-item label="注册时间">
                {{ formatTime(userInfo.createTime) }}
              </a-descriptions-item>
            </a-descriptions>
          </a-spin>
        </a-card>
      </a-col>

      <!-- 右侧操作栏 -->
      <a-col :xl="8" :lg="10" :md="24" :sm="24" :xs="24">
        <a-card title="账户管理" :bordered="false" class="action-card">
          <div class="action-buttons">
            <a-button block class="action-btn" @click="openEditModal">
              <template #icon>
                <EditOutlined />
              </template>
              编辑资料
            </a-button>
            <a-button block class="action-btn" @click="openEditPasswordModal">
              <template #icon>
                <LockOutlined />
              </template>
              修改密码
            </a-button>
            <a-button block class="action-btn">
              <template #icon>
                <MailOutlined />
              </template>
              修改邮箱
            </a-button>
            <a-button block class="action-btn" @click="showAboutModal">
              <template #icon>
                <UserOutlined />
              </template>
              关于作者
            </a-button>
            <a-button block danger class="action-btn" @click="handleLogout">
              <template #icon>
                <LogoutOutlined />
              </template>
              注销账号
            </a-button>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 编辑资料模态框组件 -->
    <EditUserInfoModal
      ref="editUserInfo"
      :user-info="userInfo"
      :onSuccess="handleAvatarSuccess"
    />

    <!-- 修改密码模态框组件 -->
    <EditPasswordModal ref="editPassword" :user-info="userInfo" />
  </div>
</template>

<script setup lang="ts">
import {
  EditOutlined,
  LockOutlined,
  LogoutOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { getUserVoByIdUsingGet, updateUserUsingPost } from '@/api/userController.ts'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import EditPasswordModal from '@/components/user/EditPasswordModal.vue'
import EditUserInfoModal from '@/components/user/EditUserInfoModal.vue'

// 原有逻辑保持不变，新增以下内容
const loading = ref(false)
const loginUserStore = useLoginUserStore()
const router = useRouter()
const userInfo = ref<API.UserVO>({})

const fetchUserInfo = async () => {
  if (!loginUserStore.loginUser.id) {
    router.push({
      path: '/user/login',
    })
    message.warn('请先登录')
    return
  }
  const res = await getUserVoByIdUsingGet({ id: loginUserStore.loginUser.id })
  if (res.data.code === 0 && res.data.data) {
    userInfo.value = res.data.data
    loginUserStore.loginUser = res.data.data
  } else {
    message.error('未获取到您的信息' + res.data.message)
  }
}

onMounted(() => {
  fetchUserInfo()
})

const formatTime = (time?: string) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '未知时间'
}

// ----- 修改用户信息模态框
const editUserInfo = ref()
const openEditModal = () => {
  if (editUserInfo.value) {
    editUserInfo.value.openModal()
  }
}
const handleAvatarSuccess = (newUserInfo: API.UserVO) => {
  userInfo.value = newUserInfo
}
// ----- 修改用户密码模态框
const editPassword = ref()
const openEditPasswordModal = () => {
  if (editPassword.value) {
    editPassword.value.openModal()
  }
}

const showAboutModal = () => {
  Modal.info({
    title: '关于作者',
    content: '寿司云图库开发团队',
    maskClosable: true,
  })
}

const handleLogout = () => {
  Modal.confirm({
    title: '确定要注销账号吗？',
    content: '此操作将永久删除您的账户！',
    okText: '确定',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      // 执行注销逻辑
    },
  })
}
</script>

<style scoped>
.user-info-page {
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 24px;

  .info-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;

    :deep(.ant-descriptions-item-label) {
      color: #666;
      width: 100px;
    }

    .info-value {
      font-size: 15px;
      color: #333;
    }
  }

  .action-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .action-buttons {
      display: grid;
      gap: 12px;

      .action-btn {
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        border-radius: 6px;
        transition: all 0.2s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
}
</style>
