<template>
  <div id="addSpacePage">
    <h2 style="margin-bottom: 16px">
      {{ oldSpace?.id ? '编辑私有空间' : '创建私有空间' }}
    </h2>
    <a-form layout="vertical" :model="formData" @finish="handleSubmit">
      <a-form-item label="空间名称" name="spaceName">
        <a-input v-model:value="formData.spaceName" placeholder="请输入空间名称" allow-clear />
      </a-form-item>
      <a-form-item label="空间级别" name="spaceLevel">
        <a-select
          v-model:value="formData.spaceLevel"
          :options="SPACE_LEVEL_OPTIONS"
          placeholder="请输入空间级别"
          style="min-width: 180px"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading">
          创建
        </a-button>
      </a-form-item>
    </a-form>
    <a-card title="空间级别介绍" class="space-level-card">
      <div class="card-header">
        <icon-exclamation-circle-filled class="notice-icon" />
        <h3>空间级别说明</h3>
      </div>

      <!-- 提示段落 -->
      <a-alert type="info" show-icon class="notice-alert">
        <template #message>
          当前仅支持开通普通版，升级空间请直接联系
          <a href="https://blog.csdn.net/weixin_74879735?type=blog" target="_blank" class="contact-link">
            向阳256 <icon-link-outlined />
          </a>
        </template>
      </a-alert>

      <!-- 空间级别列表 -->
      <div class="space-level-list">
        <div
          v-for="spaceLevel in spaceLevelList"
          :key="spaceLevel.text"
          class="level-item"
          :class="`level-${spaceLevel.text}`"
        >
          <div class="level-icon">
            <template v-if="spaceLevel.text === '专业版'">🔥</template>
            <template v-else-if="spaceLevel.text === '旗舰版'">💎</template>
            <template v-else>✅</template>
          </div>
          <div class="level-content">
            <h4 class="level-title">
              {{ spaceLevel.text }}
              <a-tag v-if="spaceLevel.text === 'pro'" color="orange">推荐</a-tag>
            </h4>
            <div class="level-stats">
              <div class="stat-item">
                <icon-file size="16" />
                <span>容量 {{ formatFileSize(spaceLevel.maxSize) }}</span>
              </div>
              <div class="stat-item">
                <icon-file-image size="16" />
                <span>数量 {{ spaceLevel.maxCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { SPACE_LEVEL_ENUM, SPACE_LEVEL_OPTIONS } from '@/constant/space.ts'
import {
  addSpaceUsingPost,
  getSpaceVoByIdUsingGet,
  listSpaceLevelUsingGet,
  updateSpaceUsingPost
} from '@/api/spaceController.ts'
import { formatFileSize } from '../../utils'

const formData = reactive<API.SpaceAddRequest | API.SpaceUpdateRequest>({
  spaceName: '',
  spaceLevel: SPACE_LEVEL_ENUM.COMMON,
})
const loading = ref(false)

const router = useRouter()
const route = useRoute()

const spaceLevelList = ref<API.SpaceLevel[]>([])
const oldSpace = ref<API.SpaceVO>()

/**
 * 获取老数据
 */
const getOldSpace = async () => {
  // 获取数据
  const id = route.query?.id
  if (id) {
    const res = await getSpaceVoByIdUsingGet({
      id: id,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      oldSpace.value = data
      formData.spaceName = data.spaceName
      formData.spaceLevel = data.spaceLevel
    }
  }
}

/**
 * 提交表单
 * @param values 表单内容
 */
const handleSubmit = async (values: any) => {
  loading.value = true
  const spaceId = oldSpace.value?.id
  let res;
  // 更新操作
  if (spaceId) {
    res = await updateSpaceUsingPost({
      id: spaceId,
      ...formData,
    })
  }else {
    res = await addSpaceUsingPost({
      ...formData,
    })
  }
  if (res.data.code === 0 && res.data.data) {
    message.success('操作成功')
    router.push({
      path: `/space/${spaceId ?? res.data.data}`,
    })
  } else {
    message.error('操作失败，' + res.data.message)
  }
  loading.value = false
}

/**
 * 获取空间级别
 */
const fetchSpaceLevelList = async () => {
  const res = await listSpaceLevelUsingGet()
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data
  } else {
    message.error('加载空间级别失败，' + res.data.message)
  }
}

onMounted(() => {
  getOldSpace()
  fetchSpaceLevelList()
})
</script>

<style scoped>
#addSpacePage {
  width: 720px;
  margin: 0 auto;
}

.space-level-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-top: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.notice-icon {
  color: #1890ff;
  font-size: 20px;
}

.notice-alert {
  margin-bottom: 24px;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #1890ff;
}

.space-level-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.level-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.2s;
  border-left: 4px solid transparent;
}

.level-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.level-pro {
  border-left-color: #ff7a45;
  background: linear-gradient(90deg, #fff7e6 0%, #ffffff 100%);
}

.level-premium {
  border-left-color: #13c2c2;
  background: linear-gradient(90deg, #e6fffb 0%, #ffffff 100%);
}

.level-icon {
  font-size: 24px;
  width: 40px;
  text-align: center;
}

.level-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1d2129;
}

.level-stats {
  display: flex;
  gap: 20px;
  margin-top: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4e5969;
}
</style>
