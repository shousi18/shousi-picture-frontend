<template>
  <div id="globalSider" @mouseenter="handMouseEnter" @mouseleave="handleMouseLeave">
    <a-layout-sider
      :collapsed="!expanded"
      collapsible
      class="custom-sider"
      :width="expanded ? 200 : 80"
      v-if="loginUserStore.loginUser.id"
      :trigger="null"
      breakpoint="lg"
    >
      <a-menu
        mode="inline"
        v-model:selectedKeys="current"
        :items="menuItems"
        @click="doMenuClick"
      />
    </a-layout-sider>
  </div>
</template>
<script lang="ts" setup>
import { computed, h, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import {
  PictureOutlined,
  TeamOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons-vue'
import { SPACE_TYPE_ENUM } from '@/constant/space.ts'
import { listMyTeamSpaceUsingPost } from '@/api/spaceUserController.ts'
import { message } from 'ant-design-vue'

const loginUserStore = useLoginUserStore()
// 选中当前菜单
const current = ref<string[]>(['/'])
const router = useRouter()

// 固定的菜单列表
const fixedMenuItems = [
  {
    key: '/',
    label: '公共图库',
    icon: () => h(PictureOutlined),
  },
  {
    key: '/my_space',
    label: '我的空间',
    icon: () => h(UserOutlined),
  },
  {
    key: '/add_space?type=' + SPACE_TYPE_ENUM.TEAM,
    label: '创建团队',
    icon: () => h(UsergroupAddOutlined),
  },
]
const teamSpaceList = ref<API.SpaceUserVO[]>([])
const menuItems = computed(() => {
  // 没有团队空间，只展示固定菜单
  if (teamSpaceList.value.length < 1) {
    return fixedMenuItems
  }
  // 展示团队空间分组
  const teamSpaceSubMenus = teamSpaceList.value.map((spaceUser) => {
    const space = spaceUser.space
    return {
      key: '/space/' + space?.id,
      label: space?.spaceName,
    }
  })
  const teamSpaceMenuGroup = {
    icon: () => h(TeamOutlined),
    label: '我的团队空间',
    key: 'teamSpace',
    children: teamSpaceSubMenus,
  }
  return [...fixedMenuItems, teamSpaceMenuGroup]
})

/**
 * 加载团队空间列表
 */
const fetchTeamSpaceList = async () => {
  const res = await listMyTeamSpaceUsingPost()
  if (res.data.code === 0 && res.data.data) {
    teamSpaceList.value = res.data.data
  } else {
    message.error('加载我的团队空间失败，' + res.data.message)
  }
}

const expanded = ref<boolean>(false)
/**
 * 鼠标移出
 */
const handleMouseLeave = () => {
  expanded.value = false
}
/**
 * 鼠标移入
 */
const handMouseEnter = () => {
  expanded.value = true
}

/**
 * 进行监听，登录才加载
 */
watchEffect(() => {
  if (loginUserStore.loginUser.id) {
    fetchTeamSpaceList()
  }
})

// 监听路由变化，更新当前选中菜单
router.afterEach((to, from, failure) => {
  current.value = [to.path]
})

// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push(key)
}

router.afterEach((to, from, next) => {
  current.value = [to.path]
})
</script>

<style scoped>
#globalHeader .title-bar {
  display: flex;
  align-items: center;
  box-shadow: 4px 0 16px rgba(0, 0, 0, 0.06);
}

#globalSider :deep(.ant-layout-sider) {
  background: none !important;
}

.custom-sider {
  background: white;
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1) 0s;
  overflow: hidden;
  height: 100%;
}

/* 悬停状态 */
:deep(.ant-menu-item:hover),
:deep(.ant-menu-submenu-title:hover) {
  background: rgba(99, 102, 241, 0.05) !important;

  .anticon {
    color: #6366f1;
    transform: scale(1.1);
    filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.1));
  }
}

/* 文字样式 */
:deep(.ant-menu-title-content) {
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  color: #2d3748;
  letter-spacing: 0.3px;
}

/* 菜单项基础样式 */
:deep(.ant-menu-item),
:deep(.ant-menu-submenu-title) {
  height: 48px !important;
  line-height: 48px !important;
  margin: 4px 12px !important;
  border-radius: 8px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* 图标样式 */
:deep(.ant-menu-item .anticon),
:deep(.ant-menu-submenu-title .anticon) {
  font-size: 18px !important;
  color: #64748b;
  transition: all 0.3s ease;
}

/* 选中状态 */
:deep(.ant-menu-item-selected) {
  background: rgba(99, 102, 241, 0.1) !important;

  .anticon {
    color: #6366f1;
    filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.2));
  }

  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 24px;
    background: #6366f1;
    border-radius: 2px;
  }
}

/* 折叠状态样式 */
:deep(.ant-layout-sider-collapsed) {
  .ant-menu-title-content {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .ant-menu-item,
  .ant-menu-submenu-title {
    justify-content: center;
  }

  .anticon {
    margin-right: 0 !important;
    transform: scale(1.2);
  }
}
</style>
