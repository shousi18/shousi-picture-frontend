<template>
  <div id="globalHeader">
    <a-row :wrap="false">
      <a-col flex="200px">
        <router-link to="/">
          <div class="title-bar">
            <img class="logo" src="../../assets/logo.ico" alt="logo" />
            <div class="title">寿司云图库</div>
          </div>
        </router-link>
      </a-col>
      <a-col flex="auto">
        <a-menu
          v-model:selectedKeys="current"
          @click="doMenuClick"
          mode="horizontal"
          :items="menus"
          class="custom-menu"
        />
      </a-col>
      <a-col flex="120px">
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            <a-dropdown>
              <a-space>
                <a-avatar :src="loginUserStore.loginUser.userAvatar" />
                {{ loginUserStore.loginUser.userName ?? '无名' }}
              </a-space>
              <template #overlay>
                <a-menu>
                  <a-menu-item>
                    <router-link to="/user/info">
                      <SettingOutlined />
                      我的信息
                    </router-link>
                  </a-menu-item>
                  <a-menu-item>
                    <router-link to="/my_space">
                      <UserOutlined />
                      我的空间
                    </router-link>
                  </a-menu-item>
                  <a-menu-item>
                    <router-link to="/my_pictures">
                      <UploadOutlined />
                      我的发布
                    </router-link>
                  </a-menu-item>
                  <a-menu-item>
                    <router-link to="/my_message">
                      <MessageOutlined />
                      我的消息
                    </router-link>
                  </a-menu-item>
                  <a-menu-item @click="doLogout">
                    <LogoutOutlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div v-else>
            <a-button class="login-button" type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
import { computed, h, ref } from 'vue'
import { UploadOutlined, LogoutOutlined, UserOutlined, SettingOutlined, MessageOutlined } from '@ant-design/icons-vue'
import { MenuProps, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { userLogoutUsingPost } from '@/api/userController.ts'
import { routes } from '@/router/routes.ts'
import checkAccess from '@/access/checkAccess.ts'

const loginUserStore = useLoginUserStore()
const current = ref<string[]>(['/'])
const router = useRouter()

// 把路由项转换为菜单项
const menuToRouteItem = (item: any) => {
  const isHome = item.path === '/'
  return {
    key: item.path,
    label: item.name,
    title: item.name,
    icon: h(item.meta?.icon) ?? undefined,
    children: item.children?.map((child: any) => menuToRouteItem(child)),
  }
}

// 过滤菜单项
const items = computed(() => {
  return routes
    .filter((item) => {
      if (item?.meta?.hideInMenu) {
        return false
      }
      // 根据权限过滤菜单，有权限则返回 true，则保留该菜单
      return checkAccess(loginUserStore.loginUser, item?.meta?.access as string)
    })
    .map(menuToRouteItem) // 转换为菜单项格式
})

const menus = ref<MenuProps['items']>(items)

router.afterEach((to, from, next) => {
  current.value = [to.path]
})

const doMenuClick = ({ key }: any) => {
  console.log(key)
  router.push({
    path: key,
  })
}

// 用户注销
const doLogout = async () => {
  const res = await userLogoutUsingPost()
  console.log(res)
  if (res.data.code === 0) {
    loginUserStore.setLoginUser({
      userName: '未登录',
    })
    message.success('退出登录成功')
    await router.push('/user/login')
  } else {
    message.error('退出登录失败，' + res.data.message)
  }
}
</script>

<style scoped>
#globalHeader .title-bar {
  display: flex;
  align-items: center;
}

/* 优化LOGO区域 */
.title-bar {
  padding-left: 24px;
  transition: transform 0.2s ease;

  /* 新的悬停效果：放大+轻微旋转 */
  &:hover {
    transform: scale(1.05)
  }

  .logo {
    width: 40px; /* 适当缩小尺寸 */
    height: 40px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .title {
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
    color: #2d3748;
    font-size: 20px;
    letter-spacing: 0.5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
}

.logo {
  width: 56px;
  height: 56px;
}

/* 登录按钮样式 */
.login-button {
  height: 36px;
  padding: 0 20px;
  border-radius: 18px;
  background: linear-gradient(135deg, #ff8e53 0%, #ff6b6b 100%);
  border: none;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(255, 107, 107, 0.3);
  }

  &:active {
    transform: translateY(1px);
  }

  .button-content {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  :deep(.anticon) {
    font-size: 15px;
  }
}

/* 顶部导航菜单样式 */
:deep(.custom-menu) {
  background: transparent;
  border-bottom: none;
  line-height: 60px;

  .ant-menu-item {
    padding: 0 24px;
    margin: 0 4px;
    border-radius: 8px;
    color: #aa5510;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &::after {
      display: none !important;
    }

    /* 未选中状态的图标 */

    .anticon {
      margin-right: 8px;
      transition: all 0.3s ease;
    }

    /* 悬浮状态 */

    &:hover {
      color: #ff8e53;
      background: #fff6f3;

      .anticon {
        color: #ff8e53 !important;
        filter: drop-shadow(0 2px 4px rgba(255, 142, 83, 0.3)) !important;
      }
    }

    /* 选中状态 */

    &.ant-menu-item-selected {
      color: #ff8e53;
      background: #fff6f3;
      font-weight: 500;

      .anticon {
        color: #ff8e53 !important;
        filter: drop-shadow(0 2px 4px rgba(255, 142, 83, 0.3)) !important;
      }
    }
  }

  /* 子菜单样式 */

  .ant-menu-submenu {
    padding: 0 16px;
    margin: 0 4px;
    color: #0b1976;

    &::after {
      display: none !important;
    }

    /* 悬浮状态 */

    &:hover {
      color: #ff8e53;
      background: #fff6f3;

      .anticon {
        color: #ff8e53 !important;
        filter: drop-shadow(0 2px 4px rgba(255, 142, 83, 0.3)) !important;
      }
    }

    /* 选中状态 */

    &.ant-menu-submenu-selected {
      color: #ff8e53;
      background: #fff6f3;

      .anticon {
        color: #ff8e53 !important;
        filter: drop-shadow(0 2px 4px rgba(255, 142, 83, 0.3)) !important;
      }
    }

    /* 展开状态 */

    &.ant-menu-submenu-open {
      color: #ff8e53;
      background: #fff6f3;

      .anticon {
        color: #ff8e53 !important;
        filter: drop-shadow(0 2px 4px rgba(255, 142, 83, 0.3)) !important;
      }
    }
  }
}
</style>
