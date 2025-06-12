<template>
  <div class="exchange-member-container">
    <a-card title="积分兑换会员" :bordered="false">
      <div class="exchange-info">
        <a-descriptions :column="1">
          <a-descriptions-item label="当前积分">
            <span class="points">{{ userInfo.balance || 0 }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="兑换说明">
            <a-alert
              message="使用300积分可兑换3天会员时长"
              type="info"
              show-icon
              style="margin-bottom: 16px"
            />
          </a-descriptions-item>
        </a-descriptions>

        <div class="exchange-action">
          <a-button
            type="primary"
            size="large"
            :disabled="(userInfo.balance || 0) < 300"
            @click="handleExchange"
            :loading="exchangeLoading"
          >
            立即兑换
          </a-button>
          <div class="exchange-tip" v-if="(userInfo.balance || 0) < 300">
            <a-alert message="积分不足，无法兑换" type="warning" show-icon />
          </div>
        </div>
      </div>
    </a-card>

    <!-- 兑换成功弹窗 -->
    <a-modal
      v-model:visible="showCodeModal"
      title="兑换成功"
      :footer="null"
      @cancel="handleModalClose"
    >
      <div class="code-content">
        <p>您的会员兑换码为：</p>
        <div class="code-box">
          <span class="code-text">{{ memberCode }}</span>
          <a-button type="link" @click="copyCode">
            <template #icon>
              <CopyOutlined />
            </template>
            复制
          </a-button>
        </div>
        <a-alert
          message="请妥善保管您的兑换码，可在个人中心进行使用"
          type="warning"
          show-icon
          style="margin-top: 16px"
        />
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { CopyOutlined } from '@ant-design/icons-vue'
import { getMemberCode } from '@/api/userController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { getUserVoById } from '@/api/userController'

const userInfo = ref<API.UserVO>({})
const exchangeLoading = ref(false)
const showCodeModal = ref(false)
const memberCode = ref('')
const loginUserStore = useLoginUserStore()

// 获取用户信息
const fetchUserInfo = async () => {
  if (!loginUserStore.loginUser.id) {
    message.error('请先登录')
    return
  }
  const res = await getUserVoById({ id: loginUserStore.loginUser.id })
  if (res.data.code === 0 && res.data.data) {
    userInfo.value = res.data.data
  } else {
    message.error('获取用户信息失败')
  }
}

// 兑换会员
const handleExchange = async () => {
  if ((userInfo.value.balance || 0) < 300) {
    message.error('积分不足')
    return
  }

  exchangeLoading.value = true
  try {
    const res = await getMemberCode()
    if (res.data.code === 0 && res.data.data) {
      memberCode.value = res.data.data
      showCodeModal.value = true
      // 重新获取用户信息（更新积分）
      fetchUserInfo()
    } else {
      message.error('兑换失败：' + res.data.message)
    }
  } catch (error) {
    message.error('兑换失败，请稍后重试')
  } finally {
    exchangeLoading.value = false
  }
}

// 复制兑换码
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(memberCode.value)
    message.success('复制成功')
  } catch (error) {
    message.error('复制失败，请手动复制')
  }
}

// 关闭弹窗
const handleModalClose = () => {
  showCodeModal.value = false
  memberCode.value = ''
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.exchange-member-container {
  padding: 24px;
}

.exchange-info {
  max-width: 600px;
  margin: 0 auto;
}

.points {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
}

.exchange-action {
  text-align: center;
  margin-top: 32px;
}

.exchange-tip {
  margin-top: 16px;
}

.code-content {
  text-align: center;
}

.code-box {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
}

.code-text {
  font-size: 18px;
  font-family: monospace;
  margin-right: 8px;
  color: #1890ff;
}
</style>
