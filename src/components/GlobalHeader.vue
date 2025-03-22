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
          :items="items"
        />
      </a-col>
      <a-col flex="120px">
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            {{ loginUserStore.loginUser.userName ?? '暂无用户名' }}
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
import { h, ref } from 'vue'
import { HomeOutlined } from '@ant-design/icons-vue'
import { MenuProps } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/counter.ts'

const loginUserStore = useLoginUserStore()
const current = ref<string[]>([])
const items = ref<MenuProps['items']>([
  {
    key: '/',
    label: '主页',
    title: '主页',
    icon: () => h(HomeOutlined),
  },
  {
    key: '/about',
    label: '关于',
    title: '关于',
  },
  {
    key: 'others',
    label: h(
      'a',
      { href: 'https://blog.csdn.net/weixin_74879735?type=blog', target: '_blank' },
      '作者博客',
    ),
    title: '作者博客',
  },
])
const router = useRouter()

router.afterEach((to, from, next) => {
  current.value = [to.path]
})

const doMenuClick = ({ key }: any) => {
  console.log(key)
  router.push({
    path: key,
  })
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
