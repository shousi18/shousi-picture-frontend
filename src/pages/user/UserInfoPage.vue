<template>
  <div class="user-info-page">
    <a-row :gutter="24">
      <!-- 左侧信息展示 -->
      <a-col :xl="16" :lg="14" :md="24" :sm="24" :xs="24">
        <a-card title="个人信息" :bordered="false" class="info-card">
          <template #extra>
            <a-button
              type="primary"
              shape="round"
              @click="handleSignIn"
              :disabled="isSignIn"
              class="sign-btn"
            >
              <template #icon>
                <CheckCircleOutlined />
              </template>
              {{ isSignIn ? '今日已签到' : '每日签到' }}
            </a-button>
          </template>
          <!-- ...原有内容保持不变... -->
          <a-spin :spinning="loading">
            <!-- 个人信息内容 -->
            <div class="info-content">
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
                <a-descriptions-item label="当前余额">
                  <span style="color: #1890ff; font-weight: bold;">{{ userInfo.balance || 0 }}</span> 积分
                </a-descriptions-item>
                <a-descriptions-item label="注册时间">
                  {{ formatTime(userInfo.createTime) }}
                </a-descriptions-item>
              </a-descriptions>
            </div>
          </a-spin>
        </a-card>

        <!-- 签到日历 -->
        <a-card title="签到记录" :bordered="false" class="calendar-card">
          <div class="calendar-header">
            <div class="calendar-stats">
              <div class="stats-item">
                <div class="stats-value">{{ dataList.length }}</div>
                <div class="stats-label">累计签到</div>
              </div>
              <div class="stats-item">
                <div class="stats-value">{{ isSignIn ? '已签到' : '未签到' }}</div>
                <div class="stats-label">今日状态</div>
              </div>
            </div>
          </div>
          <v-chart :option="options" autoresize class="calendar-chart" />
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
            <a-button
              block
              type="primary"
              ghost
              class="action-btn"
              @click="showExchangeModal = true"
            >
              <template #icon>
                <MoneyCollectOutlined />
              </template>
              兑换会员
            </a-button>
          </div>
        </a-card>

        <a-modal
          v-model:visible="showExchangeModal"
          title="使用会员兑换码"
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
            <p>您可以通过以下方式获取会员兑换码：</p>
            <ol class="ml-4">
              <li>1. 使用300积分兑换3天会员</li>
              <li>2. 联系管理员购买会员兑换码</li>
            </ol>
            <router-link to="/member/exchange" class="text-blue-500"> 前往积分兑换 </router-link>
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
  CheckCircleOutlined,
  EditOutlined,
  LockOutlined,
  MailOutlined,
  MoneyCollectOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import 'echarts'
import VChart from 'vue-echarts'
import 'echarts-wordcloud'
import dayjs from 'dayjs'
import {
  addUserSignIn,
  consumerMemberCode,
  exchangeMember,
  getUserSignInRecord,
  getUserVoById,
} from '@/api/userController'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import EditPasswordModal from '@/components/userinfo/EditPasswordModal.vue'
import EditUserInfoModal from '@/components/userinfo/EditUserInfoModal.vue'
import EditEmailModal from '@/components/userinfo/EditEmailModal.vue'
import type { Rule } from 'ant-design-vue/es/form'

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
  code: string
}

// 表单状态
const formState = reactive<FormState>({
  code: '',
})

// 验证规则
const rules: Record<string, Rule[]> = {
  code: [
    { required: true, message: '请输入兑换码' },
    { len: 16, message: '兑换码必须是16位字符' },
    { pattern: /^[A-Z0-9]+$/, message: '兑换码只能包含大写字母和数字' },
  ],
}

// 控制模态框显示
const showExchangeModal = ref(false)
// 加载状态
const memberLoading = ref(false)

// 兑换处理
const handleExchange = async () => {
  try {
    memberLoading.value = true
    // 调用后端接口
    const res = await consumerMemberCode({
      code: formState.code,
    })

    if (res.data.code === 0) {
      message.success('兑换成功！')
      showExchangeModal.value = false
      fetchUserInfo()
    } else {
      message.error(`兑换失败：${res.data.message}`)
    }
  } catch {
    message.error('兑换请求失败，请稍后重试')
  } finally {
    memberLoading.value = false
    handleCancel()
  }
}

// 取消处理
const handleCancel = () => {
  formState.code = ''
  showExchangeModal.value = false
}

// ----- 用户签到 -----
// 获取当天是今年的第几天
const getDayOfYear = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// 签到日期列表（[1, 200]，表示第 1 和第 200 天有签到记录）
const dataList = ref<number[]>([])

// 计算图表需要的数据
const year = new Date().getFullYear()

// 图表配置
const options = computed(() => {
  const optionsData = dataList.value.map((dayOfYear) => {
    const dateStr = dayjs(`${year}-01-01`)
      .add(dayOfYear - 1, 'day')
      .format('YYYY-MM-DD')
    return [dateStr, 1]
  })

  return {
    tooltip: {
      formatter: (params: Record<string, any>) => {
        return `${params.value[0]}<br/>${params.value[1] ? '🎈 已签到' : '未签到'}`
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      textStyle: {
        color: '#64748b',
        fontSize: 12,
      },
      padding: [8, 12],
      borderRadius: 8,
    },
    visualMap: {
      show: false,
      min: 0,
      max: 1,
      inRange: {
        color: ['#f0f0f0', '#1890ff'],
      },
    },
    calendar: {
      range: year,
      left: 30,
      right: 30,
      top: 20,
      bottom: 20,
      cellSize: ['auto', 20],
      itemStyle: {
        borderWidth: 2,
        borderColor: '#fff',
      },
      yearLabel: {
        show: false,
      },
      dayLabel: {
        color: '#666',
      },
      monthLabel: {
        color: '#666',
      },
    },
    series: {
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: optionsData,
    },
  }
})

const fetchData = async () => {
  try {
    const res = await getUserSignInRecord({
      year,
    })
    const day = getDayOfYear()
    dataList.value = res.data.data || []
    isSignIn.value = dataList.value.includes(day)
  } catch {
    message.error('获取签到记录失败')
  }
}

const isSignIn = ref<boolean>(false)
const handleSignIn = async () => {
  const res = await addUserSignIn()
  if (res.data.code === 0 && res.data.data) {
    message.success('签到成功')
    fetchData()
  } else {
    message.error(res.data.message)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.user-info-page {
  margin: 24px auto;
  padding: 0 24px;
}

.info-card,
.calendar-card,
.action-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  background: white;
  transition: all 0.3s ease;
}

.info-card:hover,
.calendar-card:hover,
.action-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.info-card :deep(.ant-descriptions-item-label) {
  color: #666;
  width: 100px;
}

.info-card .info-value {
  font-size: 15px;
  color: #333;
}

.calendar-card {
  margin-top: 24px;
}

.calendar-header {
  margin-bottom: 24px;
}

.calendar-stats {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
}

.stats-item {
  text-align: center;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 4px;
}

.stats-label {
  font-size: 14px;
  color: #666;
}

.calendar-chart {
  height: 280px;
  width: 100% !important;
}

.sign-btn {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
  transition: all 0.3s ease;
}

.sign-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.sign-btn:disabled {
  background: #d9d9d9;
  box-shadow: none;
  transform: none;
}

.action-card {
  min-height: 460px;
}

.action-buttons {
  display: grid;
  gap: 12px;
}

.action-btn {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  border-radius: 6px;
  transition: all 0.2s;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
