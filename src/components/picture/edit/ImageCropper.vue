<template>
  <a-modal
    class="image-cropper"
    v-model:visible="visible"
    title="编辑图片"
    :footer="false"
    @cancel="closeModal"
  >
    <!-- 图片裁切组件 -->
    <vue-cropper
      ref="cropperRef"
      :img="imageUrl"
      output-type="png"
      :info="true"
      :can-move-box="true"
      :fixed-box="false"
      :auto-crop="true"
      :center-box="true"
    />
    <div style="margin-bottom: 16px" />
    <!-- 图片操作 -->
    <!-- 协同编辑操作 -->
    <div class="image-edit-actions" v-if="isTeamSpace">
      <a-space>
        <a-button v-if="editingUser" disabled> {{ editingUser.userName }}正在编辑</a-button>
        <a-button v-if="canEnterEdit" type="primary" ghost @click="enterEdit">进入编辑</a-button>
        <a-button v-if="canExitEdit" danger ghost @click="exitEdit">退出编辑</a-button>
      </a-space>
    </div>
    <div class="image-cropper-actions">
      <a-space>
        <a-button @click="rotateLeft" :disabled="!canEdit">向左旋转</a-button>
        <a-button @click="rotateRight" :disabled="!canEdit">向右旋转</a-button>
        <a-button @click="changeScale(1)" :disabled="!canEdit">放大</a-button>
        <a-button @click="changeScale(-1)" :disabled="!canEdit">缩小</a-button>
        <a-button type="primary" :loading="loading" @click="handleConfirm" :disabled="!canEdit">
          确认
        </a-button>
      </a-space>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, ref, watchEffect } from 'vue'
import { clearEditHistory, uploadPicture } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import PictureEditWebSocket from '@/utils/pictureEditWebSocket.ts'
import { PICTURE_EDIT_ACTION_ENUM, PICTURE_EDIT_MESSAGE_TYPE_ENUM } from '@/constant/picture.ts'
import { SPACE_TYPE_ENUM } from '@/constant/space.ts'

interface Props {
  imageUrl?: string
  picture?: API.PictureVO
  spaceId?: number
  space: API.SpaceVO
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()

// 是否为团队空间
const isTeamSpace = computed(() => {
  return props.space?.spaceType === SPACE_TYPE_ENUM.TEAM
})

// 获取图片裁切器的引用
const cropperRef = ref()

// 缩放比例
const changeScale = (num) => {
  cropperRef.value?.changeScale(num)
  if (num > 0) {
    editAction(PICTURE_EDIT_ACTION_ENUM.ZOOM_IN)
  } else {
    editAction(PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT)
  }
}

// 向左旋转
const rotateLeft = () => {
  cropperRef.value.rotateLeft()
  editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT)
}

// 向右旋转
const rotateRight = () => {
  cropperRef.value.rotateRight()
  editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT)
}

// 确认裁切
const handleConfirm = () => {
  cropperRef.value.getCropBlob((blob: Blob) => {
    // blob 为已经裁切好的文件
    const fileName = (props.picture?.name || 'image') + '.png'
    const file = new File([blob], fileName, { type: blob.type })
    // 上传图片
    handleUpload({ file })
  })
}

const loading = ref(false)

/**
 * 上传图片
 * @param file
 */
const handleUpload = async ({ file }: any) => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = props.picture ? { id: props.picture.id } : {}
    params.spaceId = props.spaceId
    const res = await uploadPicture(params, {}, file, {})
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
      closeModal()
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    message.error('图片上传失败，' + error.message)
  }
  loading.value = false
}

// 是否可见
const visible = ref(false)

// 打开弹窗
const openModal = () => {
  visible.value = true
}

// 关闭弹窗
const closeModal = () => {
  visible.value = false
  // 断开连接
  if (webSocket) {
    webSocket.disconnect()
    clearHistory()
  }
  editingUser.value = undefined
}

const clearHistory = async () => {
  const params = {
    pictureId: props.picture?.id,
    spaceId: props.spaceId
  }
  // 清除历史操作
  await clearEditHistory(params)
}

// 暴露函数给父组件
defineExpose({
  openModal
})

