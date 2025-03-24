import type { RouteRecordRaw } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import { HomeOutlined } from '@ant-design/icons-vue'
import UserLoginPage from '@/pages/user/UserLoginPage.vue'
import UserRegisterPage from '@/pages/user/UserRegisterPage.vue'
import UserManagePage from '@/pages/admin/UserManagePage.vue'
import ACCESS_ENUM from '@/access/accessEnum.ts'
import { h } from 'vue'


export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: '主页',
    component: HomePage,
    meta: {
      icon: () => h(HomeOutlined),
    },
  },
  {
    path: '/user/login',
    name: '用户登录',
    component: UserLoginPage,
    meta: {
      hideInMenu: true,
    },
  },
  {
    path: '/user/register',
    name: '用户注册',
    component: UserRegisterPage,
    meta: {
      hideInMenu: true,
    },
  },
  {
    path: '/admin/userManage',
    name: '用户管理',
    component: UserManagePage,
    meta: {
      access: ACCESS_ENUM.ADMIN,
    },
  },
]
