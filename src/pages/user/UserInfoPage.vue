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
              <a-descriptions-item label="我的id">
                {{ userInfo.id }}
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
            <a-button block class="action-btn" @click="openEditEmailModal">
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
            <a-button block type="primary" ghost class="action-btn" @click="showExchangeModal = true">
              <template #icon>
                <MoneyCollectOutlined />
              </template>
              兑换会员
            </a-button>
          </div>
        </a-card>
        <a-modal
          v-model:visible="showExchangeModal"
          title="兑换会员"
          ok-text="确认兑换"
          @ok="handleExchange"
          cancel-text="取消"
          @cancel="handleCancel"
          :confirm-loading="memberLoading"
        >
          <a-form :model="formState" :rules="rules" layout="vertical">
            <a-form-item label="会员兑换码" name="code">
              <a-input
                v-model:value="formState.code"
                placeholder="请输入16位会员兑换码"
                maxlength="16"
                show-count
              />
            </a-form-item>
          </a-form>
          <div class="text-gray-600 text-sm">
            如需要会员，请联系管理员进行购买：
            <a-tooltip placement="bottom">
              <template #title>
                <img :src="wechat" alt="微信" width="120" />
              </template>
              <a class="text-blue-500">向日葵</a>
            </a-tooltip>
          </div>
        </a-modal>
      </a-col>
    </a-row>

    <!-- 编辑资料模态框组件 -->
    <EditUserInfoModal ref="editUserInfo" :user-info="userInfo" :onSuccess="handleAvatarSuccess" />

    <!-- 修改密码模态框组件 -->
    <EditPasswordModal ref="editPassword" :user-info="userInfo" />

    <!-- 修改邮箱模态框组件 -->
    <EditEmailModal ref="editEmail" :user-info="userInfo" :onSuccess="handleEmailSuccess" />
  </div>
</template>

<script setup lang="ts">
import {
  EditOutlined,
  LockOutlined,
  MoneyCollectOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { exchangeMember, getUserVoById } from '@/api/userController.ts'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import EditPasswordModal from '@/components/userinfo/EditPasswordModal.vue'
import EditUserInfoModal from '@/components/userinfo/EditUserInfoModal.vue'
import EditEmailModal from '@/components/userinfo/EditEmailModal.vue'
import type { Rule } from 'ant-design-vue/es/form'
import wechat from '@/assets/wechat.png'

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
  const res = await getUserVoById({ id: loginUserStore.loginUser.id })
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
// ----- 修改用户邮箱模态框
const editEmail = ref()
const openEditEmailModal = () => {
  if (editEmail.value) {
    editEmail.value.openModal()
  }
}
const handleEmailSuccess = (newUserInfo: API.UserVO) => {
  userInfo.value = newUserInfo
}

const showAboutModal = () => {
  Modal.info({
    title: '关于作者',
    content: '寿司云图库开发团队',
    maskClosable: true,
  })
}

// ----- 兑换会员 -----
interface FormState {
  code: string;
}

// 表单状态
const formState = reactive<FormState>({
  code: '',
});

// 验证规则
const rules: Record<string, Rule[]> = {
  code: [
    { required: true, message: '请输入兑换码' },
    { len: 16, message: '兑换码必须是16位字符' },
    { pattern: /^[A-Z0-9]+$/, message: '兑换码只能包含大写字母和数字' }
  ],
};

// 控制模态框显示
const showExchangeModal = ref(false);
// 加载状态
const memberLoading = ref(false);

// 兑换处理
const handleExchange = async () => {
  try {
    memberLoading.value = true;
    // 调用后端接口
    const res = await exchangeMember({
      userId: loginUserStore.loginUser.id,
      code: formState.code
    });

    if (res.data.code === 0) {
      message.success('兑换成功！');
      showExchangeModal.value = false;
      fetchUserInfo()
    } else {
      message.error(`兑换失败：${res.data.message}`);
    }
  } catch (error) {
    message.error('兑换请求失败，请稍后重试');
  } finally {
    memberLoading.value = false;
    handleCancel()
  }
};

// 取消处理
const handleCancel = () => {
  formState.code = '';
  showExchangeModal.value = false;
};
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
    min-height: 422px;
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