// ----- 实时编辑
const loginUserStore = useLoginUserStore()
const loginUser = loginUserStore.loginUser
// 正在编辑的用户
const editingUser = ref<API.UserVO>()
// 没有用户在编辑，可以进入编辑
const canEnterEdit = computed(() => {
  return !editingUser.value?.id
})
// 正在编辑的用户是本人，可以退出编辑
const canExitEdit = computed(() => {
  return editingUser.value?.id === loginUser?.id
})
// 可以进行编辑
const canEdit = computed(() => {
  if (!isTeamSpace.value) {
    return true
  }
  return editingUser.value?.id === loginUser?.id
})

/**
 * 进入编辑状态
 */
const enterEdit = () => {
  if (webSocket) {
    // 发送进入编辑状态的消息
    webSocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT
    })
  }
}
/**
 * 退出编辑状态
 */
const exitEdit = () => {
  if (webSocket) {
    // 发送退出编辑状态的消息
    webSocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT
    })
  }
}
/**
 * 编辑图片操作
 */
const editAction = (action: string) => {
  // 如果webSocket建立
  if (webSocket) {
    webSocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION,
      editAction: action
    })
  }
}

let webSocket: PictureEditWebSocket | null
/**
 * 初始化webSocket连接，绑定事件
 */
const initWebSocket = () => {
  const pictureId = props.picture?.id
  console.log('pictureId:', pictureId)
  // 没有打开编辑弹框，或者没有图片ID，则不初始化webSocket
  if (!pictureId || !visible.value) {
    return
  }
  // 私有空间不初始化webSocket
  if (props.space.spaceType === SPACE_TYPE_ENUM.PRIVATE) {
    return
  }
  // 防止之前建立的连接没有释放
  if (webSocket) {
    webSocket.disconnect()
  }
  // 创建WebSocket实例
  webSocket = new PictureEditWebSocket(pictureId)
  // 建立webSocket连接
  webSocket.connect()

  // --- 监听事件
  // 监听通知消息
  webSocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.INFO, (msg) => {
    console.log('收到通知消息：', msg)
    message.info(msg.message)
  })

  // 监听错误消息
  webSocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ERROR, (msg) => {
    console.log('收到错误消息：', msg)
    message.error(msg.message)
  })

  // 监听进入编辑状态消息
  webSocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT, (msg) => {
    console.log('收到进入编辑状态消息：', msg)
    message.info(msg.message)
    editingUser.value = msg.user
  })

  // 监听编辑操作消息
  webSocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION, (msg) => {
    console.log('收到编辑操作消息：', msg)
    message.info(msg.message)
    switch (msg.editAction) {
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT:
        cropperRef.value.rotateLeft()
        break
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT:
        cropperRef.value.rotateRight()
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_IN:
        cropperRef.value.changeScale(1)
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT:
        cropperRef.value.changeScale(-1)
        break
    }
  })

  // 监听退出编辑状态消息
  webSocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT, (msg) => {
    console.log('收到退出编辑状态消息：', msg)
    message.info(msg.message)
    editingUser.value = undefined
  })

  // 重放历史操作
  webSocket.on('HISTORY', (msg) => {
    msg.historyAction.forEach((action: string) => {
      replayEditAction(action)
    })
  })
}

// 示例：重放历史操作
const replayEditAction = (action: string) => {
  switch (action) {
    case PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT:
      cropperRef.value.rotateLeft()
      break
    case PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT:
      cropperRef.value.rotateRight()
      break
    case PICTURE_EDIT_ACTION_ENUM.ZOOM_IN:
      cropperRef.value.changeScale(1)
      break
    case PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT:
      cropperRef.value.changeScale(-1)
      break
  }
}

watchEffect(() => {
  // 为团队空间才初始化webSocket
  if (isTeamSpace.value) {
    initWebSocket()
  }
})

onUnmounted(() => {
  // 断开连接
  if (webSocket) {
    webSocket.disconnect()
  }
  editingUser.value = undefined
})
</script>

<style>
.image-cropper {
  text-align: center;
}

.image-cropper .vue-cropper {
  height: 400px !important;
}
</style>
