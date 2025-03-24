<template>
  <div id="globalHeader">
    <a-row :wrap="false">
      <a-col flex="200px">
        <router-link to="/">
          <div class="title-bar">
            <img class="logo" src="../assets/logo.ico" alt="logo" />
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
                  <a-menu-item @click="doLogout">
                    <LogoutOutlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div v-else>
            <a-button type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
import { computed, h, ref } from 'vue'
import { HomeOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import { MenuProps, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { userLogoutUsingPost } from '@/api/userController.ts'
import { routes } from '@/router/routes.ts'
import checkAccess from '@/access/checkAccess.ts'

const loginUserStore = useLoginUserStore()
const current = ref<string[]>(["/"])
const router = useRouter()

// 把路由项转换为菜单项
const menuToRouteItem = (item: any) => {
  const isHome = (item.path === '/')
  return {
    key: item.path,
    label: item.name,
    title: item.name,
    icon: isHome ? h(item.meta?.icon ?? HomeOutlined) : undefined, // 仅在主页路径时显示 icon
  }
}

// 过滤菜单项
const items = computed(() => {
  return routes
    .filter((item) => {
      if (item.meta?.hideInMenu) {
        return false
      }
      // 根据权限过滤菜单，有权限则返回 true，则保留该菜单
      return checkAccess(loginUserStore.loginUser, item.meta?.access as string)
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

.title {
  color: black;
  font-size: 18px;
  margin-left: 16px;
}

.logo {
  width: 56px;
  height: 56px;
}
</style>
