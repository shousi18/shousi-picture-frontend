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
                <a-descriptions-item label="注册时间">
                  {{ formatTime(userInfo.createTime) }}
                </a-descriptions-item>
              </a-descriptions>
            </div>
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

  <div class="sign-in-calendar">
    <v-chart :option="options" autoresize class="calendar-chart" />
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
  exchangeMember,
  getUserSignInRecord,
  getUserVoById,
} from '@/api/userController.ts'
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
    const res = await exchangeMember({
      userId: loginUserStore.loginUser.id,
      code: formState.code,
    })

    if (res.data.code === 0) {
      message.success('兑换成功！')
      showExchangeModal.value = false
      fetchUserInfo()
    } else {
      message.error(`兑换失败：${res.data.message}`)
    }
  } catch (error) {
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
  const optionsData = dataList.value.map((dayOfYear, index) => {
    // 计算日期字符串 从第一天开始 加上 dayOfYear天 应该再减去一天
    const dateStr = dayjs(`${year}-01-01`)
      .add(dayOfYear - 1, 'day')
      .format('YYYY-MM-DD')
    return [dateStr, 1]
  })

  return {
    tooltip: {
      formatter: (params: any) => {
        return `${params.value[0]}<br/>${params.value[1] ? '🎈 冒了一个泡' : '没有留下足迹'}`
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
        // 颜色从灰色到浅绿色
        color: ['#efefef', 'lightgreen'],
      },
    },
    calendar: {
      range: year,
      left: 20,
      // 单元格自动宽度，高度为 16 像素
      cellSize: ['auto', 16],
      yearLabel: {
        position: 'top',
        formatter: `${year} 年签到记录`,
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
  } catch (error) {
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
  max-height: 450px;
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
    min-height: 460px;
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

/* 签到日历样式 */
.sign-in-calendar {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: calc(100% - 348px);
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  width: 100%;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
}

.calendar-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.calendar-chart {
  height: 200px;
  width: 100% !important;
  margin-top: 16px;
  flex: 1;
}
</style>
